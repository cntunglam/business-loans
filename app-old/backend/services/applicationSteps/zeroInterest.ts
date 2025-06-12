import {
  ApplicationStepsEnum,
  ApplicationStepsImagesEnum,
  employmentTypeEnum,
  loanPurposesEnum,
  StepDetails,
} from '@roshi/shared';
import { ApplicationStepsLabels } from './general';

export const zeroInterestLoanSteps: StepDetails[] = [
  {
    key: ApplicationStepsEnum.borrowAmount,
    title: ApplicationStepsLabels[ApplicationStepsEnum.borrowAmount],
    settings: { min: 1_000_000, max: 1_000_000_000 },
  },
  {
    key: ApplicationStepsEnum.borrowPeriod,
    title: ApplicationStepsLabels[ApplicationStepsEnum.borrowPeriod],
    settings: { min: 3, max: 72 },
  },
  {
    key: ApplicationStepsEnum.borrowPurpose,
    image: ApplicationStepsImagesEnum.loanOffers,
    title: ApplicationStepsLabels[ApplicationStepsEnum.borrowPurpose],
    settings: { options: Object.values(loanPurposesEnum) },
  },
  {
    key: ApplicationStepsEnum.cccdNumber,
    title: ApplicationStepsLabels[ApplicationStepsEnum.cccdNumber],
  },
  {
    key: ApplicationStepsEnum.employmentType,
    title: ApplicationStepsLabels[ApplicationStepsEnum.employmentType],
    settings: { options: Object.values(employmentTypeEnum) },
  },
  {
    key: ApplicationStepsEnum.dateOfBirth,
    title: ApplicationStepsLabels[ApplicationStepsEnum.dateOfBirth],
    settings: { min: 21, max: 65 },
  },
  {
    key: ApplicationStepsEnum.monthlyIncome,
    title: ApplicationStepsLabels[ApplicationStepsEnum.monthlyIncome],
    image: ApplicationStepsImagesEnum.cashback,
  },
  {
    key: ApplicationStepsEnum.hasLaborContract,
    title: ApplicationStepsLabels[ApplicationStepsEnum.hasLaborContract],
    settings: { options: ['YES', 'NO'] },
  },
  {
    key: ApplicationStepsEnum.currentAddress,
    title: ApplicationStepsLabels[ApplicationStepsEnum.currentAddress],
  },
  {
    key: ApplicationStepsEnum.fullName,
    title: ApplicationStepsLabels[ApplicationStepsEnum.fullName],
    image: ApplicationStepsImagesEnum.bestOffers,
  },
];
