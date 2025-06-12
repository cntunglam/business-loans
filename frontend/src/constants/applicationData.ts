import { ApplicationStepsEnum, ApplicationStepsImagesEnum, StepDetails } from './applicationStep';

export enum loanPurposesEnum {
  WORKING_CAPITAL_LOAN = 'WORKING_CAPITAL_LOAN',
  INVOICE_FINANCING = 'INVOICE_FINANCING',
  PURCHASE_ORDER_FINANCING = 'PURCHASE_ORDER_FINANCING',
  PAYROLL_FINANCING = 'PAYROLL_FINANCING',
  BRIDGING_LOAN = 'BRIDGING_LOAN',
  EXPANSION_FINANCING = 'EXPANSION_FINANCING',
  REVENUE_BASED_FINANCE = 'REVENUE_BASED_FINANCE',
  BUSINESS_LINE_OF_CREDIT = 'BUSINESS_LINE_OF_CREDIT',
  DEBT_CONSOLIDATION = 'DEBT_CONSOLIDATION',
  EDUCATION = 'EDUCATION',
  HOME = 'HOME',
  OTHER = 'OTHER'
}

export const loanPurposesLabels = {
  [loanPurposesEnum.WORKING_CAPITAL_LOAN]: 'Working Capital Loan',
  [loanPurposesEnum.INVOICE_FINANCING]: 'Invoice Financing',
  [loanPurposesEnum.PURCHASE_ORDER_FINANCING]: 'Purchase Order Financing',
  [loanPurposesEnum.PAYROLL_FINANCING]: 'Payroll Financing',
  [loanPurposesEnum.BRIDGING_LOAN]: 'Bridging Loan',
  [loanPurposesEnum.EXPANSION_FINANCING]: 'Expansion Financing',
  [loanPurposesEnum.REVENUE_BASED_FINANCE]: 'Revenue Based Finance',
  [loanPurposesEnum.BUSINESS_LINE_OF_CREDIT]: 'Business Line of Credit',
  [loanPurposesEnum.DEBT_CONSOLIDATION]: 'Debt Consolidation',
  [loanPurposesEnum.EDUCATION]: 'Education',
  [loanPurposesEnum.HOME]: 'Home',
  [loanPurposesEnum.OTHER]: 'Other'
};

export const DEFAULT_APPLICATION_STEPS: StepDetails[] = [
  {
    title: 'How much do you want to borrow?',
    key: ApplicationStepsEnum.borrowAmount,
    image: ApplicationStepsImagesEnum.loanOffers
  },
  {
    title: 'Over what period would you like to pay?',
    key: ApplicationStepsEnum.borrowPeriod
  },
  {
    title: 'What is the purpose of the loan?',
    key: ApplicationStepsEnum.borrowPurpose,
    image: ApplicationStepsImagesEnum.free
  },
  {
    title: 'What is the company’s legal name?',
    key: ApplicationStepsEnum.companyName
  },
  {
    title: 'What is the company’s UEN?',
    key: ApplicationStepsEnum.companyUENumber
  },
  {
    title: 'What is your name and position in the company?',
    key: ApplicationStepsEnum.companyEmployeeInfo
  }
];
