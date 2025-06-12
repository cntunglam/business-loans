import { ApplicationStepsEnum, ApplicationStepsImagesEnum } from '@roshi/shared';
import { AddressStep } from '../components/application/steps/addressStep';
import { AgeStep } from '../components/application/steps/ageStep';
import { BorrowAmountStep } from '../components/application/steps/borrowAmount';
import { BorrowPurposeStep } from '../components/application/steps/borrowPurpose';
import { BorrowTermStep } from '../components/application/steps/borrowTerm';
import { HasLaborContractStep } from '../components/application/steps/hasLaborContract';
import { IncomeStep } from '../components/application/steps/incomeStep';
import { NameStep } from '../components/application/steps/nameStep';
import { CccdNumberStep } from '../components/application/steps/nricNumberStep';
import { OccupationStep } from '../components/application/steps/occupation';
import { ASSETS } from './assets';

export const ApplicationStepsImages = {
  [ApplicationStepsImagesEnum.loanOffers]: ASSETS.PRE_APPROVED_LOAN_OFFERS,
  [ApplicationStepsImagesEnum.free]: ASSETS.COMPLETELY_FREE,
  [ApplicationStepsImagesEnum.cashback]: ASSETS.ONE_PERCENT_CASHBACK,
  [ApplicationStepsImagesEnum.bestOffers]: ASSETS.MATCH_YOU_WITH_BEST_OFFERS
} as const;

export const ApplicationStepsComponents = {
  [ApplicationStepsEnum.borrowAmount]: <BorrowAmountStep />,
  [ApplicationStepsEnum.borrowPeriod]: <BorrowTermStep />,
  [ApplicationStepsEnum.borrowPurpose]: <BorrowPurposeStep />,
  [ApplicationStepsEnum.cccdNumber]: <CccdNumberStep />,
  [ApplicationStepsEnum.dateOfBirth]: <AgeStep />,
  [ApplicationStepsEnum.monthlyIncome]: <IncomeStep />,
  [ApplicationStepsEnum.hasLaborContract]: <HasLaborContractStep />,
  [ApplicationStepsEnum.employmentType]: <OccupationStep />,
  [ApplicationStepsEnum.currentAddress]: <AddressStep />,
  [ApplicationStepsEnum.fullName]: <NameStep />
} as const;
