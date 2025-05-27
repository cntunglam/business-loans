import { VALIDATION_MESSAGES } from '@roshi/shared/locales/vi/validation';
import { validateCCCD } from '@roshi/shared/utils/cccdValidator';

export const nricNumberValidation = (value: string) => {
  if (!value) {
    throw new Error(VALIDATION_MESSAGES.CCCD.REQUIRED);
  }

  if (!validateCCCD(value)) {
    throw new Error(VALIDATION_MESSAGES.CCCD.INVALID);
  }

  return value;
};
