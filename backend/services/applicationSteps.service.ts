import {
  ApplicationStepsEnum,
  ApplyingStepRequireErrorLabels,
  LoanRequestTypeEnum,
  MinMaxSettings,
} from '@roshi/shared';
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
  [ApplicationStepsEnum.companyName]: {
    validation: (data: unknown) =>
      z
        .string({
          message: ApplyingStepRequireErrorLabels[ApplicationStepsEnum.companyName],
        })
        .min(3)
        .max(255)
        .parse(data),
  },
  [ApplicationStepsEnum.companyUENumber]: {
    validation: (data: unknown) =>
      z
        .string({
          message: ApplyingStepRequireErrorLabels[ApplicationStepsEnum.companyUENumber],
        })
        .min(9)
        .max(9)
        .parse(data),
  },
  [ApplicationStepsEnum.companyEmployeeInfo]: {
    validation: (data: unknown) =>
      z
        .string({
          message: ApplyingStepRequireErrorLabels[ApplicationStepsEnum.companyEmployeeInfo],
        })
        .min(3)
        .max(255)
        .parse(data),
  },
  [ApplicationStepsEnum.phoneNumber]: {
    validation: (data: unknown) => z.string().min(8).max(15).parse(data),
  },
  [ApplicationStepsEnum.currentAddress]: {
    validation: (data: unknown) =>
      z
        .object({
          detail: z.string().min(1),
          provinceId: z.string().optional(),
          districtId: z.string().optional(),
        })
        .parse(data),
  },
  [ApplicationStepsEnum.dateOfBirth]: {
    validation: (data: unknown) => z.coerce.date().parse(data),
  },
  [ApplicationStepsEnum.hasLaborContract]: {
    validation: (data: unknown) => z.boolean().parse(data),
  },
  [ApplicationStepsEnum.monthlyIncome]: {
    validation: (data: unknown, settings: MinMaxSettings) =>
      z.coerce.number().int().min(settings.min).max(settings.max).parse(data),
  },
  [ApplicationStepsEnum.cccdNumber]: {
    validation: (data: unknown) => z.string().length(12).parse(data),
  },
  [ApplicationStepsEnum.employmentType]: {
    validation: (data: unknown) => z.string().min(1).max(255).parse(data),
  },
} as const;

export const loanRequestTypeToSteps = {
  [LoanRequestTypeEnum.GENERAL]: regularPersonalLoanSteps,
  [LoanRequestTypeEnum.ZERO_INTEREST]: zeroInterestLoanSteps,
} as const;
