import { ApplicationStepsEnum, getPhoneSchema, JobsEnum, LoanRequestTypeEnum } from '@roshi/shared';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { createJob } from '../../jobs/boss';
import { ApplicationSteps, loanRequestTypeToSteps } from '../../services/applicationSteps.service';
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
  referrer: z.string().optional(),
});

export const initializeVisitor = async (req: Request, res: Response) => {
  let { visitorId, loanRequestType, referrer } = initializeVisitorSchema.parse(req.body);
  const userId = req.user?.sub;
  if (!visitorId) {
    visitorId = randomUUID();
  }
  const newVisitor = await prismaClient.visitorData.upsert({
    where: { id: visitorId, loanRequestType },
    update: {
      lastActiveAt: new Date(),
      referrer: referrer || undefined,
    },
    create: {
      id: visitorId,
      lastActiveAt: new Date(),
      userId,
      loanRequestType,
      referrer,
    },
  });
  let steps = loanRequestTypeToSteps[loanRequestType as LoanRequestTypeEnum];
  return successResponse(res, { steps, visitor: newVisitor });
};

export const saveStepProgressHandler = async (req: Request, res: Response) => {
  const { visitorId, stepKey, data } = saveStepSchema.parse(req.body);
  const visitor = await prismaClient.visitorData.findUnique({ where: { id: visitorId } });
  if (!visitor) {
    throw new Error('Visitor not found');
  }
  const stepValidator = ApplicationSteps[stepKey];
  const stepSettings = loanRequestTypeToSteps[visitor?.loanRequestType as LoanRequestTypeEnum].find(
    (step) => step.key === stepKey,
  )?.settings;
  const validation = stepValidator.validation(data, stepSettings as any);

  if (!visitor.hasOwnProperty(stepKey)) {
    throw new Error('Step not found');
  }
  await prismaClient.visitorData.update({
    where: { id: visitorId },
    data: {
      [stepKey]: validation,
      currentStep: stepKey,
      lastActiveAt: new Date(),
    },
  });
  const updatedVisitor = await prismaClient.visitorData.findUnique({
    where: { id: visitorId },
  });
  return successResponse(res, updatedVisitor);
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

  await prismaClient.visitorData.update({
    where: { id: visitorId },
    data: {
      phoneNumber: phone,
      currentStep: ApplicationStepsEnum.phoneNumber,
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
  const visitor = await prismaClient.visitorData.findUniqueOrThrow({
    where: { id: visitorId },
  });
  if (!visitor.currentStep) {
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
    if (visitor)
      stepDataMap[stepKey] = visitor.hasOwnProperty(stepKey) ? visitor[stepKey as keyof typeof visitor] : undefined;
  });
  const user = await prismaClient.user.findFirstOrThrow({ where: { id: req.user!.sub } });

  const {
    phoneNumber,
    fullName,
    cccdNumber,
    email,
    dateOfBirth,
    monthlyIncome,
    hasLaborContract,
    employmentType,
    currentAddress,
    residencyStatus,
  } = visitor;

  const applicantInfo = {
    fullName: fullName!,
    phoneNumber: phoneNumber!,
    cccdNumber: cccdNumber!,
    email: email!,
    dateOfBirth: dateOfBirth!,
    monthlyIncome: monthlyIncome!,
    hasLaborContract: hasLaborContract!,
    employmentType: employmentType!,
    currentAddress: currentAddress!,
    residencyStatus: residencyStatus,
  };

  const combinedData: z.infer<typeof createLoanRequestSchema> = {
    amount: stepDataMap[ApplicationStepsEnum.borrowAmount],
    term: stepDataMap[ApplicationStepsEnum.borrowPeriod],
    purpose: stepDataMap[ApplicationStepsEnum.borrowPurpose],
    type: visitor.loanRequestType as LoanRequestTypeEnum,
    referrer: visitor.referrer || undefined,
    applicantInfo,
  };

  const createdLoanRequest = await createNewLoanRequest(combinedData, req.user!.sub, override);
  createJob(JobsEnum.SYNC_TO_ZOHO, { applicantInfoId: createdLoanRequest.applicantInfoId || undefined });

  await prismaClient.visitorData.update({
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
      name: combinedData.applicantInfo.fullName,
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
