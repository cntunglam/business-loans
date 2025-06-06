import { LoanResponseStatusEnum, Prisma } from '@roshi/shared';
import { z } from 'zod';
import { createLoanOfferSchema } from '../controllers/v1/loanOffer.controller';
import { roundUpToThousand } from '../utils/utils';

type IpaResponse = Omit<z.infer<typeof createLoanOfferSchema>, 'loanRequestId'> | null;

type LoanRequestAdmin = Prisma.LoanRequestGetPayload<{ include: { applicantInfo: true } }>;

export const getTestIPA = (loanRequest: LoanRequestAdmin): IpaResponse => {
  const companyId = '0876334d-3498-485a-a85f-35622562aa45';
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
  const companyId = '0889275d-1c00-459e-b41f-9ef3ef567008';
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
