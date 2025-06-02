import { z } from "zod";
import { zodBoolean, zodNullableDateTime } from "./common.model";

export const SupportDataSchema = z.object({
  checklist: z
    .object({
      reviewLinkSentAt: zodNullableDateTime.nullable().optional(),
      voucherPendingSentAt: zodNullableDateTime.nullable().optional(),
      voucherPaidSentAt: zodNullableDateTime.nullable().optional(),
      appointmentReminderSentAt: zodNullableDateTime.nullable().optional(),
      appointmentReminderLenderSentAt: zodNullableDateTime
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  isNotTracked: zodBoolean.optional(),
  isNoResponse: zodBoolean.optional(),
});

export const LoanResponseSupportDataSchema = z.object({
  checklist: z
    .object({
      googleReviewChecked: zodBoolean.optional(),
      cashbackChecked: zodBoolean.optional(),
    })
    .nullable()
    .optional(),
});
