import { prismaClient } from '../clients/prismaClient';
import { ZOHO_KEYS } from '../clients/zohoCrmClient';
import { CONFIG } from '../config';

export const createZohoCrmKeys = async () => {
  const existing = await prismaClient.keys.findFirst({
    where: {
      key: ZOHO_KEYS.ZOHO_REFRESH_TOKEN,
    },
  });
  if (existing) {
    console.log('Zoho CRM keys already exist');
    return;
  }
  if (!CONFIG.ZOHO_REFRESH_TOKEN) {
    console.log('Zoho CRM refresh token not found in config');
    return;
  }
  await prismaClient.keys.create({
    data: {
      key: ZOHO_KEYS.ZOHO_REFRESH_TOKEN,
      value: CONFIG.ZOHO_REFRESH_TOKEN,
    },
  });
  console.log('Zoho CRM keys created');
};
