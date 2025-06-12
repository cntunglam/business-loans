import { LoanRequestStatusEnum, LoanResponseStatusEnum, StatusEnum } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';

export const GetStats = async () => {
  const startDate = '2025-04-01T00:00:00.000Z';
  const endDate = '2025-04-30T23:59:59.999Z';
  const loanRequests = await prismaClient.loanRequest.findMany({
    include: {
      loanResponses: { include: { appointment: true } },
    },
    where: {
      isAutoReapply: false,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const closedLoanResponses = await prismaClient.loanResponse.findMany({
    where: {
      outcomeStatus: StatusEnum.APPROVED,
      closedDealOffer: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
  });

  console.log('Total loan requests: ', loanRequests.length);

  console.log('Withdrawn/Deleted: ', loanRequests.filter((lr) => lr.status === LoanRequestStatusEnum.DELETED).length);

  console.log(
    'No IPA ',
    loanRequests.filter((lr) => lr.loanResponses.every((lr) => lr.status === LoanResponseStatusEnum.REJECTED)).length,
  );
  console.log('With appointments: ', loanRequests.filter((lr) => lr.loanResponses.some((lr) => lr.appointment)).length);

  console.log('Won: ', closedLoanResponses.length);
};

GetStats();
