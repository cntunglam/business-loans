import { ERROR_KEYS, ErrorResponse } from '@roshi/shared';
import { toast } from 'react-toastify';
import { z, ZodIssue } from 'zod';

export const ERROR_CODE_TO_MESSAGE = {
  [ERROR_KEYS.INTERNAL_ERROR]: 'Something went wrong. Please try again later',
  [ERROR_KEYS.INVALID_OTP]: 'Invalid OTP',
  [ERROR_KEYS.VALIDATION_ERROR]: 'Invalid data',
  [ERROR_KEYS.NOT_FOUND]: 'Not found',
  [ERROR_KEYS.UNAUTHORIZED]: 'Unauthorized',
  [ERROR_KEYS.FORBIDDEN]: 'Forbidden',
  [ERROR_KEYS.COMPANY_NOT_FOUND]: 'Company not found',
  [ERROR_KEYS.INVALID_FILE]: 'Invalid file',
  [ERROR_KEYS.ERROR_UPLOADING_FILE]: 'Error uploading file',
  [ERROR_KEYS.DOCUMENT_ALREADY_UPLOADED]: 'Document already uploaded',
  [ERROR_KEYS.TOO_SOON]: 'Too soon',
  [ERROR_KEYS.ONLY_ONE_OFFER_PER_APPLICATION]: 'Only one offer per application',
  [ERROR_KEYS.CANNOT_UPDATE_ACCEPTED_OFFER]: 'Cannot update accepted offer',
  [ERROR_KEYS.ONLY_ONE_APPLICATION_PER_USER]: 'Only one application per user',
  [ERROR_KEYS.EMAIL_SERVER_ERROR]: 'Email server error',
  [ERROR_KEYS.INVALID_DATE]: 'Invalid date',
  [ERROR_KEYS.APPOINTMENT_TOO_SOON]: 'Appointment must be scheduled at least 60 minutes in advance',
  [ERROR_KEYS.ONLY_ONE_APPOINTMENT_ALLOWED]: 'Only one appointment allowed',
  [ERROR_KEYS.ERROR_SENDING_WA_MESSAGE]: 'Error sending whatsapp message',
  [ERROR_KEYS.ONLY_ONE_GUARANTOR_ALLOWED]: 'Only one guarantor allowed',
  [ERROR_KEYS.ALREADY_SUBMITTED]: 'Already submitted',
  [ERROR_KEYS.PHONE_NUMBER_ALREADY_USED]: 'Phone number already used',
  [ERROR_KEYS.LOAN_REQUEST_CLOSED]: 'Loan request closed',
  [ERROR_KEYS.EMAIL_NOTIFICATION_NOT_SUPPORTED]: 'Email notification not supported',
  [ERROR_KEYS.TELEGRAM_NOTIFICATION_NOT_SUPPORTED]: 'Telegram notification not supported',
  [ERROR_KEYS.WHATSAPP_NOTIFICATION_NOT_SUPPORTED]: 'Whatsapp notification not supported',
  [ERROR_KEYS.WHATSAPP_INCOMPLETE_PAYLOAD]: 'Whatsapp incomplete payload',
  [ERROR_KEYS.SELECTED_DATE_HOLIDAY]: 'Selected date is holiday',
  [ERROR_KEYS.WHATSAPP_UNKNOWN_APPLICATION_ID]: 'Whatsapp unknown application id',
  [ERROR_KEYS.WHATSAPP_MISSING_TARGET]: 'Whatsapp missing target',
  [ERROR_KEYS.INVALID_OR_EXPIRED_LINK]: 'Invalid or expired link',
  [ERROR_KEYS.BAD_REQUEST]: 'Bad request',
  [ERROR_KEYS.TIME_EXCEEDED_24H_UPDATE]: 'The update time limit has exceeded 24 hours',
  [ERROR_KEYS.INVALID_LOAN_REQUEST_STATUS]: 'Invalid loan request status',
  [ERROR_KEYS.EXPIRED]: 'Expired',
  [ERROR_KEYS.ALREADY_CANCELLED]: 'Already cancelled',
  [ERROR_KEYS.ONLY_ONE_APPLICATION_PER_24H]: 'You have applied too many times. Would you like to restore your deleted application?',
  [ERROR_KEYS.COMPANY_IS_FROZEN]: 'Your account has been frozen and you cannot make new offers. Contact support for more information'
};

export const isErrorResponse = (data: unknown): data is ErrorResponse => {
  return z.object({ error: z.object({ code: z.string() }) }).parse(data).error !== undefined;
};

export const getErrorMessage = (error: ErrorResponse) => {
  switch (error.error.code) {
    case ERROR_KEYS.VALIDATION_ERROR:
      //Zod error
      return (error.error.fields as ZodIssue[])[0].message;
    case ERROR_KEYS.INVALID_FILE:
      return `Invalid file. Allowed files: ${(error.error.fields as string[]).join(',')}`;
    default:
      return error.error.code in ERROR_CODE_TO_MESSAGE
        ? ERROR_CODE_TO_MESSAGE[error.error.code]
        : 'Something went wrong. Please try again later';
  }
};

//TODO use i18n
export const handleError = (error: ErrorResponse) => {
  const message = getErrorMessage(error);
  toast.error(message);
};
