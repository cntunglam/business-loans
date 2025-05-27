import {
  LoanResponseStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  Prisma,
  UserRoleEnum,
} from '@roshi/shared';
import { z } from 'zod';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';
import { createLoanOfferSchema } from '../controllers/v1/loanOffer.controller';
import { isCompanyFrozen } from './company.service';
import { formatLenderForBorrower } from './lender.service';
import { sendNotification } from './notification.service';

export const createLoanResponse = async (
  companyId: string,
  loanResponse: z.infer<typeof createLoanOfferSchema> & { acceptedAt?: Date },
  isAuto?: boolean,
) => {
  //Check company
  if (await isCompanyFrozen(companyId)) {
    throw new Error('Company is frozen');
  }
  const response = await prismaClient.loanResponse.create({
    data: {
      status: loanResponse.status,
      comment: loanResponse.comment,
      lenderId: companyId,
      loanRequestId: loanResponse.loanRequestId,
      isAuto: isAuto,
      rejectionReasons: loanResponse?.rejectionReasons || [],
      acceptedAt: loanResponse.acceptedAt || null,
      loanOffer:
        loanResponse.status === LoanResponseStatusEnum.ACCEPTED && loanResponse.offer
          ? {
              create: {
                ...loanResponse.offer,
              },
            }
          : undefined,
    },
    include: { loanOffer: true, loanRequest: { select: { user: { select: { email: true } } } } },
  });

  //if it's an AUTO_IPA, we need to notify the lender
  if (isAuto) {
    await sendNotification({
      notificationType: NotificationTypeEnum.AUTO_IPA,
      payload: {
        loanRequestId: loanResponse.loanRequestId,
        loanResponseId: response.id,
      },
      targetType: UserRoleEnum.LENDER,
      companyId: companyId,
    });
  }

  //Notify borrower. Grouping of offers will be handled later
  if (loanResponse.status === LoanResponseStatusEnum.ACCEPTED) {
    await sendNotification(
      {
        notificationType: NotificationTypeEnum.OFFER_RECEIVED,
        targetType: UserRoleEnum.BORROWER,
        recipientEmail: response.loanRequest.user.email,
        payload: {
          loanRequestId: loanResponse.loanRequestId,
          loanResponseId: response.id,
        },
        transport: NotificationTransportEnum.EMAIL,
      },
      { startAfter: CONFIG.NOTIFICATION_BATCHING_WINDOW_MINUTES * 60 },
    );
  }

  return response;
};

export const getLoanResponse = (loanResponseId: string) => {
  return prismaClient.loanResponse.findUniqueOrThrow({
    where: { id: loanResponseId },
    include: { loanOffer: true, lender: { select: { name: true } } },
  });
};

export const formatLoanResponseForBorrower = (
  loanResponse: Prisma.LoanResponseGetPayload<{
    include: {
      loanOffer: true;
      lender: {
        include: {
          stores: {
            select: {
              ratings: true;
            };
          };
        };
      };
      appointment: { include: { openingHours: { include: { store: true } } } };
    };
  }>,
) => {
  return {
    id: loanResponse.id,
    loanRequestId: loanResponse.loanRequestId,
    status: loanResponse.status,
    acceptedAt: loanResponse.acceptedAt,
    outcomeStatus: loanResponse.outcomeStatus,
    lender: formatLenderForBorrower(loanResponse.lender, !!loanResponse.acceptedAt),
    lenderId: loanResponse.lenderId,
    loanOffer: loanResponse.loanOffer,
    appointment: loanResponse.appointment,
    createdAt: loanResponse.createdAt,
    updatedAt: loanResponse.updatedAt,
  };
};
