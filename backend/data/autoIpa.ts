import {
  employmentStatusesEnum,
  EmploymentTimeEnum,
  LoanResponseStatusEnum,
  Prisma,
  propertyOwnershipsEnum,
  residencyStatusesEnum,
} from '@roshi/shared';
import { z } from 'zod';
import { createLoanOfferSchema } from '../controllers/v1/loanOffer.controller';
import { formatApplicantForAdmin } from '../services/applicantInfo.service';
import { getCbsRatio, getMlcbRatio, isForeigner } from '../utils/roshiUtils';
import { roundUpToThousand } from '../utils/utils';

type IpaResponse = Omit<z.infer<typeof createLoanOfferSchema>, 'loanRequestId'> | null;

type LoanRequestAdmin = Prisma.LoanRequestGetPayload<{ include: { applicantInfo: true } }>;

export const getIPAForBEST = (loanRequest: LoanRequestAdmin): IpaResponse => {
  // Version - 07 May 2025
  const companyId = '154a2c23-40a5-4ea6-894a-155d55d0484e';
  const REJECT_RESPONSE = {
    status: LoanResponseStatusEnum.REJECTED,
    companyId,
  };

  try {
    if (!loanRequest.applicantInfo) return null;
    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);

    const mlcb = getMlcbRatio(applicantInfo);
    const { monthlyIncome: income } = applicantInfo;
    const foreigner = isForeigner(applicantInfo);

    if (income < 2500) return { ...REJECT_RESPONSE, comment: 'low income' };
    if (mlcb >= 4) return { ...REJECT_RESPONSE, comment: 'too much debt' };
    if (income < 3500 && foreigner) return { ...REJECT_RESPONSE, comment: 'low income for foreigner' };
    const offerInfo = (() => {
      if (income >= 7500) return { amount: 4 * income, interest: 3.88, term: 22 };
      if (income >= 3500) return { amount: 3 * income, interest: 3.88, term: 17 };
      return { amount: 5000, interest: 3.88, term: 12 };
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
  } catch (e) {
    console.error('error while generating IPA for BEST');
    return null;
  }
};

export const getIPAForEzLoan = (loanRequest: LoanRequestAdmin): IpaResponse => {
  // Version - 07 May 2025
  const companyId = '8d823a52-e0f4-4376-ada0-dac821237d94';
  const REJECT_RESPONSE = {
    status: LoanResponseStatusEnum.REJECTED,
    companyId,
  };

  try {
    if (!loanRequest.applicantInfo) return null;
    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);

    const mlcb = getMlcbRatio(applicantInfo);
    const { monthlyIncome: income } = applicantInfo;
    const foreigner = isForeigner(applicantInfo);

    if (income < 2500) return { ...REJECT_RESPONSE, comment: 'low income' };
    if (mlcb >= 4) return { ...REJECT_RESPONSE, comment: 'too much debt' };
    if (income < 3500 && foreigner) return { ...REJECT_RESPONSE, comment: 'low income for foreigner' };

    const offerInfo = (() => {
      if (income >= 7500) return { amount: 6 * income, interest: 3.38, term: 16 };
      if (income >= 3500) return { amount: 4 * income, interest: 3.38, term: 11 };
      return { amount: 5000, interest: 3.38, term: 10 };
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
  } catch (e) {
    console.error('error while generating IPA for EZ Loan');
    return null;
  }
};

export const getIPAForCreditXtra = (loanRequest: LoanRequestAdmin): IpaResponse => {
  try {
    const companyId = 'd4e1e92a-9c00-42b2-9513-22c607592e59';
    const REJECT_RESPONSE = {
      status: LoanResponseStatusEnum.REJECTED,
      companyId,
    };

    if (!loanRequest.applicantInfo) return null;
    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);
    const mlcbRatio = getMlcbRatio(applicantInfo);
    if (mlcbRatio >= 6) return { ...REJECT_RESPONSE, comment: 'too much debt' };
    if (isForeigner(applicantInfo)) return null;

    let amount = 0;
    let tenure = 0;
    if (mlcbRatio > 4 || applicantInfo.monthlyIncome < 1700) {
      amount = 3000;
      tenure = 3;
    } else if (applicantInfo.monthlyIncome >= 7500) {
      amount = 10000;
      tenure = 6;
    } else if (applicantInfo.monthlyIncome >= 3500) {
      amount = 5000;
      tenure = 6;
    } else if (applicantInfo.monthlyIncome >= 1700) {
      amount = applicantInfo.monthlyIncome * 4 - applicantInfo.lenderDebt;
      tenure = 12;
    }

    if (amount < 1000) return { ...REJECT_RESPONSE, comment: 'amount too low' };

    return {
      status: LoanResponseStatusEnum.ACCEPTED,
      companyId,
      offer: {
        amount: roundUpToThousand(Math.min(loanRequest.amount, amount)),
        term: Math.min(tenure, loanRequest.term),
        monthlyInterestRate: 3.92,
        variableUpfrontFees: 10,
        fixedUpfrontFees: 0,
      },
    };
  } catch (e) {
    console.error('error while generating IPA for Credit Xtra');
    console.error(loanRequest, e);
    return null;
  }
};

export const getIPAFor12Lend = (loanRequest: LoanRequestAdmin): IpaResponse => {
  try {
    const companyId = '58539657-050d-4ed0-af4a-4efdb89b3da4';

    const REJECT_RESPONSE = {
      status: LoanResponseStatusEnum.REJECTED,
      companyId,
    };

    if (!loanRequest.applicantInfo) return null;
    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);

    if (applicantInfo.monthlyIncome < 1700) return { ...REJECT_RESPONSE, comment: 'low income' };
    if (getMlcbRatio(applicantInfo) >= 4) return { ...REJECT_RESPONSE, comment: 'too much debt' };

    if (applicantInfo.employmentStatus !== employmentStatusesEnum.EMPLOYED)
      return { ...REJECT_RESPONSE, comment: 'unemployed' };
    if (
      applicantInfo.currentEmploymentTime === EmploymentTimeEnum.NA ||
      applicantInfo.currentEmploymentTime === EmploymentTimeEnum.UNDER_THREE_MONTHS
    )
      return { ...REJECT_RESPONSE, comment: 'not enough employment time' };
    if (
      applicantInfo.residencyStatus !== residencyStatusesEnum.SINGAPOREAN &&
      applicantInfo.residencyStatus !== residencyStatusesEnum.PERMANANT_RESIDENT
    )
      return null;
    if (
      applicantInfo.propertyOwnership === propertyOwnershipsEnum.RENTAL ||
      applicantInfo.propertyOwnership === propertyOwnershipsEnum.LIVING_WITH_PARENTS
    )
      return null;

    const maxAmount = 20000;
    let amount = 3000;
    let term = 3;
    if (applicantInfo.monthlyIncome >= 7500) {
      amount = applicantInfo.monthlyIncome * 2 - applicantInfo.lenderDebt;
      term = 10;
    } else if (applicantInfo.monthlyIncome >= 3500) {
      amount = applicantInfo.monthlyIncome * 4 - applicantInfo.lenderDebt;
      term = 15;
    }

    let offerAmount = Math.min(amount, loanRequest.amount, maxAmount);
    // Don't want to offer under 3000
    if (offerAmount < 3000) return null;

    // 12Lend new request: processing fee to 10% and interest rate to 2.38%
    return {
      status: LoanResponseStatusEnum.ACCEPTED,
      companyId: companyId,
      offer: {
        amount: offerAmount,
        term: Math.min(term, loanRequest.term),
        monthlyInterestRate: 2.38,
        variableUpfrontFees: 10,
        fixedUpfrontFees: 0,
      },
    };
  } catch (e) {
    console.error('error while generating IPA for 12Lend');
    console.error(loanRequest, e);
    return null;
  }
};

