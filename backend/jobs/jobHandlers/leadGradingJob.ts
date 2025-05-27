import { JobsEnum, MlcbGradeEnum, SgManualFormSchema } from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { MLCBReportSchema } from '../../models/mlcbReport.model';
import { getGrade, getLeadTier } from '../../services/leadGrading.service';
import { getLoanRequest } from '../../services/loanRequest.service';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.LEAD_GRADING;
export const initLeadGradingJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 2 }, async ([job]) => {
    const loanRequestId = job.data.loanRequestId;
    const loanRequest = await getLoanRequest(loanRequestId);
    const applicantInfo = SgManualFormSchema.parse(loanRequest.applicantInfo?.data);
    let grade: MlcbGradeEnum = MlcbGradeEnum.UNKNOWN;
    const report = await prismaClient.loanRequestGrading.findUnique({ where: { loanRequestId } });
    if (report) {
      const parsed = MLCBReportSchema.parse(report.mlcbReport);
      grade = getGrade(parsed, applicantInfo.monthlyIncome);
    }

    const appInfo = SgManualFormSchema.parse(loanRequest.applicantInfo?.data);
    const leadTier = getLeadTier(grade, appInfo.monthlyIncome, appInfo.lenderDebt);

    await prismaClient.loanRequestGrading.upsert({
      where: { loanRequestId },
      update: {
        mlcbGrade: grade,
        leadTier: leadTier,
      },
      create: {
        mlcbGrade: grade,
        leadTier: leadTier,
        loanRequestId: loanRequestId,
      },
    });
  });
};
