import {
  AppointmentStatusEnum,
  DocumentVerificationStatusEnum,
  LogLevel,
} from "../models/databaseEnums";
import { LeadComputedStatus } from "../models/otherEnums";

export const DocumentVerificationStatusEnumColors = {
  MISSING: "neutral",
  [DocumentVerificationStatusEnum.INVALID]: "danger",
  [DocumentVerificationStatusEnum.NOT_VERIFIED]: "warning",
  [DocumentVerificationStatusEnum.VALID]: "success",
} as const;

export const AppointmentStatusEnumColors = {
  [AppointmentStatusEnum.REQUESTED_BY_BORROWER]: "warning",
  [AppointmentStatusEnum.SHARED_WITH_LENDER]: "secondary",
  [AppointmentStatusEnum.ACCEPTED_BY_LENDER]: "primary",
  [AppointmentStatusEnum.CANCELLED_BY_BORROWER]: "danger",
  [AppointmentStatusEnum.CANCELLED_BY_ADMIN]: "danger",
} as const;

export const LeadComputedStatusColors = {
  [LeadComputedStatus.NEW]: { backgroundColor: "#FEE395" },
  [LeadComputedStatus.IN_PROGRESS]: { backgroundColor: "#D4EDBC" },
  [LeadComputedStatus.WON]: { backgroundColor: "#13734B", color: "white" },
  [LeadComputedStatus.WITHDRAWN]: { backgroundColor: "#E6CFF2" },
  [LeadComputedStatus.REJECTED]: { backgroundColor: "#B10202", color: "white" },
  [LeadComputedStatus.NO_RESPONSE]: {
    backgroundColor: "#B10202",
    color: "white",
  },
  [LeadComputedStatus.WAITING_OUTCOME]: {
    backgroundColor: "orange",
    color: "white",
  },
  [LeadComputedStatus.NO_ACTIVITY]: {
    backgroundColor: "#B10202",
    color: "white",
  },
} as const;

export const LogLevelColors = {
  [LogLevel.ERROR]: "danger",
  [LogLevel.WARN]: "warning",
  [LogLevel.LOG]: "primary",
} as const;
