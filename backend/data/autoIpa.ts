import { LoanResponseStatusEnum, Prisma } from '@roshi/shared';
import { z } from 'zod';
import { createLoanOfferSchema } from '../controllers/v1/loanOffer.controller';
import { roundUpToThousand } from '../utils/utils';

type IpaResponse = Omit<z.infer<typeof createLoanOfferSchema>, 'loanRequestId'> | null;

type LoanRequestAdmin = Prisma.LoanRequestGetPayload<{ include: { applicantInfo: true } }>;

export const getTestIPA = (loanRequest: LoanRequestAdmin): IpaResponse => {
  const companyId = '000c6655-0e74-4f74-b1d5-07e7845e1b32';
  if (!loanRequest.applicantInfo) return null;
  const offerInfo = (() => {
    return { amount: 5000000, interest: 3.88, term: 12 };
  })();
  return {
    status: LoanResponseStatusEnum.ACCEPTED,
    companyId,
    offer: {
      amount: roundUpToThousand(Math.min(loanRequest.amount, offerInfo.amount)),
      term: Math.min(loanRequest.term, offerInfo.term),
      monthlyInterestRate: offerInfo.interest,
      variableUpfrontFees: 10,
      fixedUpfrontFees: 0,
    },
  };
};
