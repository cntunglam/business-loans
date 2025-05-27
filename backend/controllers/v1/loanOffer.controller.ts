import { ERROR_KEYS, StatusEnum } from '@roshi/shared';
import {
  ActivityLogEnum,
  LoanResponseStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  TargetTypeEnum,
  UserRoleEnum,
} from '@roshi/shared/models/databaseEnums';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { createActivityLog } from '../../services/activityLog.service';
import { verifyLenderAccess } from '../../services/loanRequest.service';
import { createLoanResponse } from '../../services/loanResponse.service';
import { sendNotification } from '../../services/notification.service';
import { checkAndNotifyLowerAmount } from '../../services/notifications/lowerAmountNotification.service';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';

const getLoanOfferSchema = (minAmount: number) => {
  return z.object({
    amount: z.coerce
      .number()
      .int()
      .min(minAmount, { message: `Offer amount must be greater than ${minAmount}` }),
    term: z.coerce.number().int().positive(),
    monthlyInterestRate: z.coerce.number().nonnegative(),
    fixedUpfrontFees: z.coerce.number().nonnegative(),
    variableUpfrontFees: z.coerce.number().nonnegative(),
  });
};

export const createLoanOfferSchema = z.object({
  loanRequestId: z.string(),
  companyId: z.string().optional(),
  comment: z.string().optional(),
  status: z.nativeEnum(LoanResponseStatusEnum),
  offer: getLoanOfferSchema(1000).optional(),
  rejectionReasons: z.array(z.string()).optional(),
});

export const createLoanOfferHandler = async (req: Request, res: Response) => {
  const parsedBody = createLoanOfferSchema.parse(req.body);
  const { loanRequest: application, company } = await verifyLenderAccess(req.user, parsedBody.loanRequestId);
  if (!company) return errorResponse(res, 401, ERROR_KEYS.COMPANY_NOT_FOUND);
  const targetCompanyId = parsedBody.companyId || company.id;
  if (company.id !== targetCompanyId && !req.hasCustomerSupportPermissions)
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);

  const comp = parsedBody.companyId
    ? await prismaClient.company.findUniqueOrThrow({ where: { id: parsedBody.companyId } })
    : company;

  if (application.loanResponses.filter((lr) => lr.lenderId === comp.id).length > 0)
    return errorResponse(res, 400, ERROR_KEYS.ONLY_ONE_OFFER_PER_APPLICATION);
  if (parsedBody.status === LoanResponseStatusEnum.ACCEPTED && !parsedBody.offer)
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR);
  if (parsedBody.status === LoanResponseStatusEnum.REJECTED && !parsedBody.rejectionReasons)
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR);

  const response = await createLoanResponse(comp.id, parsedBody);

  if (parsedBody.status === LoanResponseStatusEnum.ACCEPTED) {
    // create activity log - OFFER_SET
    createActivityLog({
      userId: req.user?.sub || '',
      loanRequestId: response.loanRequestId || '',
      activityType: ActivityLogEnum.OFFER_SET,
      targetType: TargetTypeEnum.LOAN_RESPONSE,
      targetId: response.id,
    });
  }

  return successResponse(res, response);
};

export const deleteLoanOffer = async (req: Request, res: Response) => {
  const user = await prismaClient.user.findUnique({ where: { id: req.user?.sub } });
  const loanResponse = await prismaClient.loanResponse.findUniqueOrThrow({
    include: { loanOffer: true, appointment: true },
    where: { id: req.params.id },
  });
  if (loanResponse.lenderId !== user?.companyId && !req.hasCustomerSupportPermissions)
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);
  if (loanResponse.acceptedAt) return errorResponse(res, 400, ERROR_KEYS.CANNOT_UPDATE_ACCEPTED_OFFER);
  //Make sure lender of that offer is the user
  const deleted = await prismaClient.loanResponse.delete({ where: { id: req.params.id } });

  return successResponse(res, deleted);
};

export const closeLoanOfferSchema = z.object({
  id: z.string().optional(),
  loanRequestId: z.string().optional(),
  outcomeStatus: z.nativeEnum(StatusEnum),
  outcomeComment: z.string().optional(),
  disbursementDate: z.string().pipe(z.coerce.date()).optional(),
  closedDealOffer: getLoanOfferSchema(100).optional(),
  rejectionReasons: z.array(z.string()).optional(),
});