//https://docs.google.com/document/d/1WgQx3dcVknhcLytl58nfe0m8EGTqytIj/edit
export const getIpaForMoneyplus = (loanRequest: LoanRequestAdmin): IpaResponse => {
  try {
    if (!loanRequest.applicantInfo) return null;
    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);
    if (
      applicantInfo.employmentStatus !== employmentStatusesEnum.EMPLOYED &&
      applicantInfo.employmentStatus !== employmentStatusesEnum.SELF_EMPLOYED
    )
      return null;
    if (
      applicantInfo.residencyStatus !== residencyStatusesEnum.SINGAPOREAN &&
      applicantInfo.residencyStatus !== residencyStatusesEnum.PERMANANT_RESIDENT
    )
      return null;

    const maxAmount = applicantInfo.monthlyIncome * 2 - applicantInfo.lenderDebt;
    let offerAmount = Math.min(loanRequest.amount, maxAmount);
    //Don't want to offer under 3000
    if (offerAmount < 1000) return null;

    return {
      status: LoanResponseStatusEnum.ACCEPTED,
      companyId: 'c6de9bd0-d20e-4c25-8c74-94d51109937d',
      offer: {
        amount: offerAmount,
        term: Math.min(24, loanRequest.term),
        monthlyInterestRate: 2.8,
        variableUpfrontFees: 10,
        fixedUpfrontFees: 0,
      },
    };
  } catch (e) {
    console.error('error while generating IPA for Moneysmart');
    console.error(loanRequest, e);
    return null;
  }
};

