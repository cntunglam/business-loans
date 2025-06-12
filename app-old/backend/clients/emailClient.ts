import nodemailer from 'nodemailer';
import { CONFIG } from '../config';

export const emailClient = nodemailer.createTransport({
  host: CONFIG.MAIL_HOST,
  port: Number(CONFIG.MAIL_PORT),
  from: CONFIG.MAIL_FROM,
  auth: {
    user: CONFIG.MAIL_USERNAME,
    pass: CONFIG.MAIL_PASSWORD,
  },
  tls: {
    //Only in production
    rejectUnauthorized: CONFIG.NODE_ENV === 'production',
  },
});
