import { ApplicationStepsEnum } from "../models/applicationSteps.model";
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

export const DocumentTypeEnumDescriptions = {
  // Identification & Residence
  [DocumentTypeEnum.ID_CARD_FRONT]: "Mặt trước của căn cước công dân (CCCD)",
  [DocumentTypeEnum.ID_CARD_BACK]: "Mặt sau của căn cước công dân (CCCD)",
  [DocumentTypeEnum.HOUSEHOLD_REGISTRATION]: "Sổ hộ khẩu",
  [DocumentTypeEnum.TEMP_RESIDENCE_CONFIRMATION]:
    "Giấy xác nhận tạm trú (nếu đang sống ngoài địa chỉ trong sổ hộ khẩu)",

  // Proof of Living Expenses/Residency
  [DocumentTypeEnum.UTILITY_BILL]: "Hóa đơn điện, nước, internet hoặc truyền hình cáp trong vòng 3 tháng gần nhất",

  // Employment & Income Verification
  [DocumentTypeEnum.EMPLOYMENT_CONTRACT]: "Hợp đồng lao động hiện tại của bạn",
  [DocumentTypeEnum.SALARY_SLIP]: "Phiếu lương gần nhất",
  [DocumentTypeEnum.BANK_STATEMENT]: "Sao kê tài khoản ngân hàng thể hiện lương trong 3 tháng gần đây",
} as const;

export const DocumentTypeEnumLabels = {
  // Identification & Residence
  [DocumentTypeEnum.ID_CARD_FRONT]: "CCCD - Mặt Trước",
  [DocumentTypeEnum.ID_CARD_BACK]: "CCCD - Mặt Sau",
  [DocumentTypeEnum.HOUSEHOLD_REGISTRATION]: "Sổ Hộ Khẩu",
  [DocumentTypeEnum.TEMP_RESIDENCE_CONFIRMATION]: "Giấy Xác Nhận Tạm Trú",

  // Proof of Living Expenses/Residency
  [DocumentTypeEnum.UTILITY_BILL]: "Hóa Đơn Sinh Hoạt",

  // Employment & Income Verification
  [DocumentTypeEnum.EMPLOYMENT_CONTRACT]: "Hợp Đồng Lao Động",
  [DocumentTypeEnum.SALARY_SLIP]: "Phiếu Lương",
  [DocumentTypeEnum.BANK_STATEMENT]: "Sao Kê Ngân Hàng",
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

export const ApplyingStepRequireErrorLabels = {
  [ApplicationStepsEnum.fullName]: "Vui lòng nhập tên của bạn",
  [ApplicationStepsEnum.employmentType]: "Vui lòng chọn một công việc",
  [ApplicationStepsEnum.cccdNumber]: "Vui lòng nhập số CCCD",
  [ApplicationStepsEnum.borrowPurpose]: "Vui lòng chọn mục đích vay",
};

export const ApplyingStepErrorLabels = {
  [ApplicationStepsEnum.cccdNumber]: "Số CCCD không hợp lệ",
  [ApplicationStepsEnum.fullName]: "Tên quá ngắn, vui lòng nhập đầy đủ họ tên",
};
