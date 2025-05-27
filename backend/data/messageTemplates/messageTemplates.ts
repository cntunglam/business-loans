import { MessageTemplatesEnum } from '@roshi/shared';
import { CONFIG } from '../../config';
import appointmentCancelled from './templates/appointmentCancelled';
import appointmentConfirmation from './templates/appointmentConfirmation';
import appointmentReminder from './templates/appointmentReminder';
import appointmentReminderLender from './templates/appointmentReminderLender';
import borrowerContactLender from './templates/borrowerContactLender';
import cashbackOffer from './templates/cashbackOffer';
import cashbackOffer2 from './templates/cashbackOffer2';
import cimbOffer from './templates/cimbOffer';
import feedback from './templates/feedback';
import lenderAppointmentCancelled from './templates/lender/lenderAppointmentCancelled';
import lenderAppointmentOutcomeReminder from './templates/lender/lenderAppointmentOutcomeReminder';
import lenderAppointmentScheduled from './templates/lender/lenderAppointmentScheduled';
import lowerAmountDisbursed from './templates/lowerAmountDisbursed';
import { offersFound } from './templates/offersFound';
import priceBeat from './templates/priceBeat';
import rejected from './templates/rejected';
import reviewLink from './templates/reviewLink';
import voucherPaid from './templates/voucherPaid';
import voucherPending from './templates/voucherPending';
import welcome from './templates/welcome';
import welcomeWithOffers from './templates/welcomeWithOffers';

export const commonVariables: Record<string, string> = {
  reviewLink: 'https://g.page/r/Cd_JxOad2yffEB0/review',
  userDashboardLink: `${CONFIG.CLIENT_APP_URL}user/dashboard`,
  userDocumentsLink: `${CONFIG.CLIENT_APP_URL}user/documents`,
  lenderDashboardLink: `${CONFIG.CLIENT_APP_URL}lender/dashboard`,
};

type MessageTemplatePayload = {
  [MessageTemplatesEnum.REVIEW_LINK]: { name: string };
  [MessageTemplatesEnum.APPOINTMENT_REMINDER]: {
    name: string;
    lenderName: string;
    date: string;
    time: string;
    location: string;
  };
  [MessageTemplatesEnum.APPOINTMENT_REMINDER_LENDER]: {
    companyName: string;
    phone: string;
    date: string;
    loanRequestId: string;
    name: string;
  };
  [MessageTemplatesEnum.BORROWER_CONTACT_LENDER]: null;
  [MessageTemplatesEnum.VOUCHER_PENDING]: null;
  [MessageTemplatesEnum.VOUCHER_PAID]: null;
  [MessageTemplatesEnum.WELCOME]: { name: string; shortID: string };
  [MessageTemplatesEnum.WELCOME_WITH_OFFERS]: {
    name: string;
    shortID: string;
    offersCount: number;
    offers: string;
    bookingUrl: string;
  };
  [MessageTemplatesEnum.OFFERS_FOUND]: { name: string; offersCount: number; bookingUrl: string; offers: string };
  [MessageTemplatesEnum.REJECTED]: { name: string };
  [MessageTemplatesEnum.APPOINTMENT_CONFIRMATION]: {
    name: string;
    lenderName: string;
    date: string;
    time: string;
    location: string;
  };
  [MessageTemplatesEnum.APPOINTMENT_CANCELED]: {
    name: string;
  };
  [MessageTemplatesEnum.CASHBACK_OFFER]: null;
  [MessageTemplatesEnum.CASHBACK_OFFER2]: null;
  [MessageTemplatesEnum.PRICE_BEAT_OFFER]: null;
  [MessageTemplatesEnum.CIMB_OFFER]: { name: string; link: string };
  [MessageTemplatesEnum.FEEDBACK]: null;
  [MessageTemplatesEnum.LENDER_APPOINTMENT_SCHEDULED]: {
    borrowerName: string;
    date: string;
    time: string;
    location: string;
  };
  [MessageTemplatesEnum.LENDER_APPOINTMENT_CANCELED]: { borrowerName: string };
  [MessageTemplatesEnum.LENDER_APPOINTMENT_OUTCOME_REMINDER]: {
    borrowerName: string;
    date: string;
    time: string;
  };
  [MessageTemplatesEnum.LOWER_AMOUNT_DISBURSED]: {
    name: string;
    lender: string;
    requestedAmount: string;
    disbursedAmount: string;
    offers: string;
    bookingUrl: string;
  };
};

export const messageTemplates = {
  [MessageTemplatesEnum.REVIEW_LINK]: reviewLink,
  [MessageTemplatesEnum.APPOINTMENT_REMINDER]: appointmentReminder,
  [MessageTemplatesEnum.APPOINTMENT_REMINDER_LENDER]: appointmentReminderLender,
  [MessageTemplatesEnum.BORROWER_CONTACT_LENDER]: borrowerContactLender,
  [MessageTemplatesEnum.VOUCHER_PENDING]: voucherPending,
  [MessageTemplatesEnum.VOUCHER_PAID]: voucherPaid,
  [MessageTemplatesEnum.WELCOME]: welcome,
  [MessageTemplatesEnum.WELCOME_WITH_OFFERS]: welcomeWithOffers,
  [MessageTemplatesEnum.OFFERS_FOUND]: offersFound,
  [MessageTemplatesEnum.REJECTED]: rejected,
  [MessageTemplatesEnum.APPOINTMENT_CONFIRMATION]: appointmentConfirmation,
  [MessageTemplatesEnum.APPOINTMENT_CANCELED]: appointmentCancelled,
  [MessageTemplatesEnum.CASHBACK_OFFER]: cashbackOffer,
  [MessageTemplatesEnum.CASHBACK_OFFER2]: cashbackOffer2,
  [MessageTemplatesEnum.PRICE_BEAT_OFFER]: priceBeat,
  [MessageTemplatesEnum.CIMB_OFFER]: cimbOffer,
  [MessageTemplatesEnum.FEEDBACK]: feedback,
  [MessageTemplatesEnum.LENDER_APPOINTMENT_SCHEDULED]: lenderAppointmentScheduled,
  [MessageTemplatesEnum.LENDER_APPOINTMENT_CANCELED]: lenderAppointmentCancelled,
  [MessageTemplatesEnum.LENDER_APPOINTMENT_OUTCOME_REMINDER]: lenderAppointmentOutcomeReminder,
  [MessageTemplatesEnum.LOWER_AMOUNT_DISBURSED]: lowerAmountDisbursed,
} as const;

export type MessageTemplateData<T extends MessageTemplatesEnum> = MessageTemplatePayload[T];

export const generateMessage = <T extends MessageTemplatesEnum>(template: T, data?: MessageTemplateData<T>) => {
  return messageTemplates[template].replace(/{#(.*?)#}/g, (_, key) => {
    return ({ ...commonVariables, ...(data || {}) } as Record<string, string>)[key];
  });
};

export const loanOffersToText = (
  offers: { lenderName: string; amount: string; interestRate: string; tenure: string }[],
) =>
  offers
    .map(
      (offer) =>
        `💰 Offer from ${offer.lenderName}\n• Amount: $${offer.amount}\n• Interest: ${offer.interestRate}%\n• Tenure: ${offer.tenure} months`,
    )
    .join('\n\n');
