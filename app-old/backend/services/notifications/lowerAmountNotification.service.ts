import {
  LoanResponse,
  LoanResponseStatusEnum,
  NotificationStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  StatusEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { loanOffersToText } from '../../data/messageTemplates/messageTemplates';
import { sendNotification } from '../notification.service';
import { generateBookingUrl } from '../shortUrl.service';

type AvailableOffer = LoanResponse & {
  lender: { name: string };
  loanOffer: { amount: number; monthlyInterestRate: number; term: number } | null;
};

export const checkAndNotifyLowerAmount = async (loanResponseId: string): Promise<void> => {
  const loanResponse = await fetchLoanResponse(loanResponseId);
  if (!loanResponse) return;
  const { loanRequest } = loanResponse;
  const requestedAmount = loanRequest.amount;

  const totalDisbursedAmount = loanRequest.loanResponses.reduce(
    (sum, response) => sum + (response.closedDealOffer?.amount || 0),
    0,
  );
  const difference = requestedAmount - totalDisbursedAmount;
  if (difference < 1000) return;

  const availableOffers = await fetchAvailableOffers(loanRequest.id);
  const formattedOffers = formatOffersForNotification(availableOffers);
  const bookingUrl = await generateBookingUrl(loanRequest.user.id);

  await sendNotification(
    {
      notificationType: NotificationTypeEnum.LOWER_AMOUNT_DISBURSED,
      payload: {
        loanRequestId: loanRequest.id,
        status: NotificationStatusEnum.PENDING,

        name: loanRequest.user.name || 'there',
        lender: loanResponse.lender.name,
        requestedAmount: requestedAmount.toString(),
        disbursedAmount: totalDisbursedAmount.toString(),
        offers: formattedOffers,
        bookingUrl,
      } as any,

      targetType: UserRoleEnum.BORROWER,
      transport: NotificationTransportEnum.WHATSAPP,
      phoneNumber: loanRequest.user.phone || '',
    },
    { startAfter: 0 },
  );
};

const fetchLoanResponse = async (id: string) => {
  const loanResponse = await prismaClient.loanResponse.findUnique({
    where: { id },
    include: {
      loanRequest: {
        include: {
          user: true,
          loanResponses: {
            where: { outcomeStatus: StatusEnum.APPROVED },
            include: { closedDealOffer: true },
          },
        },
      },
      lender: true,
      closedDealOffer: true,
    },
  });
  if (!loanResponse || !loanResponse?.closedDealOffer || loanResponse.outcomeStatus !== StatusEnum.APPROVED) {
    return null;
  }
  return loanResponse;
};

const fetchAvailableOffers = (loanRequestId: string) => {
  return prismaClient.loanResponse.findMany({
    where: {
      loanRequestId,
      outcomeStatus: StatusEnum.PENDING,
      status: LoanResponseStatusEnum.ACCEPTED,
    },
    include: {
      lender: { select: { name: true } },
      loanOffer: true,
    },
  });
};

const formatOffersForNotification = (offers: AvailableOffer[]) => {
  const topOffers = offers
    .map((offer) => ({
      lenderName: offer.lender.name,
      amount: offer.loanOffer?.amount || 0,
      interestRate: offer.loanOffer?.monthlyInterestRate || 0,
      tenure: offer.loanOffer?.term || 0,
    }))
    .sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      if (a.interestRate !== b.interestRate) return a.interestRate - b.interestRate;
      return b.tenure - a.tenure;
    })
    .slice(0, 3)
    .map((o) => ({
      ...o,
      amount: o.amount.toString(),
      interestRate: o.interestRate.toString(),
      tenure: o.tenure.toString(),
    }));
  return loanOffersToText(topOffers);
};
