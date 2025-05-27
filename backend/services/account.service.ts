import { Prisma, SingpassData } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';
import { generateToken } from './token.service';

export const createAccountFromSingpass = async (singpassData: SingpassData) => {
  if (!singpassData.email?.value || !singpassData.mobileno?.nbr?.value) {
    throw new Error('Missing email or mobile number');
  }

  // Create user
  const createdUser = await prismaClient.user.create({
    data: {
      email: singpassData.email.value,
      nric: singpassData.uinfin?.value,
      phone: singpassData.mobileno?.areacode?.value + singpassData.mobileno?.nbr?.value,
      name: singpassData.name?.value,
      role: 'BORROWER',
    },
  });

  const token = generateToken(createdUser);

  return { createdUser, token };
};

export const getUserSingpassData = async (userId: string) => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: userId },
    include: { singpassData: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  return user?.singpassData && user.singpassData.length > 0 ? (user.singpassData[0].data as SingpassData) : null;
};

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

export const updateUserLastLogin = async (userId: string): Promise<void> => {
  try {
    await prismaClient.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.warn(`Failed to update lastLoginAt for user ${userId}.`);
  }
};
