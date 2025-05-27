import { ERROR_KEYS } from '@roshi/shared';
import { UserRoleEnum } from '@roshi/shared/models/databaseEnums';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { EmailTypeEnum, sendEmail } from '../../services/email.service';
import { generateOtp, verifyOtp } from '../../services/otp.service';
import { generateToken } from '../../services/token.service';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';

export const generateOtpHandler = async (req: Request, res: Response) => {
  const email = req.body.email.toLowerCase();

  const existingOtp = await prismaClient.oTP.findUnique({ where: { email } });
  if (existingOtp && existingOtp.updatedAt.getTime() + 60 * 1000 > Date.now()) {
    return errorResponse(res, 400, ERROR_KEYS.TOO_SOON);
  }

  const otp = await generateOtp(email);
  await sendEmail(email, EmailTypeEnum.OTP, { otp });

  successResponse(res, {});
};

export const generateWhatsappOtpHandler = async (req: Request, res: Response) => {
  const phone = req.body.phone.replace('+', '');

  const existingUser = await prismaClient.user.findFirst({ where: { phone } });
  if (!existingUser) {
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);
  }

  req.body.email = existingUser.email;
  return generateOtpHandler(req, res);
};

export const OTPLoginWithPhoneHandler = async (req: Request, res: Response) => {
  const phone = req.body.phone.replace('+', '');
  const user = await prismaClient.user.findUnique({ where: { phone } });
  if (!user) {
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);
  }

  req.body.email = user.email;
  return OTPLoginHandler(req, res);
};

export const OTPLoginHandler = async (req: Request, res: Response) => {
  const email = req.body.email.toLowerCase();
  const phone = req.body.phone;
  const otp = req.body.otp;

  const isValid = await verifyOtp(email, otp);

  if (!isValid) {
    return errorResponse(res, 400, ERROR_KEYS.INVALID_OTP);
  }

  await prismaClient.oTP.delete({
    where: {
      email,
    },
  });

  const existingUser = await prismaClient.user.findUnique({ where: { email } });
  if (existingUser) {
    const token = generateToken(existingUser);
    return successResponse(res, token);
  }
  const user = await prismaClient.user.create({
    data: {
      email,
      phone,
      role: UserRoleEnum.BORROWER,
    },
  });

  const token = generateToken(user);
  return successResponse(res, token);
};

export const getCurrentUserHandler = async (req: Request, res: Response) => {
  const user = await prismaClient.user.findUnique({
    where: { id: req.user!.sub },
    include: { company: true },
  });

  return successResponse(res, user);
};

export const updateUserSettingsSchema = z.object({
  emailNotificationsDisabled: z.boolean().optional(),
  autoReapplyDisabled: z.boolean().optional(),
});
