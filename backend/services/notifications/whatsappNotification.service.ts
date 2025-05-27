import {
  AwaitedRT,
  ERROR_KEYS,
  formatWithoutTz,
  LoanRequestStatusEnum,
  LoanResponse,
  LoanResponseStatusEnum,
  MessageTemplatesEnum,
  NotificationStatusEnum,
  NotificationTypeEnum,
  shortId,
  ShortUrlTypeEnum,
  StatusEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { addHours } from 'date-fns';
import PgBoss from 'pg-boss';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { generateMessage, loanOffersToText } from '../../data/messageTemplates/messageTemplates';
import { RoshiError } from '../../utils/roshiError';
import { generateShortUrl } from '../../utils/roshiUtils';
import { isCurrentTimeAppropriate } from '../../utils/utils';
import { getAppointment } from '../appointment.service';
import { getLoanRequest } from '../loanRequest.service';
import { NotifPayloadParams } from '../notification.service';
import { createShortUrl, generateBookingUrl } from '../shortUrl.service';

type Response = Promise<{ reason?: string; retry?: PgBoss.SendOptions['startAfter']; content?: string }>;

const handlePromotionalNotification = async (loanRequest: AwaitedRT<typeof getLoanRequest>): Response => {
  const waMessagesCount = await prismaClient.waMessage.count({ where: { sourceWaPhone: loanRequest.user.phone! } });
  if (waMessagesCount > 0) return { reason: 'Skipping because user is replying to chat' };
  const offers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.ACCEPTED);
  const rejections = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.REJECTED);
  if (rejections.length >= CONFIG.REJECTION_THRESHOLD && !offers.length) return { reason: 'Too many rejections' };
  //If no offers, but rejection threshold not reached, we retry after 1 hour
  if (!offers.length) return { retry: addHours(new Date(), CONFIG.RETRY_FOLLOW_UP_AFTER_HOURS), reason: 'No offers' };
  //If user received no offers, or if he already scheduled an appointment, we skip this notification
  if (offers.some((off) => off.appointment?.scheduledTime)) return { reason: 'Appointment already set' };
  const shortLink = await createShortUrl({
    type: ShortUrlTypeEnum.REDIRECT,
    targetUrl: CONFIG.CIMB_OFFER_LINK,
    userId: loanRequest.user.id,
  });
  const content = generateMessage(MessageTemplatesEnum.CIMB_OFFER, {
    name: loanRequest.user.name || 'there',
    link: generateShortUrl(shortLink.code),
  });
  return { content };
};

const handleAppointmentNotification = async (
  notificationType: NotificationTypeEnum.APPOINTMENT_REMINDER | NotificationTypeEnum.APPOINTMENT_SCHEDULED,
  loanRequest: AwaitedRT<typeof getLoanRequest>,
  appointmentId: string,
) => {
  const appointment = await getAppointment(appointmentId);
  if (!appointment || !appointment.scheduledTime || !appointment.openingHours?.store || appointment.cancelledAt)
    throw new RoshiError(ERROR_KEYS.NOT_FOUND, {
      message: 'Missing appointment data',
      fields: { appointment: JSON.stringify(appointment) },
    });
  const date = formatWithoutTz(appointment.scheduledTime, 'd MMMM');
  const time = formatWithoutTz(appointment.scheduledTime, 'HH:mm');
  const location = appointment.openingHours?.store.mapsUrl;
  const lenderName = appointment.loanResponse.lender.name;
  const name = loanRequest.user.name || 'there';
  return {
    content: generateMessage(
      notificationType === NotificationTypeEnum.APPOINTMENT_SCHEDULED
        ? MessageTemplatesEnum.APPOINTMENT_CONFIRMATION
        : MessageTemplatesEnum.APPOINTMENT_REMINDER,
      {
        name,
        date,
        time,
        location,
        lenderName,
      },
    ),
  };
};

