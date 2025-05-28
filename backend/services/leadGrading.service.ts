import { JobsEnum, LeadTierEnum, MlcbGradeEnum, Prisma } from '@roshi/shared';
import { differenceInDays } from 'date-fns';
import { z } from 'zod';
import { prismaClient } from '../clients/prismaClient';
import { createJob } from '../jobs/boss';
import { MLCBReportSchema } from '../models/mlcbReport.model';
import { getMlcbRatio, isForeigner } from '../utils/roshiUtils';
import { getLoanRequest } from './loanRequest.service';

const isEmpty = (obj: any) => typeof obj === 'object' && Object.keys(obj).length === 0;

export const checkGradingEligibility = (applicantInfo: Prisma.ApplicantInfoGetPayload<{}>) => {
  if (isForeigner(applicantInfo)) return false;
  if (applicantInfo.monthlyIncome < 2000) return false;
  if (getMlcbRatio(applicantInfo) > 6) return false;
  return true;
};

export const getGrade = (report: z.infer<typeof MLCBReportSchema>, monthlyIncome: number = 0) => {
  if (!report.response_report.MESSAGE.ITEM.MLCB_REPORT.APPLICANT.PAYMENTSTS) return MlcbGradeEnum.NORMAL;
  let loans = report.response_report.MESSAGE.ITEM.MLCB_REPORT.APPLICANT.PAYMENTSTS.LOAN;
  if (!Array.isArray(loans)) loans = [loans];
  if (loans.length === 0) return MlcbGradeEnum.NORMAL;

  const formatted = loans.map((loan) => {
    let cycles = loan.CYCLE.sort(
      (a, b) => new Date(b.YEAR, b.MONTH - 1, 1).getTime() - new Date(a.YEAR, a.MONTH - 1, 1).getTime(),
    );

    if (cycles.length && isEmpty(cycles[0].STATUS)) {
      cycles = cycles.slice(1);
    }

    return {
      amount: loan.TOTPAYAMT,
      cycle: cycles.slice(0, 2),
    };
  });

  let subRecords = 0;
  let normalRecords = 0;
  let goodRecords = 0;

  for (const item of formatted) {
    const isLowAmount = item.amount < monthlyIncome * 0.1;
    const [firstCycle, secondCycle] = item.cycle;
    const statuses = [firstCycle?.STATUS, secondCycle?.STATUS];

    // Bad grade conditions
    if (
      !isLowAmount &&
      (statuses.includes('120+') ||
        statuses.includes('BD') ||
        (isEmpty(firstCycle.STATUS) && isEmpty(secondCycle.STATUS)))
    ) {
      return MlcbGradeEnum.BAD;
    }

    // Good records conditions
    if (
      statuses.includes('OK') ||
      statuses.includes('30') ||
      (firstCycle.STATUS === '60' && ['60', '90', '120'].includes(secondCycle.STATUS as string))
    ) {
      goodRecords++;
      continue;
    }

    // Sub records conditions
    if (firstCycle.STATUS === '120' || (firstCycle.STATUS === '90' && secondCycle.STATUS === '60')) {
      subRecords++;
      continue;
    }

    // Normal records conditions
    if (
      (firstCycle.STATUS === '90' && secondCycle.STATUS === '90') ||
      (firstCycle.STATUS === '60' && secondCycle.STATUS === '30')
    ) {
      normalRecords++;
    }
  }

  if (subRecords) return MlcbGradeEnum.SUB;
  if (normalRecords) return MlcbGradeEnum.NORMAL;
  if (goodRecords) return MlcbGradeEnum.GOOD;
  return MlcbGradeEnum.NORMAL;
};

export const getLeadTier = (mlcbGrade: MlcbGradeEnum, monthlyIncome: number, mlDebt: number) => {
  const mlcbRatio = mlDebt / monthlyIncome;
  if (mlcbGrade === MlcbGradeEnum.BAD || mlcbRatio > 6 || monthlyIncome < 1800) return LeadTierEnum.REJECT;
  if (mlcbRatio < 3 && monthlyIncome > 4000 && mlcbGrade === MlcbGradeEnum.GOOD) return LeadTierEnum.PREMIUM;
  if (
    mlcbRatio < 4 &&
    monthlyIncome > 2500 &&
    (mlcbGrade === MlcbGradeEnum.GOOD || mlcbGrade === MlcbGradeEnum.NORMAL || mlcbGrade === MlcbGradeEnum.UNKNOWN)
  )
    return LeadTierEnum.DELUXE;

  return LeadTierEnum.BASIC;
};

export const getMlcbReport = async (applicantInfo: Prisma.ApplicantInfoGetPayload<{}> & { email: string }) => {
  return {};
};

export const getMLCBReportByLoanRequestId = async (loanRequestId: string) => {
  const existingReportForCurrentLoanRequest = await prismaClient.loanRequestGrading.findUnique({
    where: { loanRequestId: loanRequestId },
  });
  if (existingReportForCurrentLoanRequest && existingReportForCurrentLoanRequest.mlcbReport) {
    return existingReportForCurrentLoanRequest;
  }

  const loanRequest = await getLoanRequest(loanRequestId);

  //We check other loan requests for same lead in case he withdrew his application
  const loanRequests = await prismaClient.loanRequest.findMany({ where: { userId: loanRequest.userId } });
  const existingMlcbReport = await prismaClient.loanRequestGrading.findFirst({
    where: {
      loanRequestId: { in: loanRequests.map((lr) => lr.id) },
      mlcbReport: { not: Prisma.JsonNull },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  //If a report exists for a previous loan request, and it's under 2 months
  if (
    existingMlcbReport &&
    existingMlcbReport.mlcbReport &&
    differenceInDays(new Date(), existingMlcbReport.createdAt) < 60
  ) {
    createJob(JobsEnum.LEAD_GRADING, { loanRequestId });
    return existingMlcbReport;
  }

  if (!loanRequest.applicantInfo) throw new Error('ApplicantInfo not found');
  const mlcbReport = await getMlcbReport({ ...loanRequest.applicantInfo, email: loanRequest.user.email });
  return mlcbReport;
};
