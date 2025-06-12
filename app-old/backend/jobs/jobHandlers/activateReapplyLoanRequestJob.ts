import { ActivityLogEnum, ERROR_KEYS, JobsEnum, TargetTypeEnum } from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { createActivityLog } from '../../services/activityLog.service';
import { getLoanRequest } from '../../services/loanRequest.service';
import { RoshiError } from '../../utils/roshiError';
import { boss, createJob } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.ACTIVATE_REAPPLY_LOAN_REQUEST;
export const initActivateReapplyLoanRequestJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 10 }, async ([job]) => {
    const loanRequest = await getLoanRequest(job.data.loanRequestId);
    if (!loanRequest) {
      throw new RoshiError(ERROR_KEYS.NOT_FOUND, { message: 'Loan request not found' });
    }
    await prismaClient.loanRequest.update({
      where: { id: loanRequest.id },
      data: {
        approvedAt: new Date(),
      },
    });
    createActivityLog({
      userId: loanRequest.userId,
      loanRequestId: loanRequest.id,
      activityType: ActivityLogEnum.LOAN_REQUEST_ACTIVATED,
      targetType: TargetTypeEnum.LOAN_REQUEST,
      targetId: loanRequest.id,
    });

    // Will notify lenders
    createJob(JobsEnum.CHECK_LENDER_FILTERS, { loanRequestId: loanRequest.id });
  });
};