export const handleWANotification = async <T extends NotificationTypeEnum>(
  notificationType: T,
  params: { loanRequestId: string; targetUser: UserRoleEnum } & NotifPayloadParams<T>,
): Response => {
  const loanRequest = await getLoanRequest(params.loanRequestId);
  if (!loanRequest || loanRequest.status === LoanRequestStatusEnum.DELETED) return {};

  switch (notificationType) {
    case NotificationTypeEnum.REAPPLY_OFFERS: {
      const offers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.ACCEPTED);
      const rejectedOffers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.REJECTED);

      //Check if time is appropriate to send message
      if (!isCurrentTimeAppropriate())
        return { retry: addHours(new Date(), CONFIG.RETRY_FOLLOW_UP_AFTER_HOURS), reason: 'Inappropriate time' };
      if (
        offers.length > 0 &&
        offers.length + rejectedOffers.length >= CONFIG.MIN_REQUIRED_RESPONSES_FOR_POSITIVE_FOLLOW_UP
      ) {
        const bookingUrl = await generateBookingUrl(loanRequest.user.id);

        return {
          content: generateMessage(MessageTemplatesEnum.OFFERS_FOUND, {
            name: loanRequest.user.name || 'there',
            offersCount: offers.length,
            bookingUrl: bookingUrl,
            offers: generateTopOffers(offers),
          }),
        };
      }
      if (rejectedOffers.length >= CONFIG.REJECTION_THRESHOLD) {
        return { reason: 'No offers given. Ignoring re-apply' };
      } else {
        //Try again after x hours. We try again until rejected offers count is >= REJECTION_THRESHOLD or accepted offers count is > 0
        return {
          retry: addHours(new Date(), CONFIG.RETRY_FOLLOW_UP_AFTER_HOURS),
          reason: 'No offers and not fully rejected',
        };
      }
    }
    case NotificationTypeEnum.CIMB_OFFER: {
      return handlePromotionalNotification(loanRequest);
    }
    case NotificationTypeEnum.APPOINTMENT_CANCELED: {
      const content = generateMessage(MessageTemplatesEnum.APPOINTMENT_CANCELED, {
        name: loanRequest.user.name || 'there',
      });
      return { content };
    }
    case NotificationTypeEnum.APPOINTMENT_SCHEDULED:
    case NotificationTypeEnum.APPOINTMENT_REMINDER: {
      const typedParams = params as NotifPayloadParams<NotificationTypeEnum.APPOINTMENT_SCHEDULED>;
      return handleAppointmentNotification(notificationType, loanRequest, typedParams.appointmentId);
    }

    case NotificationTypeEnum.LOAN_REQUEST_FOLLOW_UP: {
      const offers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.ACCEPTED);
      const rejectedOffers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.REJECTED);
      const hasAppointment = offers.some((res) => res.appointment?.scheduledTime);

      //If user already made an appointment, no need to send follow up
      if (hasAppointment) return { reason: 'Appointment already set' };

      //Check if time is appropriate to send message
      if (!isCurrentTimeAppropriate())
        return { retry: addHours(new Date(), CONFIG.RETRY_FOLLOW_UP_AFTER_HOURS), reason: 'Inappropriate time' };

      if (
        offers.length > 0 &&
        offers.length + rejectedOffers.length >= CONFIG.MIN_REQUIRED_RESPONSES_FOR_POSITIVE_FOLLOW_UP
      ) {
        const bookingUrl = await generateBookingUrl(loanRequest.user.id);

        return {
          content: generateMessage(MessageTemplatesEnum.OFFERS_FOUND, {
            name: loanRequest.user.name || 'there',
            offersCount: offers.length,
            bookingUrl: bookingUrl,
            offers: generateTopOffers(offers),
          }),
        };
      }

      if (rejectedOffers.length >= CONFIG.REJECTION_THRESHOLD) {
        return {
          content: generateMessage(MessageTemplatesEnum.REJECTED, { name: loanRequest.user.name || 'Sir/Madam' }),
        };
      } else {
        //Try again after 2 hours. We try again until rejected offers count is >= REJECTION_THRESHOLD or accepted offers count is > 0
        return {
          retry: addHours(new Date(), CONFIG.RETRY_FOLLOW_UP_AFTER_HOURS),
          reason: 'No offers and not fully rejected',
        };
      }
    }
    case NotificationTypeEnum.REVIEW_LINK: {
      const wonCount = await prismaClient.loanResponse.count({
        where: { loanRequestId: params.loanRequestId, outcomeStatus: StatusEnum.APPROVED },
      });
      if (wonCount === 0) return { reason: 'Loan request not fullfilled' };
      return {
        content: generateMessage(MessageTemplatesEnum.REVIEW_LINK, { name: loanRequest.user.name || 'there' }),
      };
    }

    case NotificationTypeEnum.LOWER_AMOUNT_DISBURSED: {
      const notification = await prismaClient.notification.findFirst({
        where: {
          loanRequestId: params.loanRequestId,
          notificationType: NotificationTypeEnum.LOWER_AMOUNT_DISBURSED,
          status: NotificationStatusEnum.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!notification || !notification.payload) {
        return { reason: 'Missing notification data' };
      }
      const payload = notification.payload as any;
      return {
        content: generateMessage(MessageTemplatesEnum.LOWER_AMOUNT_DISBURSED, {
          name: payload.name,
          lender: payload.lender,
          requestedAmount: payload.requestedAmount,
          disbursedAmount: payload.disbursedAmount,
          offers: payload.offers,
          bookingUrl: payload.bookingUrl,
        }),
      };
    }
    case NotificationTypeEnum.WELCOME: {
      const user = await prismaClient.user.findFirstOrThrow({
        where: { loanRequests: { some: { id: params.loanRequestId } } },
      });
      const offers = loanRequest.loanResponses.filter((lr) => lr.status === LoanResponseStatusEnum.ACCEPTED);

      if (offers.length === 0) {
        return {
          content: generateMessage(MessageTemplatesEnum.WELCOME, {
            name: user.name || '',
            shortID: shortId(params.loanRequestId),
          }),
        };
      }

      return {
        content: generateMessage(MessageTemplatesEnum.WELCOME_WITH_OFFERS, {
          name: user.name || '',
          shortID: shortId(params.loanRequestId),
          offersCount: offers.length,
          bookingUrl: await generateBookingUrl(loanRequest.user.id),
          offers: loanOffersToText(
            offers
              .filter((res) => res.loanOffer?.monthlyInterestRate)
              .sort((a, b) => a.loanOffer!.monthlyInterestRate - b.loanOffer!.monthlyInterestRate)
              .map((res) => ({
                lenderName: res.lender.name,
                amount: res.loanOffer!.amount.toString(),
                interestRate: res.loanOffer!.monthlyInterestRate.toString(),
                tenure: res.loanOffer!.term.toString(),
              })),
          ),
        }),
      };
    }
    default: {
      throw new RoshiError(ERROR_KEYS.WHATSAPP_NOTIFICATION_NOT_SUPPORTED, { fields: { notificationType } });
    }
  }
};

type OfferType = LoanResponse & {
  lender: { name: string };
  loanOffer: { amount: number; monthlyInterestRate: number; term: number } | null;
};

const generateTopOffers = (offers: OfferType[]) => {
  const topOffers = offers
    .map((offer) => ({
      lenderName: offer.lender.name,
      amount: offer.loanOffer?.amount || 0,
      interestRate: offer.loanOffer?.monthlyInterestRate || 0,
      tenure: offer.loanOffer?.term || 0,
    }))
    .sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      if (a.interestRate !== b.interestRate) return a.interestRate - b.interestRate;
      return b.tenure - a.tenure;
    })
    .slice(0, 3)
    .map((o) => ({
      ...o,
      amount: o.amount.toString(),
      interestRate: o.interestRate.toString(),
      tenure: o.tenure.toString(),
    }));
  return loanOffersToText(topOffers);
};
