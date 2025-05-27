import { ApplicationStepsEnum, ApplicationStepsImagesEnum } from "@roshi/shared";
import { AgeStep } from "../components/application/steps/ageStep";
import { BorrowAmountStep } from "../components/application/steps/borrowAmount";
import { BorrowPurposeStep } from "../components/application/steps/borrowPurpose";
import { BorrowTermStep } from "../components/application/steps/borrowTerm";
import { ExistingLoansStep } from "../components/application/steps/existingLoans";
import { IncomeStep } from "../components/application/steps/incomeStep";
import { NameStep } from "../components/application/steps/nameStep";
import { NricNumberStep } from "../components/application/steps/nricNumberStep";
import { OccupationStep } from "../components/application/steps/occupation";
import { OccupationTime } from "../components/application/steps/occupationTime";
import { PropertyOwnershipStep } from "../components/application/steps/propertyOwnership";
import { ResidencyStatusStep } from "../components/application/steps/residencyStatus";
import { ASSETS } from "./assets";

export const ApplicationStepsImages = {
  [ApplicationStepsImagesEnum.loanOffers]: ASSETS.PRE_APPROVED_LOAN_OFFERS,
  [ApplicationStepsImagesEnum.free]: ASSETS.COMPLETELY_FREE,
  [ApplicationStepsImagesEnum.cashback]: ASSETS.ONE_PERCENT_CASHBACK,
  [ApplicationStepsImagesEnum.bestOffers]: ASSETS.MATCH_YOU_WITH_BEST_OFFERS,
} as const;

export const ApplicationStepsComponents = {
  [ApplicationStepsEnum.borrowAmount]: <BorrowAmountStep />,
  [ApplicationStepsEnum.borrowPeriod]: <BorrowTermStep />,
  [ApplicationStepsEnum.borrowPurpose]: <BorrowPurposeStep />,
  [ApplicationStepsEnum.nricNumber]: <NricNumberStep />,
  [ApplicationStepsEnum.residencyStatus]: <ResidencyStatusStep />,
  [ApplicationStepsEnum.age]: <AgeStep />,
  [ApplicationStepsEnum.monthlyIncome]: <IncomeStep />,
  [ApplicationStepsEnum.occupation]: <OccupationStep />,
  [ApplicationStepsEnum.occupationTime]: <OccupationTime />,
  [ApplicationStepsEnum.propertyOwnership]: <PropertyOwnershipStep />,
  [ApplicationStepsEnum.existingLoans]: <ExistingLoansStep />,
  [ApplicationStepsEnum.fullName]: <NameStep />,
} as const;
