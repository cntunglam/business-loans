export enum ApplicationStepsEnum {
  borrowAmount = "borrowAmount",
  borrowPeriod = "borrowPeriod",
  borrowPurpose = "borrowPurpose",

  monthlyIncome = "monthlyIncome",
  employmentType = "employmentType",
  hasLaborContract = "hasLaborContract",

  fullName = "fullName",
  cccdNumber = "cccdNumber",
  phoneNumber = "phoneNumber",
  email = "email",
  dateOfBirth = "dateOfBirth",

  city = "city",
  province = "province",
  streetAddress = "streetAddress",

  residencyStatus = "residencyStatus",
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
