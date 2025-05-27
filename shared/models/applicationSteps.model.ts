export enum ApplicationStepsEnum {
  borrowAmount = "borrowAmount",
  borrowPeriod = "borrowPeriod",
  borrowPurpose = "borrowPurpose",
  nricNumber = "nricNumber",
  residencyStatus = "residencyStatus",
  age = "age",
  monthlyIncome = "monthlyIncome",
  occupation = "occupation",
  occupationTime = "occupationTime",
  propertyOwnership = "propertyOwnership",
  existingLoans = "existingLoans",
  fullName = "fullName",
  phoneNumber = "phoneNumber",
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
