import { emailClient } from '../clients/emailClient';
import { CONFIG } from '../config';
import { emailTemplates, generateEmail } from '../data/emailTemplates/emailTemplates';
import { generateUnsubHtml } from '../data/emailTemplates/emailTemplatesHelper';

export enum EmailTypeEnum {
  WELCOME = 'WELCOME',
  OTP = 'OTP',
  LOAN_OFFER_RECEIVED = 'LOAN_OFFER_RECEIVED',
  NEW_LOAN_REQUEST = 'NEW_LOAN_REQUEST',
  APPOINTMENT_SCHEDULED = 'NEW_APPOINTMENT',
  APPOINTMENT_CANCELED = 'APPOINTMENT_CANCELED',
  OFFER_SELECTED = 'OFFER_SELECTED',
  AUTO_IPA = 'AUTO_IPA',
}

export const EmailDetails = {
  [EmailTypeEnum.OTP]: {
    subject: 'ROSHI confirmation code',
    template: 'otp',
  },
  [EmailTypeEnum.WELCOME]: {
    subject: 'Personal Welcome Mail',
    template: 'welcome',
  },
  [EmailTypeEnum.LOAN_OFFER_RECEIVED]: {
    subject: 'Loan offer received',
    template: 'loanOfferReceived',
  },
  [EmailTypeEnum.NEW_LOAN_REQUEST]: {
    subject: 'New loan request',
    template: 'newLoanRequest',
  },
  [EmailTypeEnum.OFFER_SELECTED]: {
    subject: 'Offer was selected',
    template: 'selectOffer',
  },
  [EmailTypeEnum.APPOINTMENT_SCHEDULED]: {
    subject: 'New appointment scheduled',
    template: 'appointmentScheduled',
  },
  [EmailTypeEnum.APPOINTMENT_CANCELED]: {
    subject: 'An appointment was cancelled',
    template: 'cancelAppointment',
  },
  [EmailTypeEnum.AUTO_IPA]: {
    subject: 'Auto-IPA made an offer for you',
    template: 'autoIPA',
  },
} as const;

export const sendEmail = async <T extends EmailTypeEnum>(
  email: string,
  emailType: T,
  data: Parameters<(typeof emailTemplates)[(typeof EmailDetails)[T]['template']]['variables']>[0],
  additionalInformation?: { headerSlots?: string; footerSlot?: string },
) => {
  const unsubscribeHtml = await generateUnsubHtml(email);
  const emailDetails = EmailDetails[emailType];
  if (!emailDetails) {
    throw new Error(`Email type ${emailType} not found`);
  }

  return emailClient.sendMail({
    to: email,
    from: { name: 'ROSHI Marketplace', address: CONFIG.MAIL_FROM },
    subject: emailDetails.subject,
    html: generateEmail(emailDetails.template, data, {
      unsubscribe: unsubscribeHtml,
      footerSlot: additionalInformation?.footerSlot || '',
    }),
  });
};
