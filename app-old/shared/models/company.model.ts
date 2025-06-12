import { z } from "zod";
import {
  employmentStatusesEnum,
  EmploymentTimeEnum,
  propertyOwnershipsEnum,
  residencyStatusesEnum,
} from "../data/applicationData";
import { DocumentTypeEnum, LenderSettingsKeys } from "./databaseEnums";

export const LeadSettingsFormSchema = z.object({
  minMonthlyIncomeForeigner: z.coerce.number().int().optional().nullable(),
  minMonthlyIncomeLocal: z.coerce.number().int().optional().nullable(),
  minLoanAmount: z.coerce.number().int().optional().nullable(),
  maxDebtIncomeRatio: z.coerce.number().optional().nullable(),
  employmentStatus: z.array(z.nativeEnum(employmentStatusesEnum)).optional(),
  employmentTime: z.array(z.nativeEnum(EmploymentTimeEnum)).optional(),
  residencyStatus: z.array(z.nativeEnum(residencyStatusesEnum)).optional(),
  propertyOwnerships: z.array(z.nativeEnum(propertyOwnershipsEnum)).optional(),
  documents: z.array(z.nativeEnum(DocumentTypeEnum)).optional(),
  documentCount: z.coerce.number().int().optional().nullable(),
  isApprovedByRoshi: z.boolean().optional(),
});

export const OfferPreferenceSettingsSchema = z.object({
  key: z.nativeEnum(LenderSettingsKeys),
  value: z.object({
    variableAdminFee: z.number().min(0).max(100).optional().nullable(),
    fixedAdminFee: z.number().optional().nullable(),
    interestRate: z.number().min(0).max(100).optional().nullable(),
  }),
});
