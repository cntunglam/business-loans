import { User } from '@prisma/client';
import crypto from 'crypto';
import { prismaClient } from '../clients/prismaClient';
import { whatsappClient } from '../clients/whatsappClient';
import { CONFIG } from '../config';

export const generateOtp = async (email: string) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prismaClient.oTP.upsert({
    where: { email },
    update: { otp, createdAt: new Date(), expiresAt },
    create: { otp, email, createdAt: new Date(), expiresAt },
  });

  return otp;
};

export const verifyOtp = async (email: string, otp: string) => {
  const record = await prismaClient.oTP.findUnique({
    where: { email },
  });

  if (record && record.otp === otp && record.expiresAt > new Date()) {
    return true;
  }
  return false;
};

export const sendOtpToWhatsapp = async (user: User) => {
  const existingOtp = await prismaClient.oTP.findUnique({ where: { email: user.email } });
  if (existingOtp && existingOtp.updatedAt.getTime() + 60 * 1000 > Date.now()) {
    return;
  }

  const otp = await generateOtp(user.email);
  const message = `Your OTP is ${otp}`;
  await whatsappClient.sendMessage(CONFIG.WA_PHONE_NUMBER, { phone: user.phone! }, message, user.id, false);
};
