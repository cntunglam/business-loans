import { Prisma } from '@prisma/client';
import { JobsEnum } from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { getMLCBReportByLoanRequestId } from '../../services/leadGrading.service';
import { boss, createJob } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.FETCH_MLCB_REPORT;
export const initFetchMLCBReportJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 2 }, async ([job]) => {
    const loanRequestId = job.data.loanRequestId;
    const mlcbReport = await getMLCBReportByLoanRequestId(loanRequestId);

    await prismaClient.loanRequestGrading.upsert({
      where: {
        loanRequestId: loanRequestId,
      },
      create: {
        loanRequestId: loanRequestId,
        mlcbReport: mlcbReport as Prisma.JsonObject,
      },
      update: {
        mlcbReport: mlcbReport as Prisma.JsonObject,
      },
    });

    createJob(JobsEnum.LEAD_GRADING, { loanRequestId });
  });
};
