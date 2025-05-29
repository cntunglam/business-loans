export enum UserRoleEnum {
  ADMIN = "ADMIN",
  BORROWER = "BORROWER",
  LENDER = "LENDER",
  CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
  AFFILIATE = "AFFILIATE",
}

export enum UserStatusEnum {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
}

export enum CompanyTypeEnum {
  BANK = "BANK",
  MONEYLENDER = "MONEYLENDER",
}

export enum LoanTypeEnum {
  PERSONAL = "PERSONAL",
  HOME = "HOME",
}

export enum LoanRequestStatusEnum {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
  //TO BE REMOVED
  FULLFILLED = "FULLFILLED",
}

export enum LoanRequestTypeEnum {
  GENERAL = "GENERAL",
  ZERO_INTEREST = "ZERO_INTEREST",
}

export enum LoanRequestDeletionReasonEnum {
  WITHDRAWN_BY_USER = "WITHDRAWN_BY_USER",
}

export enum LoanResponseStatusEnum {
  //Loan offer submitted
  SUBMITTED = "SUBMITTED",
  //Loan offer accepted by borrower
  ACCEPTED = "ACCEPTED",
  //Loan offer rejected by borrower
  REJECTED = "REJECTED",
}

export enum DocumentTypeEnum {
  //ID_CARD = "ID_CARD",
  PAYSLIP_1 = "PAYSLIP_1",
  PAYSLIP_2 = "PAYSLIP_2",
  PAYSLIP_3 = "PAYSLIP_3",
  CREDIT_REPORT = "CREDIT_REPORT",
  LENDER_CREDIT_REPORT = "LENDER_CREDIT_REPORT",
}

export enum DocumentVerificationStatusEnum {
  NOT_VERIFIED = "NOT_VERIFIED",
  VALID = "VALID",
  INVALID = "INVALID",
}

export enum CountriesEnum {
  SG = "SG",
  VN = "VN",
}

export enum CompanyStatusEnum {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
}

export enum WaMessageSourceEnum {
  USER = "USER",
  //Manually typed by admin
  ADMIN = "ADMIN",
  //Triggered by automated system
  SYSTEM = "SYSTEM_AUTO",
  //Triggered by admin
  SYSTEM_MANUAL = "SYSTEM_MANUAL",
}

export enum AppointmentStatusEnum {
  REQUESTED_BY_BORROWER = "REQUESTED_BY_BORROWER",
  //Admin will accept the appointment and share with lender
  SHARED_WITH_LENDER = "SHARED_WITH_LENDER",
  ACCEPTED_BY_LENDER = "ACCEPTED_BY_LENDER",
  CANCELLED_BY_BORROWER = "CANCELLED_BY_BORROWER",
  CANCELLED_BY_ADMIN = "CANCELLED_BY_ADMIN",
}

export enum StatusEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ActivityLogEnum {
  LOAN_REQUEST_CREATED = "LOAN_REQUEST_CREATED",
  LOAN_REQUEST_DELETED = "LOAN_REQUEST_DELETED",
  LOAN_REQUEST_RESTORED = "LOAN_REQUEST_RESTORED",
  // Loan response
  REMOVE_OUTCOME = "REMOVE_OUTCOME",
  // document
  DOCUMENT_ADDED = "DOCUMENT_ADDED",
  DOCUMENT_UPDATED = "DOCUMENT_UPDATED",
  DOCUMENT_DELETED = "DOCUMENT_DELETED",
  // appointment
  APPOINTMENT_SET = "APPOINTMENT_SET",
  APPOINTMENT_CANCELED = "APPOINTMENT_CANCELED",
  // contact
  CONTACTED = "CONTACTED",
  // offer
  OFFER_SELECTED = "OFFER_SELECTED",
  OFFER_DELETED = "OFFER_DELETED",
  //WON
  OFFER_APPROVED = "OFFER_APPROVED",
  //LOST
  OFFER_REJECTED = "OFFER_REJECTED",
  OFFER_SET = "OFFER_SET",

  REJECTED_FROM_ZERO_INTEREST = "REJECTED_FROM_ZERO_INTEREST",

  LOAN_REQUEST_ACTIVATED = "LOAN_REQUEST_ACTIVATED",
}

export enum TargetTypeEnum {
  DOCUMENT = "DOCUMENT",
  LOAN_RESPONSE = "LOAN_RESPONSE",
  LOAN_REQUEST = "LOAN_REQUEST",
  APPOINTMENT = "APPOINTMENT",
}

export enum NotificationStatusEnum {
  PENDING = "PENDING",
  IGNORED = "IGNORED",
  SENT = "SENT",
  OPENED = "OPENED",
  FAILED = "FAILED",
}

export enum NotificationTypeEnum {
  //For lender
  AUTO_IPA = "AUTO_IPA",
  APPOINTMENT_OUTCOME_REMINDER = "APPOINTMENT_OUTCOME_REMINDER",

  //For borrower
  OFFER_RECEIVED = "OFFER_RECEIVED",

  //For lender and admin
  NEW_LOAN_REQUEST = "NEW_LOAN_REQUEST",
  OFFER_SELECTED = "OFFER_SELECTED",

  //For lender, admin and borrower
  APPOINTMENT_SCHEDULED = "APPOINTMENT_SCHEDULED",
  APPOINTMENT_CANCELED = "APPOINTMENT_CANCELED",

  WELCOME = "WELCOME",
  LOAN_REQUEST_FOLLOW_UP = "LOAN_REQUEST_FOLLOW_UP",

  APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
  PRICE_BEAT = "PRICE_BEAT",
  CASHBACK_OFFER = "CASHBACK_OFFER",
  CASHBACK_OFFER2 = "CASHBACK_OFFER2",

  CIMB_OFFER = "CIMB_OFFER",

  REVIEW_LINK = "REVIEW_LINK",

  REAPPLY_OFFERS = "REAPPLY_OFFERS",

  LOWER_AMOUNT_DISBURSED = "LOWER_AMOUNT_DISBURSED",
}

export enum NotificationTransportEnum {
  EMAIL = "EMAIL",
  WEBHOOK = "WEBHOOK",
  WHATSAPP = "WHATSAPP",
  TELEGRAM = "TELEGRAM",
}

export enum LenderSettingsKeys {
  DEFAULT_OFFER_VALUES = "DEFAULT_OFFER_VALUES",
}

export enum WaMessageDeliveryStatusEnum {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum LogSource {
  API = "API",
  JOB_QUEUE = "JOB_QUEUE",
  CRON_JOB = "CRON_JOB",
}

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  LOG = "LOG",
}

export enum ShortUrlTypeEnum {
  REDIRECT = "REDIRECT",
  API_ACCESS = "API_ACCESS",
}

export enum LeadTierEnum {
  PREMIUM = "PREMIUM",
  DELUXE = "DELUXE",
  BASIC = "BASIC",
  REJECT = "REJECT",
}

export enum VisitorActionTypeEnum {
  STEP_CHANGE = "STEP_CHANGE",
}
