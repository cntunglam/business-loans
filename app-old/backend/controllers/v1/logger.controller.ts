import { ERROR_KEYS, LogLevel, LogSource } from '@roshi/shared';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';

import { CONFIG } from '../../config';
import { successResponse } from '../../utils/successResponse';

export const getAllLogsSchema = z.object({
  source: z.enum(Object.values(LogSource) as [string, ...string[]]).optional(),
  level: z.enum(Object.values(LogLevel) as [string, ...string[]]).optional(),
  errorType: z.enum(Object.values(ERROR_KEYS) as [string, ...string[]]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export const getLogs = async (req: Request, res: Response) => {
  const {
    source,
    level,
    errorType,
    startDate,
    endDate,
    page,
    limit = CONFIG.ITEMS_PER_PAGE,
  } = getAllLogsSchema.parse(req.query);

  const where = {
    ...(source && { source }),
    ...(level && { level }),
    ...(errorType && { errorType }),
    ...(startDate &&
      endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
  };

  const [count, response] = await prismaClient.$transaction([
    prismaClient.appLogs.count({ where }),
    prismaClient.appLogs.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return successResponse(res, response, 'OK', {
    limit: limit,
    totalItems: count,
    page: page!,
    totalPages: Math.ceil(count / limit),
  });
};
