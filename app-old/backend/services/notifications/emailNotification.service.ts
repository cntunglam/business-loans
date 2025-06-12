import {
  ERROR_KEYS,
  formatWithoutTz,
  loanPurposesEnum,
  loanPurposesLabels,
  LoanResponseStatusEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { addHours } from 'date-fns';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import PgBoss from 'pg-boss';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { generateOffersHtml, generateUnsubReapplyLoanHtml } from '../../data/emailTemplates/emailTemplatesHelper';
import { RoshiError } from '../../utils/roshiError';
import { getClientLink, isCurrentTimeAppropriate } from '../../utils/utils';
import { getAppointment } from '../appointment.service';
import { EmailTypeEnum, sendEmail } from '../email.service';
import { formatLoanRequestForLender, getLoanRequest } from '../loanRequest.service';
import { NotifPayloadParams } from '../notification.service';
import { generateBookingUrl } from '../shortUrl.service';

type Response = Promise<
  {
    reason?: string;
    retry?: PgBoss.SendOptions['startAfter'];
  } & Partial<SMTPTransport.SentMessageInfo>
>;
export const handleEmailNotification = async <T extends NotificationTypeEnum>(
  recipientEmail: string,
  notificationType: T,
  params: { loanRequestId: string; targetUser: UserRoleEnum; batchId?: string | null } & NotifPayloadParams<T>,
): Response => {
  const loanRequest = await getLoanRequest(params.loanRequestId);
  if (!loanRequest) throw new RoshiError(ERROR_KEYS.NOT_FOUND, { message: 'Loan request not found' });
  switch (notificationType) {
    case NotificationTypeEnum.REAPPLY_OFFERS: {
      const offers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.ACCEPTED);
      const rejectedOffers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.REJECTED);

      //Check if time is appropriate to send message
      if (!isCurrentTimeAppropriate())
        return { retry: addHours(new Date(), CONFIG.RETRY_FOLLOW_UP_AFTER_HOURS), reason: 'Innapropriate time' };

      if (
        offers.length > 0 &&
        offers.length + rejectedOffers.length >= CONFIG.MIN_REQUIRED_RESPONSES_FOR_POSITIVE_FOLLOW_UP
      ) {
        const bookingUrl = await generateBookingUrl(loanRequest.user.id);
        return sendEmail(
          recipientEmail,
          EmailTypeEnum.LOAN_OFFER_RECEIVED,
          {
            bookingUrl: bookingUrl,
            offers: generateOffersHtml(offers),
            offersCount: offers.length.toString(),
          },
          { footerSlot: await generateUnsubReapplyLoanHtml(recipientEmail) },
        );
      }
      if (rejectedOffers.length >= CONFIG.REJECTION_THRESHOLD) {
        return { reason: 'No offers given. Ignoring re-apply' };
      } else {
        //Try again after 2 hours. We try again until rejected offers count is >= REJECTION_THRESHOLD or accepted offers count is > 0
        return {
          retry: addHours(new Date(), CONFIG.RETRY_FOLLOW_UP_AFTER_HOURS),
          reason: 'No offers and not fully rejected',
        };
      }
    }
    case NotificationTypeEnum.APPOINTMENT_SCHEDULED: {
      const typedParams = params as NotifPayloadParams<NotificationTypeEnum.APPOINTMENT_SCHEDULED>;
      const appointment = await getAppointment(typedParams.appointmentId);
      return sendEmail(recipientEmail, EmailTypeEnum.APPOINTMENT_SCHEDULED, {
        lenderName: appointment.loanResponse.lender?.name || '',
        address: appointment.openingHours?.store?.address || '',
        scheduleTime: appointment.scheduledTime ? formatWithoutTz(appointment.scheduledTime, 'dd MMMM yyyy HH:mm') : '',
        mapsUrl: appointment.openingHours?.store?.mapsUrl || '',
        link: getClientLink(params.targetUser),
      });
    }
    case NotificationTypeEnum.APPOINTMENT_CANCELED: {
      return sendEmail(recipientEmail, EmailTypeEnum.APPOINTMENT_CANCELED, {
        link: getClientLink(params.targetUser, params.loanRequestId),
      });
    }
    case NotificationTypeEnum.OFFER_SELECTED: {
      //We don't send this notification anymore
      return { reason: 'Email not sent. Offer selected notification is not supported anymore' };
    }
    case NotificationTypeEnum.OFFER_RECEIVED: {
      if (loanRequest.isAutoReapply) {
        return { reason: "We don't send this notification for auto-reapply requests" };
      }
      //Get all loan responses with same batch ID
      const loanResponseNotifications = await prismaClient.notification.findMany({
        where: { sentAt: null, batchId: params.batchId },
      });
      //Make sure they all exist
      const loanResponses = await prismaClient.loanResponse.findMany({
        where: {
          id: {
            in: loanResponseNotifications.map((notif) => {
              const typedParams = notif.payload as NotifPayloadParams<NotificationTypeEnum.OFFER_RECEIVED>;
              return typedParams.loanResponseId;
            }),
          },
          status: LoanResponseStatusEnum.ACCEPTED,
        },
        include: { lender: true, loanOffer: true },
      });
      const offersHtml = generateOffersHtml(loanResponses);

      return sendEmail(recipientEmail, EmailTypeEnum.LOAN_OFFER_RECEIVED, {
        offers: offersHtml,
        offersCount: loanResponses.length.toString(),
        bookingUrl: await generateBookingUrl(loanRequest.user.id),
      });
    }
    case NotificationTypeEnum.NEW_LOAN_REQUEST: {
      const formatted = formatLoanRequestForLender(loanRequest);
      return sendEmail(recipientEmail, EmailTypeEnum.NEW_LOAN_REQUEST, {
        amount: formatted.amount.toString(),
        purpose: loanPurposesLabels[formatted.purpose as loanPurposesEnum],
        term: formatted.term.toString(),
        monthlyIncome: (formatted.applicantInfo?.monthlyIncome || '').toString(),
        residencyStatus: formatted.applicantInfo?.residencyStatus || '',
        loanRequestLink: getClientLink(params.targetUser, params.loanRequestId),
      });
    }
    default: {
      throw new RoshiError(ERROR_KEYS.EMAIL_NOTIFICATION_NOT_SUPPORTED, { fields: { notificationType } });
    }
  }
};
