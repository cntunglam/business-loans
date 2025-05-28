export enum employmentStatusesEnum {
  EMPLOYED = "EMPLOYED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  STUDENT = "STUDENT",
  RETIRED = "RETIRED",
  UNEMPLOYED = "UNEMPLOYED",
}

export const employmentStatusesLabels = {
  [employmentStatusesEnum.EMPLOYED]: "Employed",
  [employmentStatusesEnum.SELF_EMPLOYED]: "Self employed",
  [employmentStatusesEnum.STUDENT]: "Student",
  [employmentStatusesEnum.RETIRED]: "Retired",
  [employmentStatusesEnum.UNEMPLOYED]: "Unemployed",
} as const;

export enum propertyOwnershipsEnum {
  PRIVATE_PROPERTY = "PRIVATE_PROPERTY",
  HDB = "HDB",
  RENTAL = "RENTAL",
  LIVING_WITH_PARENTS = "LIVING_WITH_PARENTS",
  OTHER = "OTHER",
}

export const propertyOwnershipsLabels = {
  [propertyOwnershipsEnum.PRIVATE_PROPERTY]: "Private Property",
  [propertyOwnershipsEnum.HDB]: "HDB",
  [propertyOwnershipsEnum.RENTAL]: "Rental",
  [propertyOwnershipsEnum.LIVING_WITH_PARENTS]: "Living with parents/family",
  [propertyOwnershipsEnum.OTHER]: "Other",
} as const;

export enum residencyStatusesEnum {
  SINGAPOREAN = "SINGAPOREAN",
  PERMANANT_RESIDENT = "PERMANANT_RESIDENT",
  EMPLOYMENT_PASS = "EMPLOYMENT_PASS",
  S_PASS_WORK_PERMIT = "S_PASS_WORK_PERMIT",
  FOREIGNER = "FOREIGNER",
  LONG_TERM_VISIT = "LONG_TERM_VISIT",
}

export const residencyStatusesLabels = {
  [residencyStatusesEnum.SINGAPOREAN]: "Singaporean",
  [residencyStatusesEnum.PERMANANT_RESIDENT]: "Permanant Resident (PR)",
  [residencyStatusesEnum.EMPLOYMENT_PASS]: "Employment Pass (EP)",
  [residencyStatusesEnum.S_PASS_WORK_PERMIT]: "S Pass (SP) / Work Permit (WP)",
  [residencyStatusesEnum.FOREIGNER]: "Foreigner (Excl. EP/SP/WP)",
  [residencyStatusesEnum.LONG_TERM_VISIT]: "Long Term Visit (LTVP)",
} as const;

export enum loanPurposesEnum {
  CREDIT_CARD_DEBT = "CREDIT_CARD_DEBT",
  REPAY_FAMILY_OR_FRIENDS = "REPAY_FAMILY_OR_FRIENDS",
  EDUCATION = "EDUCATION",
  HOME = "HOME",
  DEBT_CONSOLIDATION = "DEBT_CONSOLIDATION",
  HOBBIES = "HOBBIES",
  INVESTMENTS = "INVESTMENTS",
  LINE_OF_CREDIT = "LINE_OF_CREDIT",
  BUSINESS_EXPANSION = "BUSINESS_EXPANSION",
  OTHER = "OTHER",
}

export const loanPurposesLabels = {
  [loanPurposesEnum.CREDIT_CARD_DEBT]: "Credit card debt",
  [loanPurposesEnum.REPAY_FAMILY_OR_FRIENDS]: "Repay family or friends",
  [loanPurposesEnum.EDUCATION]: "Education",
  [loanPurposesEnum.HOME]: "Home",
  [loanPurposesEnum.DEBT_CONSOLIDATION]: "Debt Consolidation",
  [loanPurposesEnum.HOBBIES]: "Hobbies",
  [loanPurposesEnum.INVESTMENTS]: "Investments",
  [loanPurposesEnum.LINE_OF_CREDIT]: "Line of credit",
  [loanPurposesEnum.BUSINESS_EXPANSION]: "Business expansion",
  [loanPurposesEnum.OTHER]: "Other",
};

export enum EmploymentTimeEnum {
  NA = "NA",
  UNDER_THREE_MONTHS = "UNDER_THREE_MONTHS",
  THREE_MONTHS_TO_ONE_YEAR = "THREE_MONTHS_TO_ONE_YEAR",
  ONE_YEAR_TO_THREE_YEARS = "ONE_YEAR_TO_THREE_YEARS",
  MORE_THAN_THREE_YEARS = "MORE_THAN_THREE_YEARS",
}

export const employmentTimeLabels = {
  [EmploymentTimeEnum.NA]: "Not applicable",
  [EmploymentTimeEnum.UNDER_THREE_MONTHS]: "Less than 3 months",
  [EmploymentTimeEnum.THREE_MONTHS_TO_ONE_YEAR]: "3 months to 1 year",
  [EmploymentTimeEnum.ONE_YEAR_TO_THREE_YEARS]: "1 year to 3 years",
  [EmploymentTimeEnum.MORE_THAN_THREE_YEARS]: "More than 3 years",
};

export enum ApplicationTypesEnum {
  SG_MANUAL = "MANUAL",
}
