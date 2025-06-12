import {
  ERROR_KEYS,
  LeadSettingsFormSchema,
  LenderSettingsKeys,
  NotificationTypeEnum,
  OfferPreferenceSettingsSchema,
} from '@roshi/shared';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';

export const getCompanyStores = async (req: Request, res: Response) => {
  const stores = await prismaClient.companyStore.findMany({
    where: { companyId: req.params.companyId },
    include: { openingHours: true },
  });

  return successResponse(res, stores);
};

export const getCompanyNotificationSettings = async (req: Request, res: Response) => {
  const company = await prismaClient.company.findFirstOrThrow({
    where: { users: { some: { id: req.user!.sub } } },
    include: { notificationSettings: true },
  });

  return successResponse(res, company.notificationSettings);
};

export const updateNotificationSettingsSchema = z.object({
  emailNotificationTypes: z.array(z.nativeEnum(NotificationTypeEnum)).optional(),
  webhookNotificationTypes: z.array(z.nativeEnum(NotificationTypeEnum)).optional(),
  emails: z.array(z.string().email()).optional(),
  webhooks: z.array(z.string().url()).optional(),
  emailNotificationsEnabled: z.boolean(),
  webhookNotificationsEnabled: z.boolean(),
});
export const updateNotificationSettings = async (req: Request, res: Response) => {
  const company = await prismaClient.company.findFirstOrThrow({
    where: { users: { some: { id: req.user!.sub } } },
  });

  const body = updateNotificationSettingsSchema.parse(req.body);

  if (
    (body.emailNotificationsEnabled && body.emails?.length === 0) ||
    (body.webhookNotificationsEnabled && body.webhooks?.length === 0)
  )
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR);

  const response = await prismaClient.company.update({
    where: { id: company.id },
    data: {
      notificationSettings: {
        upsert: {
          create: body,
          update: body,
          where: { companyId: company.id },
        },
      },
    },
  });

  return successResponse(res, response);
};

export const getCompanyLeadSettings = async (req: Request, res: Response) => {
  const company = await prismaClient.company.findFirstOrThrow({
    where: { users: { some: { id: req.user!.sub } } },
    include: { companyLeadSettings: true },
  });

  return successResponse(res, company.companyLeadSettings);
};

export const updateCompanyLeadSettingsSchema = LeadSettingsFormSchema;

export const updateCompanyLeadSettings = async (req: Request, res: Response) => {
  const company = await prismaClient.company.findFirstOrThrow({
    where: { users: { some: { id: req.user!.sub } } },
  });

  const body = updateCompanyLeadSettingsSchema.parse(req.body);

  const response = await prismaClient.company.update({
    where: { id: company.id },
    data: {
      companyLeadSettings: {
        upsert: {
          create: body,
          update: body,
          where: { companyId: company.id },
        },
      },
    },
  });

  return successResponse(res, response);
};

export const getOfferPreferenceSettingsQuerySchema = z.object({
  key: z.nativeEnum(LenderSettingsKeys),
});
export const getOfferPreferenceSettings = async (req: Request, res: Response) => {
  if (!req.user?.companyId) return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);
  const query = getOfferPreferenceSettingsQuerySchema.parse(req.query);

  const companySettings = await prismaClient.companySettings.findUnique({
    where: { companyId_key: { companyId: req.user.companyId, key: query.key } },
  });

  return successResponse(res, companySettings);
};

export const updateOfferPreferenceSettings = async (req: Request, res: Response) => {
  if (!req.user?.companyId) return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);

  const body = OfferPreferenceSettingsSchema.parse(req.body);

  const response = await prismaClient.companySettings.upsert({
    where: {
      companyId_key: {
        companyId: req.user.companyId,
        key: body.key,
      },
    },
    create: {
      key: body.key,
      value: body.value,
      companyId: req.user.companyId,
    },
    update: {
      key: body.key,
      value: body.value,
    },
  });

  return successResponse(res, response);
};
