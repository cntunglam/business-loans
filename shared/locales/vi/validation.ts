/**
 * Vietnamese validation messages
 */

export const VALIDATION_MESSAGES = {
  // CCCD related messages
  CCCD: {
    REQUIRED: "Vui lòng nhập số CCCD",
    INVALID: "Số CCCD không hợp lệ. Vui lòng kiểm tra lại",
    LENGTH: "Số CCCD phải có đúng 12 chữ số",
  },

  // Common validation messages
  COMMON: {
    REQUIRED: "Trường này là bắt buộc",
    INVALID_EMAIL: "Địa chỉ email không hợp lệ",
    INVALID_PHONE: "Số điện thoại không hợp lệ",
  },

  // Document related messages
  DOCUMENT: {
    REQUIRED: "Vui lòng tải lên tài liệu",
    INVALID_TYPE: "Định dạng tệp không được hỗ trợ",
    TOO_LARGE: "Kích thước tệp quá lớn",
  },
} as const;

// Type for better intellisense
export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
export type ValidationMessageValue =
  (typeof VALIDATION_MESSAGES)[ValidationMessageKey];
