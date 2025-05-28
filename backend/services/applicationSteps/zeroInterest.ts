import { ApplicationStepsEnum, ApplicationStepsImagesEnum, StepDetails } from '@roshi/shared';
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
  },
  {
    key: ApplicationStepsEnum.cccdNumber,
    title: ApplicationStepsLabels[ApplicationStepsEnum.cccdNumber],
  },
  {
    key: ApplicationStepsEnum.dateOfBirth,
    title: ApplicationStepsLabels[ApplicationStepsEnum.dateOfBirth],
  },
  {
    key: ApplicationStepsEnum.monthlyIncome,
    title: ApplicationStepsLabels[ApplicationStepsEnum.monthlyIncome],
    image: ApplicationStepsImagesEnum.cashback,
  },
  {
    key: ApplicationStepsEnum.hasLaborContract,
    title: ApplicationStepsLabels[ApplicationStepsEnum.hasLaborContract],
    settings: { options: ['Có', 'Không'] },
  },
  {
    key: ApplicationStepsEnum.fullName,
    title: ApplicationStepsLabels[ApplicationStepsEnum.fullName],
    image: ApplicationStepsImagesEnum.bestOffers,
  },
  {
    key: ApplicationStepsEnum.streetAddress,
    title: ApplicationStepsLabels[ApplicationStepsEnum.streetAddress],
  },
  {
    key: ApplicationStepsEnum.city,
    title: ApplicationStepsLabels[ApplicationStepsEnum.city],
  },
  {
    key: ApplicationStepsEnum.province,
    title: ApplicationStepsLabels[ApplicationStepsEnum.province],
  },
  {
    key: ApplicationStepsEnum.email,
    title: ApplicationStepsLabels[ApplicationStepsEnum.email],
  },
];
