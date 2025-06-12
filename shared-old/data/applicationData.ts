export enum employmentTypeEnum {
  FACTORY_WORKER = "FACTORY_WORKER",
  BUSINESS_OWNER = "BUSINESS_OWNER",
  DRIVER = "DRIVER",
  EMPLOYED = "EMPLOYED",
  FARMER = "FARMER",
  FREELANCER = "FREELANCER",
  MILITARY_PERSONNEL = "MILITARY_PERSONNEL",
  POLICE_OFFICER = "POLICE_OFFICER",
  RETIRED = "RETIRED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
  OFFICE_WORKER = "OFFICE_WORKER",
  STUDENT = "STUDENT",
  OTHER = "OTHER",
}

export const employmentTypeLabels: Record<employmentTypeEnum, string> = {
  [employmentTypeEnum.FACTORY_WORKER]: "Công nhân nhà máy",
  [employmentTypeEnum.BUSINESS_OWNER]: "Chủ doanh nghiệp",
  [employmentTypeEnum.DRIVER]: "Lái xe",
  [employmentTypeEnum.EMPLOYED]: "Nhân viên",
  [employmentTypeEnum.FARMER]: "Nông dân",
  [employmentTypeEnum.FREELANCER]: "Làm nghề tự do",
  [employmentTypeEnum.MILITARY_PERSONNEL]: "Bộ đội",
  [employmentTypeEnum.POLICE_OFFICER]: "Công an",
  [employmentTypeEnum.RETIRED]: "Nghỉ hưu",
  [employmentTypeEnum.SELF_EMPLOYED]: "Tự kinh doanh",
  [employmentTypeEnum.UNEMPLOYED]: "Thất nghiệp",
  [employmentTypeEnum.OFFICE_WORKER]: "Nhân viên văn phòng",
  [employmentTypeEnum.STUDENT]: "Sinh viên",
  [employmentTypeEnum.OTHER]: "Khác",
};

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
  WORKING_CAPITAL_LOAN = "WORKING_CAPITAL_LOAN",
  INVOICE_FINANCING = "INVOICE_FINANCING",
  PURCHASE_ORDER_FINANCING = "PURCHASE_ORDER_FINANCING",
  PAYROLL_FINANCING = "PAYROLL_FINANCING",
  BRIDGING_LOAN = "BRIDGING_LOAN",
  EXPANSION_FINANCING = "EXPANSION_FINANCING",
  REVENUE_BASED_FINANCE = "REVENUE_BASED_FINANCE",
  BUSINESS_LINE_OF_CREDIT = "BUSINESS_LINE_OF_CREDIT",
  DEBT_CONSOLIDATION = "DEBT_CONSOLIDATION",
  EDUCATION = "EDUCATION",
  HOME = "HOME",
  OTHER = "OTHER",
}

export const loanPurposesLabels = {
  [loanPurposesEnum.WORKING_CAPITAL_LOAN]: "Working Capital Loan",
  [loanPurposesEnum.INVOICE_FINANCING]: "Invoice Financing",
  [loanPurposesEnum.PURCHASE_ORDER_FINANCING]: "Purchase Order Financing",
  [loanPurposesEnum.PAYROLL_FINANCING]: "Payroll Financing",
  [loanPurposesEnum.BRIDGING_LOAN]: "Bridging Loan",
  [loanPurposesEnum.EXPANSION_FINANCING]: "Expansion Financing",
  [loanPurposesEnum.REVENUE_BASED_FINANCE]: "Revenue Based Finance",
  [loanPurposesEnum.BUSINESS_LINE_OF_CREDIT]: "Business Line of Credit",
  [loanPurposesEnum.DEBT_CONSOLIDATION]: "Debt Consolidation",
  [loanPurposesEnum.EDUCATION]: "Education",
  [loanPurposesEnum.HOME]: "Home",
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
