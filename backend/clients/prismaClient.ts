import { PrismaClient } from '@roshi/shared';

export const prismaClient = new PrismaClient();

export const disconnectPrisma = async () => {
  await prismaClient.$disconnect();
};