//https://docs.google.com/document/d/1mw73WzG46ooL_wFTKKmO9hPqdifYQzr0/edit
export const getIpaFor118 = (loanRequest: LoanRequestAdmin) => {
  try {
    if (!loanRequest.applicantInfo) return null;
    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);

    if (applicantInfo.monthlyIncome < 3500) return null;
    if (getMlcbRatio(applicantInfo) > 3) return null;

    if (applicantInfo.employmentStatus !== employmentStatusesEnum.EMPLOYED) return null;

    const maxAmount = applicantInfo.monthlyIncome * 2.8 - applicantInfo.lenderDebt;
    let offerAmount = Math.min(loanRequest.amount, maxAmount);
    if (offerAmount < 1000) return null;

    const maxTerm = applicantInfo.lenderDebt === 0 ? 20 : 15;

    return {
      companyId: '4e43aac5-3699-4d91-8508-993d6363ebcc',
      offer: {
        amount: offerAmount,
        term: Math.min(maxTerm, loanRequest.term),
        monthlyInterestRate: 3.92,
        variableUpfrontFees: 10,
        fixedUpfrontFees: 0,
      },
    };
  } catch (e) {
    console.error('error while generating IPA for 118');
    console.error(loanRequest, e);
    return null;
  }
};

//https://docs.google.com/document/d/1jS4b_JYp2sHCKHnKgtuTyp2jJOItGvNu/edit
export const getIpaForOrangeCredit = (loanRequest: LoanRequestAdmin) => {
  try {
    if (!loanRequest.applicantInfo) return null;
    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);

    const mlRatio = getMlcbRatio(applicantInfo);
    const cbsRatio = getCbsRatio(applicantInfo);
    if (applicantInfo.monthlyIncome < 2000) return null;
    if (mlRatio > 2.5) return null;
    if (cbsRatio > 5) return null;

    if (
      applicantInfo.employmentStatus !== employmentStatusesEnum.EMPLOYED &&
      applicantInfo.employmentStatus !== employmentStatusesEnum.SELF_EMPLOYED
    )
      return null;

    if (
      applicantInfo.currentEmploymentTime === EmploymentTimeEnum.NA ||
      applicantInfo.currentEmploymentTime === EmploymentTimeEnum.UNDER_THREE_MONTHS
    )
      return null;

    let mult = 1;
    if (applicantInfo.monthlyIncome >= 6000) mult = 3;
    else if (applicantInfo.monthlyIncome >= 3000) mult = 2;

    const maxAmount = applicantInfo.monthlyIncome * mult - applicantInfo.lenderDebt;
    let offerAmount = Math.min(loanRequest.amount, maxAmount);
    if (offerAmount < 1000) return null;

    const maxTerm = 24;
    const minTerm = 7;

    let interestRate = 3.9;
    if (applicantInfo.monthlyIncome >= 8000 && cbsRatio < 4 && mlRatio < 2) interestRate = 3;
    else if (applicantInfo.monthlyIncome >= 6000 && cbsRatio < 5 && mlRatio < 2) interestRate = 3.25;
    else if (applicantInfo.monthlyIncome >= 4000 && cbsRatio < 5) interestRate = 3.5;

    return {
      companyId: '93e038c3-6357-4f70-a756-e0b36def3f4b',
      offer: {
        amount: offerAmount,
        term: Math.max(Math.min(maxTerm, loanRequest.term), minTerm),
        monthlyInterestRate: interestRate,
        variableUpfrontFees: 10,
        fixedUpfrontFees: 0,
      },
    };
  } catch (e) {
    console.error('error while generating IPA for orange credit');
    console.error(loanRequest, e);
    return null;
  }
};

// Zero Interest Loan
export const getZeroInterestIpaForEz = (zeroInterestLoanRequest: LoanRequestAdmin) => {
  try {
    if (!zeroInterestLoanRequest.applicantInfo) return null;

    const companyId = '8d823a52-e0f4-4376-ada0-dac821237d94';
    const applicantInfo = formatApplicantForAdmin(zeroInterestLoanRequest.applicantInfo);
    const minIncome = 4000;
    if (applicantInfo.monthlyIncome < minIncome) return null;

    return {
      companyId: companyId,
      offer: {
        amount: 4000,
        term: 4,
        monthlyInterestRate: 1.88,
        variableUpfrontFees: 10,
        fixedUpfrontFees: 0,
      },
    };
  } catch (e) {
    console.error('error while generating zero interest IPA for ez loan');
    console.error(zeroInterestLoanRequest, e);
    return null;
  }
};
// Zero Interest Loan
export const getZeroInterestIpaForBest = (zeroInterestLoanRequest: LoanRequestAdmin) => {
  try {
    if (!zeroInterestLoanRequest.applicantInfo) return null;

    const companyId = '154a2c23-40a5-4ea6-894a-155d55d0484e';
    const applicantInfo = formatApplicantForAdmin(zeroInterestLoanRequest.applicantInfo);
    const minIncome = 4000;
    if (applicantInfo.monthlyIncome < minIncome) return null;

    return {
      companyId: companyId,
      offer: {
        amount: 8000,
        term: 4,
        monthlyInterestRate: 1.88,
        variableUpfrontFees: 10,
        fixedUpfrontFees: 0,
      },
    };
  } catch (e) {
    console.error('error while generating zero interest IPA for best');
    console.error(zeroInterestLoanRequest, e);
    return null;
  }
};