export const closeLoanOffer = async (req: Request, res: Response) => {
  const body = closeLoanOfferSchema.parse(req.body);

  let responseId = req.params.id;
  let loanRequestId = req.body.loanRequestId;
  if (!responseId && loanRequestId) {
    const { loanRequest } = await verifyLenderAccess(req.user, loanRequestId);
    if (!loanRequest || !loanRequest.loanResponses.length) return errorResponse(res, 400, ERROR_KEYS.NOT_FOUND);
    responseId = loanRequest.loanResponses[0].id;
  }

  if (
    body.outcomeStatus === StatusEnum.REJECTED &&
    !body.outcomeComment &&
    (!body.rejectionReasons || !body.rejectionReasons.length)
  )
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR);
  if (body.outcomeStatus === StatusEnum.APPROVED && !body.closedDealOffer)
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR);

  if (!req.hasCustomerSupportPermissions && !req.user?.companyId)
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);

  const loanResponse = await prismaClient.loanResponse.findUniqueOrThrow({
    where: { id: responseId },
    include: { loanRequest: { select: { user: { select: { phone: true } } } } },
  });

  if (!loanRequestId) loanRequestId = loanResponse.loanRequestId;

  if (!req.hasCustomerSupportPermissions && (loanResponse.lenderId !== req.user?.companyId || !loanResponse.acceptedAt))
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);

  await prismaClient.$transaction(async (tx) => {
    const updated = await tx.loanResponse.update({
      where: {
        id: responseId,
      },
      data: {
        outcomeStatus: body.outcomeStatus,
        comment: body.outcomeComment,
        closedDealOffer: body.outcomeStatus === StatusEnum.APPROVED ? { create: body.closedDealOffer! } : undefined,
        rejectionReasons: body.rejectionReasons || [],
        ...(body.disbursementDate && { disbursementDate: body.disbursementDate }),
      },
    });

    return updated;
  });

  createActivityLog({
    userId: req.user?.sub || '',
    loanRequestId: loanResponse.loanRequestId || '',
    activityType:
      body.outcomeStatus === StatusEnum.APPROVED ? ActivityLogEnum.OFFER_APPROVED : ActivityLogEnum.OFFER_REJECTED,
    targetType: TargetTypeEnum.LOAN_RESPONSE,
    targetId: loanResponse.id,
  });

  if (body.outcomeStatus === StatusEnum.APPROVED) {
    sendNotification(
      {
        notificationType: NotificationTypeEnum.REVIEW_LINK,
        payload: { loanRequestId: loanResponse.loanRequestId },
        targetType: UserRoleEnum.BORROWER,
        transport: NotificationTransportEnum.WHATSAPP,
        phoneNumber: loanResponse.loanRequest.user.phone || '',
      },
      { startAfter: CONFIG.SEND_REVIEW_LINK_AFTER_MINUTES * 60 },
    );

    await checkAndNotifyLowerAmount(responseId);
  }

  return successResponse(res, loanResponse);
};

export const removeOutcomeHandler = async (req: Request, res: Response) => {
  const responseId = req.params.id;
  if (!responseId) return errorResponse(res, 400, ERROR_KEYS.BAD_REQUEST);

  const loanResponse = await prismaClient.loanResponse.findUniqueOrThrow({
    where: { id: responseId },
    select: { id: true, outcomeStatus: true, updatedAt: true, loanRequestId: true },
  });

  if (loanResponse.outcomeStatus === StatusEnum.PENDING) {
    return errorResponse(res, 400, ERROR_KEYS.BAD_REQUEST);
  }

  const timeDifference = new Date().getTime() - new Date(loanResponse.updatedAt).getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  if (timeDifference > twentyFourHours) {
    return errorResponse(res, 403, ERROR_KEYS.TIME_EXCEEDED_24H_UPDATE);
  }

  const updatedLoanResponse = await prismaClient.loanResponse.update({
    where: { id: responseId },
    data: { outcomeStatus: StatusEnum.PENDING },
  });

  await createActivityLog({
    userId: req.user?.sub || '',
    loanRequestId: loanResponse.loanRequestId || '',
    activityType: ActivityLogEnum.REMOVE_OUTCOME,
    targetType: TargetTypeEnum.LOAN_RESPONSE,
    targetId: responseId,
  });

  return successResponse(res, updatedLoanResponse);
};
