import {
  ERROR_KEYS,
  JobsEnum,
  LogLevel,
  LogSource,
  NotificationTransportEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { getIPAForBEST, getIPAForCreditXtra, getIPAForEzLoan, getIpaForMoneyplus } from '../../data/autoIpa';
import { getLoanRequest } from '../../services/loanRequest.service';
import { createLoanResponse } from '../../services/loanResponse.service';
import { sendNotification } from '../../services/notification.service';
import logger from '../../utils/logger';
import { RoshiError } from '../../utils/roshiError';
import { boss, createJob } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.REAPPLY_LOAN_REQUEST;

export const initReApplyJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 10 }, async ([job]) => {
    const user = await prismaClient.user.findUnique({
      where: { id: job.data.userId },
      include: {
        loanRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        userSettings: true,
      },
    });
    if (!user || user.loanRequests.length === 0)
      throw new RoshiError(ERROR_KEYS.NOT_FOUND, { message: 'User not found or no loan requests' });
    const loanRequest = await getLoanRequest(user.loanRequests[0].id);
    if (!user || !loanRequest || !loanRequest.applicantInfo)
      throw new RoshiError(ERROR_KEYS.NOT_FOUND, { message: 'ApplicantInfo not found' });

    // Check if user has unsubscribed from auto-reapply
    if (user.userSettings?.autoReapplyDisabled) {
      throw new RoshiError(ERROR_KEYS.NOT_FOUND, { message: 'User unsubscribed from auto-reapply' });
    }

    const newLoanRequest = await prismaClient.$transaction(async (tx) => {
      const applicantInfo = await tx.applicantInfo.create({
        data: {
          data: loanRequest.applicantInfo!.data!,
          dataFormat: loanRequest.applicantInfo!.dataFormat,
        },
      });

      return await tx.loanRequest.create({
        data: {
          userId: user.id,
          applicantInfoId: applicantInfo.id, // Reuse existing applicant info
          amount: loanRequest.amount,
          term: loanRequest.term,
          purpose: loanRequest.purpose,
          country: loanRequest.country,
          type: loanRequest.type,
          isAutoReapply: true, // Mark this as an auto-reapply request
          approvedAt: null,
        },
        include: {
          applicantInfo: true,
        },
      });
    });

    // Check for auto-approvals
    const offers = [
      getIPAForBEST(newLoanRequest),
      getIPAForEzLoan(newLoanRequest),
      getIPAForCreditXtra(newLoanRequest),
      getIpaForMoneyplus(newLoanRequest),
    ];
    for (const offer of offers) {
      if (offer && offer.companyId) {
        try {
          await createLoanResponse(
            offer.companyId,
            { status: offer.status, loanRequestId: newLoanRequest.id, offer: offer.offer },
            true,
          );
        } catch (e) {
          console.error('Error creating loan response', e);
          logger({
            error: e,
            errorType: ERROR_KEYS.INTERNAL_ERROR,
            source: LogSource.JOB_QUEUE,
            level: LogLevel.ERROR,
          });
        }
      }
    }

    // This will notify lenders
    createJob(JobsEnum.CHECK_LENDER_FILTERS, { loanRequestId: newLoanRequest.id });

    // Send email notification to the user
    sendNotification(
      {
        notificationType: NotificationTypeEnum.REAPPLY_OFFERS,
        targetType: UserRoleEnum.BORROWER,
        transport: NotificationTransportEnum.EMAIL,
        recipientEmail: user.email,
        payload: {
          loanRequestId: newLoanRequest.id,
        },
      },
      { startAfter: CONFIG.SEND_LOAN_REQUEST_FOLLOW_UP_WA_AFTER_HOURS * 60 * 60 },
    );
  });
};
