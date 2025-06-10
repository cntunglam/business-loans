import { JobsEnum, WhatsappMessage } from '@roshi/shared';
import { SYNCING_TABLE } from '../clients/zohoCrmClient';

type JobPayloadMap = {
  [JobsEnum.EMAIL_NOTIFICATION]: { notificationId: string };
  [JobsEnum.WEBHOOK_NOTIFICATION]: { notificationId: string };
  [JobsEnum.NEW_LOAN_REQUEST]: { loanRequestId: string };
  [JobsEnum.CHECK_LENDER_FILTERS]: { loanRequestId: string };
  [JobsEnum.WA_MESSAGE_RECEIVED]: WhatsappMessage;
  [JobsEnum.WHATSAPP_NOTIFICATION]: { notificationId: string };
  [JobsEnum.WA_EVENT_RECEIVED]: null;
  [JobsEnum.ZERO_INTEREST_LOAN_REQUEST]: { loanRequestId: string };
  [JobsEnum.REAPPLY_LOAN_REQUEST]: { userId: string };
  [JobsEnum.TELEGRAM_NOTIFICATION]: { notificationId: string };
  [JobsEnum.ACTIVATE_REAPPLY_LOAN_REQUEST]: { loanRequestId: string };
  [JobsEnum.SYNC_TO_ZOHO]: {
    LoanRequest?: string | null;
    ApplicantInfo?: string | null;
    User?: string | null;
    LoanResponse?: string | null;
  } & Partial<Record<keyof typeof SYNCING_TABLE, string | null>>;
};

export type JobPayload<T extends JobsEnum> = JobPayloadMap[T];
