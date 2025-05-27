import { SHARED_CONSTANTS } from "@roshi/shared";

export const CONSTANTS = {
  TERMS_OF_USE_URL: import.meta.env.VITE_TERMS_OF_USE_URL,
  PRIVACY_POLICY_URL: import.meta.env.VITE_PRIVACY_POLICY_URL,
  LOCALE: import.meta.env.VITE_LOCALE,
  PHONE_PREFIX: import.meta.env.VITE_PHONE_PREFIX,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  COUNTRY_CODE: import.meta.env.VITE_COUNTRY_CODE,
  MAX_WIDTH: "1200px",
  WA_PHONE_NUMBER: import.meta.env.VITE_WA_PHONE_NUMBER,
  ENV: import.meta.env.VITE_ENV,
  TIMEZONE: import.meta.env.VITE_TIMEZONE || "Asia/Singapore",
  SUPERADMIN_EMAIL: import.meta.env.VITE_SUPERADMIN_EMAIL,
  ...SHARED_CONSTANTS,
} as const;

Object.keys(CONSTANTS).forEach((key) => {
  const value = CONSTANTS[key as keyof typeof CONSTANTS];
  if (!value) {
    throw new Error(`Missing value for ${key}. Env variable might be missing`);
  }
});

export const KEYS = {
  VISITOR_ID_KEY: "ROSHI_VISITOR_ID",
  AFFILIATE_VISITOR_ID_KEY: "ROSHI_AFFILIATE_VISITOR_ID",
  SINGPASS_CODE_VERIFIER: "ROSHI_SINGPASS_CODE_VERIFIER",
  APPLICATION_LOAN_TYPE: "ROSHI_APPLICATION_LOAN_TYPE",
  ROSHI_SHORT_URL_CODE: "ROSHI_SHORT_URL_CODE",
  AUTH_TOKEN: "token",
};

export const TIME_CONSTANTS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60000,
  ONE_HOUR: 3600000,
  ONE_DAY: 86400000,
  ONE_WEEK: 604800000,
  ONE_MONTH: 2628000000,
  ONE_YEAR: 31536000000,
};
