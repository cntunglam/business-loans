export enum ApplicationStepsEnum {
  borrowAmount = 'borrowAmount',
  borrowPeriod = 'borrowPeriod',
  borrowPurpose = 'borrowPurpose',
  companyName = 'companyName',
  companyUENumber = 'companyUENumber',
  companyEmployeeInfo = 'companyEmployeeInfo'
}

export enum ApplicationStepsImagesEnum {
  loanOffers = 'loanOffers',
  free = 'free',
  cashback = 'cashback',
  bestOffers = 'bestOffers'
}

export interface MinMaxSettings {
  min: number;
  max: number;
}

export interface OptionsSettings {
  options: string[];
}

export interface StepDetails {
  key: ApplicationStepsEnum;
  title: string;
  image?: ApplicationStepsImagesEnum;
  settings?: unknown;
  fixedValue?: unknown;
}
