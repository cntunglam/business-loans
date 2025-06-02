import { z, ZodSchema } from "zod";
import { ApplicationTypesEnum } from "../data/applicationData";
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
  errors: ApplicationError[];
}
export const SgManualFormSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Tên phải có ít nhất 3 ký tự" })
    .max(255, { message: "Tên không được vượt quá 255 ký tự" }),
  phoneNumber: getPhoneSchema().nullable().optional(),
  cccdNumber: z
    .string()
    .min(9, { message: "Số CCCD phải có ít nhất 9 ký tự" })
    .max(12, { message: "Số CCCD không được vượt quá 12 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  dateOfBirth: z.coerce.date({
    invalid_type_error: "Ngày sinh không hợp lệ",
  }),
  monthlyIncome: z.coerce
    .number()
    .nonnegative({ message: "Thu nhập hàng tháng không được âm" }),
  hasLaborContract: z
    .boolean({ invalid_type_error: "Giá trị phải là true hoặc false" })
    .optional(),
  currentAddress: z.string().max(255, { message: "Địa chỉ quá dài" }),
  employmentType: z
    .string()
    .min(2, { message: "Công việc phải có ít nhất 1 ký tự" }),
  residencyStatus: z.string().optional().nullable(),
});

export const formTypeToSchema: Record<ApplicationTypesEnum, ZodSchema> = {
  [ApplicationTypesEnum.SG_MANUAL]: SgManualFormSchema,
};

export const SgManualFormSchemaKeys: (keyof typeof SgManualFormSchema.shape)[] =
  [
    "fullName",
    "cccdNumber",
    "phoneNumber",
    "email",
    "dateOfBirth",
    "monthlyIncome",
    "hasLaborContract",
    "currentAddress",
    "residencyStatus",
    "employmentType",
  ];
