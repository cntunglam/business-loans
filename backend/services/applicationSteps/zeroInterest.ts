import { ApplicationStepsEnum, ApplicationStepsImagesEnum, loanPurposesEnum, StepDetails } from '@roshi/shared';
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
    key: ApplicationStepsEnum.companyName,
    title: ApplicationStepsLabels[ApplicationStepsEnum.companyName],
  },
  {
    key: ApplicationStepsEnum.companyUENumber,
    title: ApplicationStepsLabels[ApplicationStepsEnum.companyUENumber],
  },
  {
    key: ApplicationStepsEnum.companyEmployeeInfo,
    title: ApplicationStepsLabels[ApplicationStepsEnum.companyEmployeeInfo],
  },
];
