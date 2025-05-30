import {
  ERROR_KEYS,
  JobsEnum,
  LogLevel,
  LogSource,
  NotificationTransportEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { CONFIG } from '../../config';
import { getTest1IPA, getTestIPA } from '../../data/autoIpa';
import { formatApplicantForAdmin } from '../../services/applicantInfo.service';
import { EmailTypeEnum, sendEmail } from '../../services/email.service';
import { getLoanRequest } from '../../services/loanRequest.service';
import { createLoanResponse } from '../../services/loanResponse.service';
import { sendNotification } from '../../services/notification.service';
import logger from '../../utils/logger';
import { RoshiError } from '../../utils/roshiError';
import { boss, createJob } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.NEW_LOAN_REQUEST;
export const initLoanRequestJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 10 }, async ([job]) => {
    const loanRequest = await getLoanRequest(job.data.loanRequestId);
    if (!loanRequest.applicantInfo) throw new RoshiError(ERROR_KEYS.NOT_FOUND, { message: 'ApplicantInfo not found' });

    const applicantInfo = formatApplicantForAdmin(loanRequest.applicantInfo);

    try {
      await sendEmail(loanRequest.user.email, EmailTypeEnum.WELCOME, { fullName: applicantInfo.fullName ?? 'Name' });
    } catch (e) {
      console.error('Error sending welcome email', e);
      logger({
        error: e,
        errorType: ERROR_KEYS.INTERNAL_ERROR,
        source: LogSource.JOB_QUEUE,
        level: LogLevel.ERROR,
      });
    }

    // Notify admin
    await sendNotification({
      notificationType: NotificationTypeEnum.NEW_LOAN_REQUEST,
      targetType: UserRoleEnum.ADMIN,
      payload: {
        loanRequestId: loanRequest.id,
      },
    });

    //Check for auto-approvals (only on creation)
    // todo: remove it when we have a better way to handle auto-approval
    const offers = [getTestIPA(loanRequest), getTest1IPA(loanRequest)];
    for (const offer of offers) {
      if (offer && offer.companyId) {
        try {
          await createLoanResponse(
            offer.companyId,
            { status: offer.status, loanRequestId: loanRequest.id, offer: offer.offer },
            true,
          );
        } catch (e) {
          console.error('Error creating loan response', e);
        }
      }
    }

    createJob(JobsEnum.CHECK_LENDER_FILTERS, { loanRequestId: loanRequest.id });

    sendNotification(
      {
        notificationType: NotificationTypeEnum.WELCOME,
        targetType: UserRoleEnum.BORROWER,
        transport: NotificationTransportEnum.WHATSAPP,
        phoneNumber: loanRequest.user.phone || '',
        payload: {
          loanRequestId: loanRequest.id,
        },
      },
      { startAfter: CONFIG.SEND_WELCOME_WA_AFTER_MINUTES * 60 },
    );

    sendNotification(
      {
        notificationType: NotificationTypeEnum.LOAN_REQUEST_FOLLOW_UP,
        payload: { loanRequestId: loanRequest.id },
        targetType: UserRoleEnum.BORROWER,
        transport: NotificationTransportEnum.WHATSAPP,
        phoneNumber: loanRequest.user.phone || '',
      },
      { startAfter: CONFIG.SEND_LOAN_REQUEST_FOLLOW_UP_WA_AFTER_HOURS * 60 * 60 },
    );

    if (loanRequest.amount >= 10000)
      sendNotification(
        {
          targetType: UserRoleEnum.BORROWER,
          transport: NotificationTransportEnum.WHATSAPP,
          notificationType: NotificationTypeEnum.CIMB_OFFER,
          phoneNumber: loanRequest.user.phone || '',
          payload: {
            loanRequestId: loanRequest.id,
          },
        },
        { startAfter: CONFIG.CIMB_OFFER_AFTER_HOURS * 60 * 60 },
      );
  });
};
