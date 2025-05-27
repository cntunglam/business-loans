import { SHARED_CONSTANTS } from '@roshi/shared';
import dotenv from 'dotenv';
dotenv.config();

const envVars = {
  NODE_ENV: 'development',
  PORT: 4000,
  MAIL_HOST: '172.188.8.207',
  MAIL_USERNAME: 'marketplace@roshi.sg',
  MAIL_PASSWORD: 'password',
  MAIL_PORT: 1025,
  MAIL_FROM: 'marketplace@roshi.sg',
  JWT_SECRET: 'acb3ae125d1340ad15e00769dcd834749ea3ad20e75f52dce56996e2d5b0f5e8',
  AZURE_STORAGE_CONNECTION_STRING: '',
  AZURE_STORAGE_BUCKET_PREFIX: 'roshi-dev',
  CLIENT_APP_URL: 'http://localhost:5173',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
  WA_API_BASE_URL: '',
  WA_PHONE_NUMBER: '',
  WA_PICKY_TOKEN: '',
  WA_PICKY_APPLICATION_ID: '54',
  ADMIN_NOTIFICATION_EMAIL: 'april@roshi.sg',
  JOBS_DATABASE_URL: '',
  OPENAI_API_KEY: '',
  ZOHO_CLIENT_ID: '',
  ZOHO_CLIENT_SECRET: '',
  ZOHO_REFRESH_TOKEN: '',
  ZOHO_ORG_ID: '',
  IBOOKS_API_KEY: '',
  IBOOKS_API_SEC: '',
  MAIL_CHIMP_API_KEY: '',
  MAIL_CHIMP_SERVER_PREFIX: '',
  MAIL_CHIMP_AUDIENCE_ID: '',
  GOOGLE_MAPS_API_KEY: '',
  JOBS_DATABASE_USE_SSL: false,
  SHORT_URL_BASE: 'https://link.roshi.sg',
  TELEGRAM_BOT_TOKEN: '',
} as const;

export const CONFIG = {
  ...Object.keys(envVars).reduce(
    (acc, key) => {
      const value = process.env[key];
      if (!value && process.env.NODE_ENV !== 'development') throw new Error(`Missing env var ${key}`);
      else if (!value && process.env.NODE_ENV === 'development')
        return { ...acc, [key]: envVars[key as keyof typeof envVars] };
      else return { ...acc, [key]: value };
    },
    {} as Record<keyof typeof envVars, string>,
  ),
  SEND_WELCOME_WA_AFTER_MINUTES: process.env.NODE_ENV === 'production' ? 5 : 0.5,
  //8 hours after baseline
  SEND_LOAN_REQUEST_FOLLOW_UP_WA_AFTER_HOURS: process.env.NODE_ENV === 'production' ? 1 : 0.05,
  //Lead considered rejected if rejected offers count is >= 8
  REJECTION_THRESHOLD: 8,

  NOTIFICATION_DELAY_MINUTES: 1,

  APPOINTMENT_SCHEDULED_NOTIFICATION_DELAY_MINUTES: 0.1,
  APPOINTMENT_CANCELLED_NOTIFICATION_DELAY_MINUTES: 0.1,
  APPOINTMENT_OUTCOME_REMINDER_NOTIFICATION_DELAY_MINUTES: 60,

  CIMB_OFFER_AFTER_HOURS: 2,
  ZOHO_BOOKS_URL: 'https://www.zohoapis.com/books/v3',
  ZOHO_ACCOUNTS_URL: 'https://accounts.zoho.com',
  IBOOKS_API_URL: 'https://api.ibooks-sg.com',
  MLCB_REPORT_REQUEST_AMOUNT: 1000,
  SEND_REVIEW_LINK_AFTER_MINUTES: 5,
  APPOINTMENT_REMINDER_HOURS_BEFORE: 1,
  LEAD_EXPIRATION_DAYS: 15,
  APPOINTMENT_OUTCOME_REMINDER_HOURS_AFTER: 1,
  LENDERS_LEAD_EXPIRATION_DAYS: 15,
  LOAN_REQUEST_APPROVAL_DELAY_MINUTES: 10,
  NOTIFICATION_BATCHING_WINDOW_MINUTES: 5,
  MIN_REQUIRED_RESPONSES_FOR_POSITIVE_FOLLOW_UP: 6,
  RETRY_FOLLOW_UP_AFTER_HOURS: 1,
  CIMB_OFFER_LINK:
    'https://ploan.cimb.com.sg/partner/renoploan?product=P00001&orderid=jn314&applicAmount=5000&type=corporate&callbackUrl=https%3A%2f%2fwww.cimb.com.sg%2fen%2fpersonal%2fhome.html?renoploan.com&utoken=015129320D7CBD53AD74F106B1E6A388&agentCode=PLReno0380',
  ...SHARED_CONSTANTS,
} as const;
