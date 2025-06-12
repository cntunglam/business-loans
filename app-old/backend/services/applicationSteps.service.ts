import {
  ApplicationStepsEnum,
  ApplyingStepErrorLabels,
  ApplyingStepRequireErrorLabels,
  LoanRequestTypeEnum,
  MinMaxSettings,
} from '@roshi/shared';
import { getPhoneSchema } from '@roshi/shared/models/common.model';
import { z } from 'zod';
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
    validation: (data: unknown) =>
      z
        .string({
          message: ApplyingStepRequireErrorLabels[ApplicationStepsEnum.borrowPurpose],
        })
        .min(3)
        .max(255)
        .parse(data),
  },
  [ApplicationStepsEnum.fullName]: {
    validation: (data: unknown) =>
      z
        .string({
          message: ApplyingStepRequireErrorLabels[ApplicationStepsEnum.fullName],
        })
        .min(3, {
          message: ApplyingStepErrorLabels[ApplicationStepsEnum.fullName],
        })
        .max(255)
        .parse(data),
  },
  [ApplicationStepsEnum.cccdNumber]: {
    validation: (data: unknown) =>
      z
        .string({ message: ApplyingStepRequireErrorLabels[ApplicationStepsEnum.cccdNumber] })
        .min(9, { message: ApplyingStepErrorLabels[ApplicationStepsEnum.cccdNumber] })
        .max(12)
        .parse(data),
  },
  [ApplicationStepsEnum.phoneNumber]: {
    validation: (data: unknown) => getPhoneSchema().nullable().optional().parse(data),
  },
  [ApplicationStepsEnum.email]: {
    validation: (data: unknown) => z.string().email().parse(data),
  },
  [ApplicationStepsEnum.dateOfBirth]: {
    validation: (data: unknown) => z.coerce.date().parse(data),
  },
  [ApplicationStepsEnum.monthlyIncome]: {
    validation: (data: unknown, settings: MinMaxSettings) =>
      z.coerce.number().int().min(settings.min).max(settings.max).parse(data),
  },
  [ApplicationStepsEnum.employmentType]: {
    validation: (data: unknown) =>
      z
        .string({
          message: ApplyingStepRequireErrorLabels[ApplicationStepsEnum.employmentType],
        })
        .max(255)
        .parse(data),
  },
  [ApplicationStepsEnum.hasLaborContract]: {
    validation: (data: unknown) => z.boolean().parse(data),
  },
  [ApplicationStepsEnum.currentAddress]: {
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
