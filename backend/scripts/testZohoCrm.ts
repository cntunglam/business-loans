import { JobsEnum } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';
import { createJob } from '../jobs/boss';

export const testZohoCrm = async () => {
  const lq = await prismaClient.loanRequest.findFirst();
  if (lq) {
    createJob(JobsEnum.SYNC_TO_ZOHO, { loanRequestId: lq.id });
  }

  const usr = await prismaClient.user.findFirst();
  if (usr) {
    createJob(JobsEnum.SYNC_TO_ZOHO, { userId: usr.id });
  }

  const app = await prismaClient.applicantInfo.findFirst();
  if (app) {
    createJob(JobsEnum.SYNC_TO_ZOHO, { applicantInfoId: app.id });
  }
};
