import { JobsEnum, Prisma, PrismaClient } from '@roshi/shared';
import { createJob } from '../jobs/boss';
import { TABLES_TO_SYNC } from './zohoCrmClient';

const syncToZoho = (model: string, id?: string) => {
  if (id && TABLES_TO_SYNC.includes(model)) {
    try {
      console.log(`🚙 Syncing ${model} ${id} to Zoho`);
      createJob(JobsEnum.SYNC_TO_ZOHO, {
        [model]: id,
      });
    } catch (error) {
      console.error(`Failed to sync ${model} ${id} to Zoho:`, error);
    }
  }
};

const createAndSyncToZohoExtension = Prisma.defineExtension({
  name: 'createAndSyncToZoho',
  query: {
    $allModels: {
      async create({ model, operation, args, query }) {
        const result = await query(args);
        console.log(`Created ${model} ${result.id}`);
        syncToZoho(model, result.id);
        return result;
      },
      async update({ model, operation, args, query }) {
        const result = await query(args);
        console.log(`Updated ${model} ${result.id}`);
        syncToZoho(model, result.id);
        return result;
      },
    },
  },
});

const prisma = new PrismaClient();

const extendedPrisma = prisma.$extends(createAndSyncToZohoExtension);

export const prismaClient = extendedPrisma;

export const disconnectPrisma = async () => {
  await prismaClient.$disconnect();
};

export type ExtendedPrismaClient = typeof extendedPrisma;
