export enum ApplicationStepsEnum {
  borrowAmount = "borrowAmount",
  borrowPeriod = "borrowPeriod",
  borrowPurpose = "borrowPurpose",
  companyName = "companyName",
  companyUENumber = "companyUENumber",
  companyEmployeeInfo = "companyEmployeeInfo",
  phoneNumber = "phoneNumber",
  currentAddress = "currentAddress",
  dateOfBirth = "dateOfBirth",
  hasLaborContract = "hasLaborContract",
  monthlyIncome = "monthlyIncome",
  cccdNumber = "cccdNumber",
  employmentType = "employmentType",
}

export enum ApplicationStepsImagesEnum {
  loanOffers = "loanOffers",
  free = "free",
  cashback = "cashback",
  bestOffers = "bestOffers",
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
  // It means there is no need for user input, so we skip this step on the frontend
  fixedValue?: unknown;
}
