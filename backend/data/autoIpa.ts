import { LoanResponseStatusEnum, Prisma } from '@roshi/shared';
import { z } from 'zod';
import { createLoanOfferSchema } from '../controllers/v1/loanOffer.controller';
import { roundUpToThousand } from '../utils/utils';

type IpaResponse = Omit<z.infer<typeof createLoanOfferSchema>, 'loanRequestId'> | null;

type LoanRequestAdmin = Prisma.LoanRequestGetPayload<{ include: { applicantInfo: true } }>;

export const getTestIPA = (loanRequest: LoanRequestAdmin): IpaResponse => {
  const companyId = '01f05c4f-c075-4595-8252-a8ce2d76f17a';
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
  const companyId = '02dcb377-4e42-4805-a2ba-7a1284261b22';
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
