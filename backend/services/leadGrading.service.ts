import { JobsEnum, LeadTierEnum, MlcbGradeEnum, Prisma, SgManualFormSchema, SingpassData } from '@roshi/shared';
import { differenceInDays } from 'date-fns';
import { z } from 'zod';
import { iBooksClient } from '../clients/ibooksClient';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';
import { createJob } from '../jobs/boss';
import { MLCBReportSchema } from '../models/mlcbReport.model';
import { convertToThreeLetterCode } from '../utils/countryCodes';
import { getMlcbRatio, isForeigner } from '../utils/roshiUtils';
import { getLoanRequest } from './loanRequest.service';

const isEmpty = (obj: any) => typeof obj === 'object' && Object.keys(obj).length === 0;

export const checkGradingEligibility = (applicantInfo: Prisma.ApplicantInfoGetPayload<{}>) => {
  const singpassData: SingpassData | undefined = applicantInfo.singpassData as SingpassData | undefined;
  const appInfo = SgManualFormSchema.parse(applicantInfo.data);

  if (singpassData?.uinfin?.value === undefined) return false;
  if (isForeigner(appInfo)) return false;
  if (appInfo.monthlyIncome < 2000) return false;
  if (getMlcbRatio(appInfo) > 6) return false;

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
  const singpassData: SingpassData = applicantInfo.singpassData as SingpassData;
  const appInfo = SgManualFormSchema.parse(applicantInfo.data);

  const nric = singpassData.uinfin?.value;
  let nationality = singpassData.nationality?.code;
  const gender = singpassData.sex?.desc;
  const name = singpassData.name?.value;
  const dob = singpassData.dob?.value;
  const marital = singpassData.marital?.desc;
  const email = singpassData.email?.value || applicantInfo.email;
  // Can fallback to postal code supplied by the user
  const postalcode = singpassData.regadd?.postal?.value || appInfo.postalCode;
  const buildingnumber = singpassData.regadd?.block?.value;
  const streetname = singpassData?.regadd?.street?.value;
  const floor = singpassData.regadd?.floor?.value;
  let unit = singpassData.regadd?.unit?.value;
  if (floor && unit) {
    unit = `${floor}-${unit}`;
  }
  const contact_code = singpassData?.mobileno?.areacode?.value;
  const contact = `${singpassData?.mobileno?.nbr?.value}`;
  const employer_name = singpassData.cpfcontributions?.history?.[0]?.employer?.value;
  const job_title = singpassData.occupation?.value;
  const annual_income = (appInfo.monthlyIncome * 12).toString();

  if (!nric) throw new Error('Missing NRIC');
  if (!nationality) throw new Error('Missing nationality');
  if (!gender) throw new Error('Missing gender');
  if (!name) throw new Error('Missing name');
  if (!dob) throw new Error('Missing date of birth');
  if (!email) throw new Error('Missing email');
  if (!postalcode) throw new Error('Missing postal code');
  if (!contact) throw new Error('Missing contact');
  if (!contact_code) throw new Error('Missing contact code');

  nationality = convertToThreeLetterCode(nationality);

  const report = await iBooksClient.getMlcbReport({
    nric,
    nationality,
    gender,
    name,
    dob,
    marital,
    email,
    postalcode,
    unit,
    contact_code,
    contact,
    loan_amount: CONFIG.MLCB_REPORT_REQUEST_AMOUNT.toString(),
    employer_name,
    job_title,
    annual_income,
    buildingnumber,
    streetname,
  });

  return report;
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
  if (!loanRequest.applicantInfo.singpassData) throw new Error('SingpassData not found');
  const mlcbReport = await getMlcbReport({ ...loanRequest.applicantInfo, email: loanRequest.user.email });

  return mlcbReport;
};
