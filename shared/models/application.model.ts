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
  monthlyIncome: z.coerce.number().nonnegative({ message: "Thu nhập hàng tháng không được âm" }),
  hasLaborContract: z.boolean({ invalid_type_error: "Giá trị phải là true hoặc false" }).optional(),
  streetAddress: z.string().max(255, { message: "Địa chỉ quá dài" }),
  city: z.string().max(255, { message: "Tên thành phố quá dài" }),
  province: z.string().max(255, { message: "Tên tỉnh/thành phố quá dài" }),

  residencyStatus: z.string().optional().nullable(),
});

export const formTypeToSchema: Record<ApplicationTypesEnum, ZodSchema> = {
  [ApplicationTypesEnum.SG_MANUAL]: SgManualFormSchema,
};

export const SgManualFormSchemaKeys: (keyof typeof SgManualFormSchema.shape)[] = [
  "fullName",
  "cccdNumber",
  "phoneNumber",
  "email",
  "dateOfBirth",
  "monthlyIncome",
  "hasLaborContract",
  "streetAddress",
  "city",
  "province",
];

export const ApplicationKeysLabels: Record<(typeof SgManualFormSchemaKeys)[number], string> = {
  fullName: "Full Name (Tên đầy đủ)",
  cccdNumber: "ID Card Number (CCCD/CMND)",
  phoneNumber: "Phone Number (Số điện thoại)",
  email: "Email",
  dateOfBirth: "Date of Birth (Ngày sinh)",
  monthlyIncome: "Monthly Income (Thu nhập hàng tháng)",
  hasLaborContract: "Has Labor Contract? (Có hợp đồng lao động?)",
  streetAddress: "Street Address (Tên đường)",
  city: "City (Thành phố)",
  province: "Province (Tỉnh thành)",
  residencyStatus: "Residency Status (Giá trị công dân)",
};
