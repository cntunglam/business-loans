import { Prisma } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';

export const createActivityLog = async (params: Prisma.ActivityLogCreateManyInput) => {
  try {
    return await prismaClient.activityLog.create({ data: params });
  } catch (error) {
    console.error('Error creating activity log', error);
  }
};
