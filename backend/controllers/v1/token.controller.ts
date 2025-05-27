import { ERROR_KEYS } from '@roshi/shared';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import {
  clearUserRefreshTokens,
  createRefreshToken,
  generateToken,
  verifyRefreshToken,
} from '../../services/token.service';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR);
  }

  try {
    const user = await verifyRefreshToken(token);
    const newJwt = generateToken(user);

    await clearUserRefreshTokens(user.id);
    const newToken = await createRefreshToken(user.id);

    return successResponse(res, { token: newJwt, refreshToken: newToken.token });
  } catch (error) {
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);
  }
};

export const deleteToken = async (req: Request, res: Response) => {
  const result = await prismaClient.refreshToken.deleteMany({ where: { userId: req.params.userId } });
  if (result.count === 0) {
    return errorResponse(res, 404, ERROR_KEYS.NOT_FOUND);
  }
  return successResponse(res, {});
};

export const getMyAPITokens = async (req: Request, res: Response) => {
  const result = await prismaClient.aPIToken.findMany({
    where: { userId: req.user?.sub },
    orderBy: { createdAt: 'desc' },
  });
  result.forEach((token) => {
    token.token = `*******${token.token.slice(-6)}`;
  });
  return successResponse(res, result);
};

export const generateAPITokenSchema = z.object({
  name: z.string(),
});

export const generateAPIToken = async (req: Request, res: Response) => {
  const { name } = generateAPITokenSchema.parse(req.body);
  const apiToken = await prismaClient.aPIToken.create({
    data: {
      token: randomUUID(),
      userId: req.user!.sub,
      name,
    },
  });
  return successResponse(res, apiToken);
};

export const deleteAPIToken = async (req: Request, res: Response) => {
  await prismaClient.aPIToken.delete({ where: { id: req.params.id, userId: req.user?.sub } });
  return successResponse(res, {});
};
