import { ApplicationStepsEnum, getPhoneSchema, LoanRequestTypeEnum, SingpassData } from '@roshi/shared';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { getUserSingpassData } from '../../services/account.service';
import { ApplicationSteps, loanRequestTypeToSteps, SingpassSkipFields } from '../../services/applicationSteps.service';
import { createLoanRequestSchema, createNewLoanRequest } from '../../services/loanRequest.service';
import { sendOtpToWhatsapp } from '../../services/otp.service';
import { successResponse } from '../../utils/successResponse';

export const saveStepSchema = z.object({
  visitorId: z.string(),
  stepKey: z.nativeEnum(ApplicationStepsEnum),
  data: z.unknown(),
});

export const initializeVisitorSchema = z.object({
  visitorId: z.string().optional(),
  loanRequestType: z.string(),
  referer: z.string().optional(),
});

export const initializeVisitor = async (req: Request, res: Response) => {
  let { visitorId, loanRequestType, referer } = initializeVisitorSchema.parse(req.body);
  const userId = req.user?.sub;

  if (!visitorId) {
    visitorId = randomUUID();
  }

  const newVisitor = await prismaClient.visitorDataV2.upsert({
    where: { id: visitorId, loanRequestType },
    update: {
      lastActiveAt: new Date(),
      referer: referer || undefined,
    },
    create: {
      id: visitorId,
      lastActiveAt: new Date(),
      userId,
      loanRequestType,
      referer,
    },
    include: { stepData: true },
  });

  let steps = loanRequestTypeToSteps[loanRequestType as LoanRequestTypeEnum];
  let singpassData: SingpassData | null = null;
  // User is most likely to have most recent singpass data
  if (userId) {
    try {
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        include: {
          singpassData: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (user && user.singpassData.length > 0) {
        singpassData = user.singpassData[0].data as SingpassData;
        await prismaClient.visitorDataV2.update({
          where: { id: visitorId },
          data: {
            singpassData: singpassData as any,
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  } else if (newVisitor.singpassData) {
    singpassData = newVisitor.singpassData as SingpassData;
  }

  steps = steps.filter((s) => {
    if (s.fixedValue) return false;
    if (singpassData && s.key in SingpassSkipFields) {
      return !SingpassSkipFields[s.key as keyof typeof SingpassSkipFields](singpassData as SingpassData);
    }
    return true;
  });

  return successResponse(res, { steps, visitor: { ...newVisitor, singpassData: singpassData as any } });
};

export const saveStepProgressHandler = async (req: Request, res: Response) => {
  const { visitorId, stepKey, data } = saveStepSchema.parse(req.body);

  const visitor = await prismaClient.visitorDataV2.findUnique({ where: { id: visitorId } });

  const stepValidator = ApplicationSteps[stepKey];
  const stepSettings = loanRequestTypeToSteps[visitor?.loanRequestType as LoanRequestTypeEnum].find(
    (step) => step.key === stepKey,
  )?.settings;
  const validation = stepValidator.validation(data, stepSettings as any);

  await prismaClient.$transaction(async (tx) => {
    // Save step data with proper typing
    await tx.stepData.upsert({
      where: {
        visitorId_stepKey: {
          visitorId,
          stepKey,
        },
      },
      update: {
        data: validation,
        isValid: true,
        validatedAt: new Date(),
      },
      create: {
        visitorId,
        stepKey,
        data: validation,
        isValid: true,
        validatedAt: new Date(),
      },
    });

    // Update visitor progress
    await tx.visitorDataV2.update({
      where: { id: visitorId },
      data: {
        currentStep: stepKey,
        lastActiveAt: new Date(),
      },
    });
  });

  // Return updated visitor data with steps
  const visitorWithSteps = await prismaClient.visitorDataV2.findUnique({
    where: { id: visitorId },
    include: { stepData: true },
  });

  return successResponse(res, visitorWithSteps);
};

export const handleSubmitPhoneSchema = z.object({
  phone: getPhoneSchema(),
  visitorId: z.string(),
});
export const handleSubmitPhone = async (req: Request, res: Response) => {
  const { phone, visitorId } = handleSubmitPhoneSchema.parse(req.body);

  const user = await prismaClient.user.findUnique({
    where: {
      phone: phone,
    },
  });
  if (user) {
    await sendOtpToWhatsapp(user);
    return successResponse(res, { exists: true });
  }

  await prismaClient.stepData.upsert({
    where: {
      visitorId_stepKey: {
        visitorId,
        stepKey: ApplicationStepsEnum.phoneNumber,
      },
    },
    create: {
      data: phone,
      isValid: true,
      visitorId,
      stepKey: ApplicationStepsEnum.phoneNumber,
    },
    update: {
      data: phone,
      isValid: true,
    },
  });

  return successResponse(res, { exists: false });
};

export const handleFinalizeSchema = z.object({
  visitorId: z.coerce.string(),
  override: z.coerce.boolean().optional(),
  affiliateVisitorId: z.coerce.string().optional(),
});
export const finalizeLoanRequestHandler = async (req: Request, res: Response) => {
  const { visitorId, override, affiliateVisitorId } = handleFinalizeSchema.parse(req.body);

  const visitor = await prismaClient.visitorDataV2.findUniqueOrThrow({
    where: { id: visitorId },
    include: { stepData: true },
  });

  if (visitor.stepData.length === 0) {
    throw new Error('No step data found');
  }

  const requiredSteps = loanRequestTypeToSteps[visitor.loanRequestType as LoanRequestTypeEnum];

  const stepDataMap: Record<string, any> = {};
  requiredSteps.forEach((data) => {
    const stepKey = data.key;
    if (data.fixedValue) {
      stepDataMap[data.key] = data.fixedValue;
      return;
    }
    const value = visitor.stepData.find((sd) => sd.stepKey === stepKey);
    if (value) stepDataMap[stepKey] = value.data;
  });

  const user = await prismaClient.user.findFirstOrThrow({ where: { id: req.user!.sub } });

  const userSingpassData = await getUserSingpassData(req.user!.sub);
  const singpassData = userSingpassData || (visitor.singpassData ? (visitor.singpassData as SingpassData) : undefined);

  if (singpassData) {
    Object.keys(SingpassSkipFields).forEach((key) => {
      if (stepDataMap[key]) return;
      stepDataMap[key] = SingpassSkipFields[key as keyof typeof SingpassSkipFields](singpassData);
    });
  }

  const phoneNumber =
    (visitor.stepData.find((sd) => sd.stepKey === ApplicationStepsEnum.phoneNumber)?.data as string) || user.phone;

  const applicantInfo = {
    ...stepDataMap[ApplicationStepsEnum.existingLoans],
    ...stepDataMap[ApplicationStepsEnum.occupation],
    ...stepDataMap[ApplicationStepsEnum.occupationTime],
    ...stepDataMap[ApplicationStepsEnum.propertyOwnership],
    age: stepDataMap[ApplicationStepsEnum.age],
    nric: stepDataMap[ApplicationStepsEnum.nricNumber],
    residencyStatus: stepDataMap[ApplicationStepsEnum.residencyStatus],
    monthlyIncome: stepDataMap[ApplicationStepsEnum.monthlyIncome],
    fullname: stepDataMap[ApplicationStepsEnum.fullName],
    phoneNumber: phoneNumber,
  };

  const combinedData: z.infer<typeof createLoanRequestSchema> = {
    amount: stepDataMap[ApplicationStepsEnum.borrowAmount],
    term: stepDataMap[ApplicationStepsEnum.borrowPeriod],
    purpose: stepDataMap[ApplicationStepsEnum.borrowPurpose],
    type: visitor.loanRequestType as LoanRequestTypeEnum,
    referer: visitor.referer || undefined,
    applicantInfo,
  };

  const createdLoanRequest = await createNewLoanRequest(combinedData, singpassData || null, req.user!.sub, override);

  await prismaClient.visitorDataV2.update({
    where: { id: visitorId },
    data: {
      isCompleted: true,
      userId: createdLoanRequest.userId,
    },
  });

  await prismaClient.user.update({
    where: { id: user.id },
    data: {
      phone: phoneNumber,
      name: combinedData.applicantInfo.fullname,
    },
  });

  if (affiliateVisitorId) {
    await prismaClient.affiliateVisitor.update({
      where: { id: affiliateVisitorId },
      data: {
        userId: user.id,
        loanRequestId: createdLoanRequest.id,
      },
    });
  }

  return successResponse(res, { success: true, loanRequestId: createdLoanRequest.id });
};
