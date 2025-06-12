import { Router } from 'express';
import { z } from 'zod';
import {
  OTPLoginHandler,
  OTPLoginWithPhoneHandler,
  generateOtpHandler,
  generateWhatsappOtpHandler,
  getCurrentUserHandler,
} from '../../controllers/v1/account.controller';
import { validate } from '../../utils/validator';
import { verifyAuth } from '../../utils/verifyAuth';

export const accountRouter = Router();

const generateOtpSchema = z.object({ email: z.string().email() });
accountRouter.post('/generate-otp', validate(generateOtpSchema), generateOtpHandler);

const generateWhatsappOtpSchema = z.object({ phone: z.string().length(10) });
accountRouter.post('/generate-whatsapp-otp', validate(generateWhatsappOtpSchema), generateWhatsappOtpHandler);

const OTPLoginSchema = z.object({
  email: z.string().email().max(255).min(3),
  otp: z.string().length(6),
  affiliateVisitorId: z.string().optional(),
});

accountRouter.post('/otp-login', validate(OTPLoginSchema), OTPLoginHandler);
accountRouter.get('/me', verifyAuth(), getCurrentUserHandler);

const OTPLoginWithPhoneSchema = z.object({
  phone: z.string().length(10),
  otp: z.string().length(6),
  affiliateVisitorId: z.string().optional(),
});

accountRouter.post('/otp-login-with-phone', validate(OTPLoginWithPhoneSchema), OTPLoginWithPhoneHandler);
