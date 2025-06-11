import { ApplicationStepsEnum, ApplicationStepsImagesEnum } from '@roshi/shared';
import { AddressStep } from '../components/application/steps/addressStep';
import { AgeStep } from '../components/application/steps/ageStep';
import { BorrowAmountStep } from '../components/application/steps/borrowAmount';
import { BorrowPurposeStep } from '../components/application/steps/borrowPurpose';
import { BorrowTermStep } from '../components/application/steps/borrowTerm';
import { CompanyEmployeeInfoStep } from '../components/application/steps/companyEmployeeInfoStep';
import { CompanyNameStep } from '../components/application/steps/companyNameStep';
import { CompanyUENumberStep } from '../components/application/steps/companyUENumberStep';
import { HasLaborContractStep } from '../components/application/steps/hasLaborContract';
import { IncomeStep } from '../components/application/steps/incomeStep';
import { CccdNumberStep } from '../components/application/steps/nricNumberStep';
import { OccupationStep } from '../components/application/steps/occupation';
import { RegisterStep } from '../components/application/steps/registerStep';
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
  [ApplicationStepsEnum.companyName]: <CompanyNameStep />,
  [ApplicationStepsEnum.companyUENumber]: <CompanyUENumberStep />,
  [ApplicationStepsEnum.companyEmployeeInfo]: <CompanyEmployeeInfoStep />,
  [ApplicationStepsEnum.currentAddress]: <AddressStep />,
  [ApplicationStepsEnum.dateOfBirth]: <AgeStep />,
  [ApplicationStepsEnum.hasLaborContract]: <HasLaborContractStep />,
  [ApplicationStepsEnum.monthlyIncome]: <IncomeStep />,
  [ApplicationStepsEnum.cccdNumber]: <CccdNumberStep />,
  [ApplicationStepsEnum.employmentType]: <OccupationStep />,
  [ApplicationStepsEnum.phoneNumber]: <RegisterStep onSuccess={async () => {}} isLoading={false} />
} as const;
