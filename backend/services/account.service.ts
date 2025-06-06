import { Prisma } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';

export const updateUserSettings = async (
  email: string,
  params: Partial<Pick<Prisma.UserSettingsGetPayload<{}>, 'autoReapplyDisabled' | 'emailNotificationsDisabled'>>,
) => {
  await prismaClient.userSettings.upsert({
    where: {
      userEmail: email,
    },
    create: {
      userEmail: email,
      ...params,
    },
    update: {
      ...params,
    },
  });
};

export const updateUserLastLogin = async (userId: string) => {
  try {
    await prismaClient.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.warn(`Failed to update lastLoginAt for user ${userId}.`);
  }
};
