import { JobsEnum } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';
import { createJob } from '../jobs/boss';

export const testZohoCrm = async () => {
  const lq = await prismaClient.loanRequest.findFirst();
  if (lq) {
    createJob(JobsEnum.SYNC_TO_ZOHO, { LoanRequest: lq.id });
  }

  const usr = await prismaClient.user.findFirst();
  if (usr) {
    createJob(JobsEnum.SYNC_TO_ZOHO, { User: usr.id });
  }

  const app = await prismaClient.applicantInfo.findFirst();
  if (app) {
    createJob(JobsEnum.SYNC_TO_ZOHO, { ApplicantInfo: app.id });
  }
};
