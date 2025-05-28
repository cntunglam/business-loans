import { ApplicationStepsEnum, LoanRequestTypeEnum, MinMaxSettings } from '@roshi/shared';
import { getPhoneSchema } from '@roshi/shared/models/common.model';
import { z } from 'zod';
import { getAgeFromDateOfBirth } from '../utils/age';
import { regularPersonalLoanSteps } from './applicationSteps/general';
import { zeroInterestLoanSteps } from './applicationSteps/zeroInterest';

// Individual step validations for backward compatibility
export const ApplicationSteps = {
  [ApplicationStepsEnum.borrowAmount]: {
    validation: (data: unknown, settings: MinMaxSettings) =>
      z.coerce.number().int().min(settings.min).max(settings.max).parse(data),
  },
  [ApplicationStepsEnum.borrowPeriod]: {
    validation: (data: unknown, settings: MinMaxSettings) =>
      z.coerce.number().int().min(settings.min).max(settings.max).parse(data),
  },
  [ApplicationStepsEnum.borrowPurpose]: {
    validation: (data: unknown) => z.string().min(3).max(255).parse(data),
  },
  [ApplicationStepsEnum.fullName]: {
    validation: (data: unknown) => z.string().min(3).max(255).parse(data),
  },
  [ApplicationStepsEnum.cccdNumber]: {
    validation: (data: unknown) => z.string().min(9, { message: 'Must be a valid CCCD number' }).max(12).parse(data),
  },
  [ApplicationStepsEnum.phoneNumber]: {
    validation: (data: unknown) => getPhoneSchema().nullable().optional().parse(data),
  },
  [ApplicationStepsEnum.email]: {
    validation: (data: unknown) => z.string().email().parse(data),
  },
  [ApplicationStepsEnum.dateOfBirth]: {
    validation: (data: unknown, settings: MinMaxSettings) =>
      z.coerce
        .date({ invalid_type_error: 'Must be a valid date' })
        .refine(
          (dob) => {
            const age = getAgeFromDateOfBirth(dob);
            return age >= settings.min && age <= settings.max;
          },
          {
            message: `Tuổi phải nằm trong khoảng từ ${settings.min} đến ${settings.max}`,
          },
        )
        .parse(data),
  },
  [ApplicationStepsEnum.monthlyIncome]: {
    validation: (data: unknown) => z.coerce.number().nonnegative().parse(data),
  },
  [ApplicationStepsEnum.jobTitle]: {
    validation: (data: unknown) => z.string().max(255).parse(data),
  },
  [ApplicationStepsEnum.hasLaborContract]: {
    validation: (data: unknown) => z.boolean().parse(data),
  },
  [ApplicationStepsEnum.streetAddress]: {
    validation: (data: unknown) => z.string().max(255).parse(data),
  },
  [ApplicationStepsEnum.city]: {
    validation: (data: unknown) => z.string().max(255).parse(data),
  },
  [ApplicationStepsEnum.province]: {
    validation: (data: unknown) => z.string().max(255).parse(data),
  },
  [ApplicationStepsEnum.residencyStatus]: {
    validation: (data: unknown) => z.string().optional().nullable(),
  },
} as const;

export const loanRequestTypeToSteps = {
  [LoanRequestTypeEnum.GENERAL]: regularPersonalLoanSteps,
  [LoanRequestTypeEnum.ZERO_INTEREST]: zeroInterestLoanSteps,
} as const;
