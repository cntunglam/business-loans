import {
  ActivityLogEnum,
  AppointmentStatusEnum,
  DocumentTypeEnum,
  DocumentVerificationStatusEnum,
  NotificationTypeEnum,
} from "../models/databaseEnums";
import { LeadComputedStatus } from "../models/otherEnums";

export const NotificationTypeEnumLabels = {
  [NotificationTypeEnum.NEW_LOAN_REQUEST]: "New loan request",
  [NotificationTypeEnum.APPOINTMENT_SCHEDULED]: "Appointment requested",
  [NotificationTypeEnum.APPOINTMENT_CANCELED]: "Appointment canceled",
  [NotificationTypeEnum.OFFER_SELECTED]: "Offer selected",
  [NotificationTypeEnum.AUTO_IPA]: "Offer made by auto-IPA",
} as const;

export const DocumentTypeEnumLabels = {
  // [DocumentTypeEnum.ID_CARD]: "NRIC",
  [DocumentTypeEnum.PAYSLIP_1]: "Payslip 1",
  [DocumentTypeEnum.PAYSLIP_2]: "Payslip 2",
  [DocumentTypeEnum.PAYSLIP_3]: "Payslip 3",
  [DocumentTypeEnum.CREDIT_REPORT]: "CBS",
  [DocumentTypeEnum.LENDER_CREDIT_REPORT]: "MLCB",
} as const;

export const DocumentVerificationStatusEnumLabels = {
  [DocumentVerificationStatusEnum.INVALID]: "Invalid",
  [DocumentVerificationStatusEnum.NOT_VERIFIED]: "Unverified",
  [DocumentVerificationStatusEnum.VALID]: "Valid",
};

export const AppointmentStatusEnumLabels = {
  [AppointmentStatusEnum.REQUESTED_BY_BORROWER]: "Requested",
  [AppointmentStatusEnum.SHARED_WITH_LENDER]: "Shared",
  [AppointmentStatusEnum.ACCEPTED_BY_LENDER]: "Accepted",
  [AppointmentStatusEnum.CANCELLED_BY_BORROWER]: "Cancelled",
  [AppointmentStatusEnum.CANCELLED_BY_ADMIN]: "Cancelled",
};

export const ActivityLogEnumLabels = {
  [ActivityLogEnum.LOAN_REQUEST_CREATED]: "Created a loan request",
  [ActivityLogEnum.LOAN_REQUEST_DELETED]: "Deleted a loan request",
  [ActivityLogEnum.LOAN_REQUEST_RESTORED]: "Restored a loan request",
  [ActivityLogEnum.REMOVE_OUTCOME]: "Removed the outcome of a loan response",
  // document
  [ActivityLogEnum.DOCUMENT_ADDED]: "Added a document",
  [ActivityLogEnum.DOCUMENT_UPDATED]: "Updated a document",
  [ActivityLogEnum.DOCUMENT_DELETED]: "Deleted a document",
  // appointment
  [ActivityLogEnum.APPOINTMENT_SET]: "Set an appointment",
  [ActivityLogEnum.APPOINTMENT_CANCELED]: "Cancelled an appointment",
  // contact
  [ActivityLogEnum.CONTACTED]: "Contacted",
  // offer
  [ActivityLogEnum.OFFER_SELECTED]: "Selected an offer",
  [ActivityLogEnum.OFFER_DELETED]: "Rejected an offer",
  [ActivityLogEnum.OFFER_APPROVED]: "Marked an offer as WON",
  [ActivityLogEnum.OFFER_REJECTED]: "Marked an offer as LOST",
  [ActivityLogEnum.OFFER_SET]: "Given an offer",

  [ActivityLogEnum.REJECTED_FROM_ZERO_INTEREST]: "Converted to normal loan request",

  [ActivityLogEnum.LOAN_REQUEST_ACTIVATED]: "Activated a loan request",
};

export const LeadComputedStatusLabels = {
  [LeadComputedStatus.NEW]: "New",
  [LeadComputedStatus.IN_PROGRESS]: "In progress",
  [LeadComputedStatus.WON]: "Won",
  [LeadComputedStatus.WITHDRAWN]: "Withdrawn",
  [LeadComputedStatus.REJECTED]: "Rejected",
  [LeadComputedStatus.NO_RESPONSE]: "No response",
  [LeadComputedStatus.WAITING_OUTCOME]: "Waiting outcome",
  [LeadComputedStatus.NO_ACTIVITY]: "No activity",
};
