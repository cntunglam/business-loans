import { User } from '@prisma/client';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';

export const generateToken = (user: User): string => {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, companyId: user.companyId }, CONFIG.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export async function createRefreshToken(userId: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const newToken = randomBytes(64).toString('hex');
  return await prismaClient.refreshToken.create({ data: { token: newToken, expiresAt, userId: userId } });
}

export async function clearUserRefreshTokens(userId: string) {
  return await prismaClient.refreshToken.deleteMany({ where: { userId } });
}

export const verifyRefreshToken = async (token: string) => {
  const refreshToken = await prismaClient.refreshToken.findUnique({
    where: { token, expiresAt: { gte: new Date() } },
    include: { user: true },
  });

  if (!refreshToken || refreshToken.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }

  return refreshToken.user;
};
