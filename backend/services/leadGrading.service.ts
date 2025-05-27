import { JobsEnum, LeadTierEnum, MlcbGradeEnum, Prisma, SgManualFormSchema } from '@roshi/shared';
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
  const appInfo = SgManualFormSchema.parse(applicantInfo.data);

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

  formatted.forEach((loan) => {
    loan.cycle.forEach((cycle) => {
      const status = cycle.STATUS?._text;
      if (status === '1') goodRecords++;
      else if (status === '2') normalRecords++;
      else if (status === '3') subRecords++;
    });
  });

  if (subRecords > 0) return MlcbGradeEnum.SUBSTANDARD;
  if (normalRecords > 0) return MlcbGradeEnum.NORMAL;
  if (goodRecords > 0) return MlcbGradeEnum.GOOD;

  return MlcbGradeEnum.NORMAL;
};

export const getLeadTier = (mlcbGrade: MlcbGradeEnum, monthlyIncome: number, mlDebt: number) => {
  if (mlcbGrade === MlcbGradeEnum.SUBSTANDARD) return LeadTierEnum.D;
  if (monthlyIncome < 3000) return LeadTierEnum.C;
  if (mlDebt > 0) return LeadTierEnum.B;
  return LeadTierEnum.A;
};

export const getMlcbReport = async (applicantInfo: Prisma.ApplicantInfoGetPayload<{}> & { email: string }) => {
  const appInfo = SgManualFormSchema.parse(applicantInfo.data);

  // Get data from manual form
  const nric = appInfo.nric;
  const nationality = appInfo.nationality;
  const gender = appInfo.gender;
  const name = appInfo.fullname;
  const dob = appInfo.dateOfBirth;
  const marital = appInfo.maritalStatus;
  const email = applicantInfo.email;
  const postalcode = appInfo.postalCode;
  const contact = appInfo.phoneNumber?.replace(/\D/g, '') || '';
  const employer_name = appInfo.employerName;
  const job_title = appInfo.employmentType;

  // Format request payload
  const payload = {
    request_report: {
      MESSAGE: {
        HEADER: {
          SOURCE: CONFIG.MLCB_SOURCE,
          USERID: CONFIG.MLCB_USER_ID,
          PASSWORD: CONFIG.MLCB_PASSWORD,
          REQUEST_ID: `ROSHI_${Date.now()}`,
          TIMESTAMP: new Date().toISOString(),
        },
        ITEM: {
          ID_TYPE: 'N',
          ID_NUMBER: nric,
          NATIONALITY: convertToThreeLetterCode(nationality),
          GENDER: gender === 'MALE' ? 'M' : 'F',
          NAME: name,
          DOB: dob,
          MARITAL: marital === 'SINGLE' ? 'S' : 'M',
          EMAIL: email,
          ADDRESS: {
            POSTAL_CODE: postalcode,
          },
          CONTACT: {
            CONTACT: contact,
          },
          EMPLOYMENT: {
            EMPLOYER_NAME: employer_name,
            JOB_TITLE: job_title,
          },
        },
      },
    },
  };

  const response = await iBooksClient.post('/mlsb/creditbureau/creditreport', payload);
  const report = MLCBReportSchema.parse(response.data);

  return report;
};

export const getMLCBReportByLoanRequestId = async (loanRequestId: string) => {
  const loanRequest = await getLoanRequest(loanRequestId);

  if (!loanRequest.applicantInfo) {
    throw new Error('Applicant info not found');
  }

  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: loanRequest.userId },
    select: { email: true },
  });

  const report = await getMlcbReport({
    ...loanRequest.applicantInfo,
    email: user.email,
  });

  const appInfo = SgManualFormSchema.parse(loanRequest.applicantInfo.data);
  const mlcbGrade = getGrade(report, appInfo.monthlyIncome);
  const leadTier = getLeadTier(mlcbGrade, appInfo.monthlyIncome, appInfo.lenderDebt);

  await prismaClient.loanRequest.update({
    where: { id: loanRequestId },
    data: {
      grading: {
        upsert: {
          create: {
            mlcbGrade,
            leadTier,
          },
          update: {
            mlcbGrade,
            leadTier,
          },
        },
      },
    },
  });

  await createJob(JobsEnum.PROCESS_LEAD_GRADE, {
    loanRequestId,
  });

  return report;
};
