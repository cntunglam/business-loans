import {
  ApplicationStepsEnum,
  ApplicationStepsImagesEnum,
  employmentStatusesEnum,
  loanPurposesEnum,
  propertyOwnershipsEnum,
  residencyStatusesEnum,
  StepDetails,
} from '@roshi/shared';

export const regularPersonalLoanSteps: StepDetails[] = [
  {
    key: ApplicationStepsEnum.borrowAmount,
    title: 'How much do you want to borrow?',
    settings: { min: 1000, max: 200000 },
  },
  {
    key: ApplicationStepsEnum.borrowPeriod,
    title: 'Over what period would you like to pay?',
    settings: { min: 3, max: 72 },
  },
  {
    key: ApplicationStepsEnum.borrowPurpose,
    image: ApplicationStepsImagesEnum.loanOffers,
    title: 'What is the purpose of the loan?',
    settings: { options: Object.values(loanPurposesEnum) },
  },
  { key: ApplicationStepsEnum.nricNumber, title: "What's your NRIC/FIN number?" },
  {
    key: ApplicationStepsEnum.residencyStatus,
    title: 'What is your residency status?',
    image: ApplicationStepsImagesEnum.free,
    settings: { options: Object.values(residencyStatusesEnum) },
  },
  { key: ApplicationStepsEnum.age, title: 'What is your age?', settings: { min: 21, max: 65 } },
  {
    key: ApplicationStepsEnum.monthlyIncome,
    title: 'What is your monthly income?',
    image: ApplicationStepsImagesEnum.cashback,
  },
  {
    key: ApplicationStepsEnum.occupation,
    title: 'What is your occupational status?',
    settings: { options: Object.values(employmentStatusesEnum) },
  },
  { key: ApplicationStepsEnum.occupationTime, title: 'How long have you been employed?' },
  {
    key: ApplicationStepsEnum.propertyOwnership,
    title: 'What is your property ownership status and address?',
    settings: { options: Object.values(propertyOwnershipsEnum) },
  },
  {
    key: ApplicationStepsEnum.existingLoans,
    title: 'Do you have any existing unsecured loans, credit card debt, or overdrafts?',
  },
  {
    key: ApplicationStepsEnum.fullName,
    title: 'One more thing, what is your full name?',
    image: ApplicationStepsImagesEnum.bestOffers,
  },
] as const;
