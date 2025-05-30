import { LoanResponseStatusEnum, Prisma } from '@roshi/shared';
import { z } from 'zod';
import { createLoanOfferSchema } from '../controllers/v1/loanOffer.controller';
import { roundUpToThousand } from '../utils/utils';

type IpaResponse = Omit<z.infer<typeof createLoanOfferSchema>, 'loanRequestId'> | null;

type LoanRequestAdmin = Prisma.LoanRequestGetPayload<{ include: { applicantInfo: true } }>;

export const getTestIPA = (loanRequest: LoanRequestAdmin): IpaResponse => {
  const companyId = '02e4d488-0b6d-4337-a8db-ba33527c093a';
  if (!loanRequest.applicantInfo) return null;
  const offerInfo = (() => {
    return { amount: 25000000, interest: 3.88, term: 12 };
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

export const getTest1IPA = (loanRequest: LoanRequestAdmin): IpaResponse => {
  const companyId = '067d6316-dcc2-448a-8a43-3c6ba84fb8a0';
  if (!loanRequest.applicantInfo) return null;
  const offerInfo = (() => {
    return { amount: 50000000, interest: 4.88, term: 6 };
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
