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
