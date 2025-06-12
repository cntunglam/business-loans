import { CompanyStatusEnum, UserStatusEnum } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';
import { getPlacesRating } from './place.service';

export const isCompanyFrozen = async (companyId: string) => {
  const company = await prismaClient.company.findUniqueOrThrow({
    where: { id: companyId },
    select: { isFrozenAt: true },
  });
  return !!company.isFrozenAt;
};

export const getCompanyFromUserId = async (userId?: string) => {
  if (!userId) throw new Error('UserId is required');
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: userId },
    include: { company: { include: { companyLeadSettings: true } } },
  });
  if (!user.company) throw new Error('User has no company');
  if (user.status !== UserStatusEnum.ACTIVE) throw new Error('User is not active');
  if (user.company.status !== CompanyStatusEnum.ACTIVE) throw new Error('Company is not active');
  return user.company;
};

export const updateAllCompanyRating = async () => {
  console.log(' START_FETCHING_GOOGLE_RATINGS at', new Date().toISOString());
  const stores = await prismaClient.companyStore.findMany({
    where: {
      gPlaceId: {
        not: null,
      },
    },
  });

  const placeIds = stores?.map((store) => store.gPlaceId);
  const ratingsResponse = await getPlacesRating(placeIds as string[]);

  for (const rating of ratingsResponse) {
    if (rating.details.status === 'OK') {
      const placeId = rating.placeId;
      const store = stores.find((store) => store.gPlaceId === placeId);
      if (store) {
        await prismaClient.companyStore.update({
          where: { id: store.id },
          data: { ratings: parseInt(rating.details.result.rating) },
        });
      }
    }
  }

  console.log(' STORE_RATINGS_UPDATED_SUCCESSFULLY at', new Date().toISOString());
};
