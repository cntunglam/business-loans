import {
  ApplicationStepsEnum,
  employmentStatusesEnum,
  EmploymentTimeEnum,
  LoanRequestTypeEnum,
  MinMaxSettings,
  propertyOwnershipsEnum,
  residencyStatusesEnum,
} from '@roshi/shared';
import { getPhoneSchema } from '@roshi/shared/models/common.model';
import { z } from 'zod';
import { regularPersonalLoanSteps } from './applicationSteps/general';
import { zeroInterestLoanSteps } from './applicationSteps/zeroInterest';

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
  [ApplicationStepsEnum.nricNumber]: {
    validation: (data: unknown) => z.string().parse(data),
  },
  [ApplicationStepsEnum.residencyStatus]: {
    validation: (data: unknown) => z.nativeEnum(residencyStatusesEnum).parse(data),
  },
  [ApplicationStepsEnum.age]: {
    validation: (data: unknown, settings: MinMaxSettings) =>
      z.coerce.number().int().min(settings.min).max(settings.max).parse(data),
  },
  [ApplicationStepsEnum.monthlyIncome]: {
    validation: (data: unknown) => z.coerce.number().nonnegative().parse(data),
  },
  [ApplicationStepsEnum.occupation]: {
    validation: (data: unknown) =>
      z.object({ employmentStatus: z.nativeEnum(employmentStatusesEnum), jobTitle: z.string().optional() }).parse(data),
  },
  [ApplicationStepsEnum.occupationTime]: {
    validation: (data: unknown) =>
      z
        .object({
          currentEmploymentTime: z.nativeEnum(EmploymentTimeEnum),
          previousEmploymentTime: z.nativeEnum(EmploymentTimeEnum),
        })
        .parse(data),
  },
  [ApplicationStepsEnum.propertyOwnership]: {
    validation: (data: unknown) =>
      z
        .object({
          propertyOwnership: z.nativeEnum(propertyOwnershipsEnum, {
            errorMap: () => ({ message: 'Please select a property ownership type' }),
          }),
          postalCode: z.coerce.string({ message: 'Invalid postal code' }).optional(),
        })
        .parse(data),
  },
  [ApplicationStepsEnum.existingLoans]: {
    validation: (data: unknown) =>
      z
        .object({
          bankDebt: z.coerce.number().int().nonnegative(),
          lenderDebt: z.coerce.number().int().nonnegative(),
        })
        .parse(data),
  },
  [ApplicationStepsEnum.fullName]: {
    validation: (data: unknown) => z.string().min(3).max(255).parse(data),
  },
  [ApplicationStepsEnum.phoneNumber]: {
    validation: (data: unknown) => getPhoneSchema().parse(data),
  },
};

export const loanRequestTypeToSteps = {
  [LoanRequestTypeEnum.GENERAL]: regularPersonalLoanSteps,
  [LoanRequestTypeEnum.ZERO_INTEREST]: zeroInterestLoanSteps,
} as const;
