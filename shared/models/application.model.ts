import { StepData } from "@prisma/client";
import { z, ZodSchema } from "zod";
import {
  ApplicationTypesEnum,
  employmentStatusesEnum,
  EmploymentTimeEnum,
  propertyOwnershipsEnum,
  residencyStatusesEnum,
} from "../data/applicationData";
import { getPhoneSchema } from "./common.model";

// Error types
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ApplicationError extends ValidationError {
  stepKey: string;
  metadata?: Record<string, unknown>;
}

// Visitor types
export interface VisitorState {
  currentStep: string;
  completedSteps: string[];
  data: Partial<StepData>;
  errors: ApplicationError[];
}

export const SgManualFormSchema = z.object({
  age: z
    .number()
    .int()
    .min(16, { message: "Must be at least 21 years old" })
    .max(100, { message: "Must be at most 65 years old" }),
  bankDebt: z.coerce.number().int().nonnegative().optional().default(0),
  lenderDebt: z.coerce.number().int().nonnegative().optional().default(0),
  monthlyIncome: z.coerce.number().nonnegative().optional().default(0),
  fullname: z
    .string()
    .min(3, { message: "Must be at least 3 characters" })
    .max(255, { message: "Must be at most 255 characters" })
    .optional()
    .nullable(),
  employmentStatus: z.nativeEnum(employmentStatusesEnum),
  jobTitle: z.string().max(255).optional(),
  //TODO verify real NRIC length
  //Optional because this was added later. So some applications will not have this
  nric: z.string().optional(),
  currentEmploymentTime: z.nativeEnum(EmploymentTimeEnum),
  previousEmploymentTime: z.nativeEnum(EmploymentTimeEnum),
  propertyOwnership: z.nativeEnum(propertyOwnershipsEnum),
  residencyStatus: z.nativeEnum(residencyStatusesEnum),
  postalCode: z.coerce.string({ message: "Invalid postal code" }).optional(),
  phoneNumber: getPhoneSchema().nullable().optional(),
});

export const formTypeToSchema: Record<ApplicationTypesEnum, ZodSchema> = {
  [ApplicationTypesEnum.SG_MANUAL]: SgManualFormSchema,
};

export const SgManualFormSchemaKeys: (Partial<keyof typeof SgManualFormSchema.shape> | "mlcbRatio")[] = [
  "age",
  "monthlyIncome",
  "bankDebt",
  "lenderDebt",
  "mlcbRatio",
  "employmentStatus",
  "jobTitle",
  "currentEmploymentTime",
  "previousEmploymentTime",
  "residencyStatus",
  "propertyOwnership",
];

export const ApplicationKeysLabels: Record<(typeof SgManualFormSchemaKeys)[number], string> = {
  fullname: "Full Name",
  phoneNumber: "Phone Number",
  monthlyIncome: "Monthly Income",
  employmentStatus: "Employment",
  jobTitle: "Job Title",
  currentEmploymentTime: "Curr. Emp. Time",
  previousEmploymentTime: "Prev. Emp. Time",
  propertyOwnership: "Prop. Ownership",
  residencyStatus: "Res. Status",
  postalCode: "Postal Code",
  age: "Age",
  bankDebt: "Unsec. Bank Debt",
  lenderDebt: "Unsec. ML Debt",
  mlcbRatio: "ML Debt to income",
  nric: "NRIC/FIN",
} as const;
