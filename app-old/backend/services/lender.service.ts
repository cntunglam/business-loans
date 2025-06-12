import { Prisma } from '@roshi/shared';

export const formatLenderForBorrower = (
  lender: Prisma.CompanyGetPayload<{ include: { stores: { select: { ratings: true } } } }>,
  isOfferAccepted?: boolean,
) => {
  return {
    id: lender.id,
    name: lender.name,
    logo: lender.logo,
    salesPhoneNumber: isOfferAccepted ? lender.salesPhoneNumber : undefined,
    description: lender.description,
    stores: lender.stores,
  };
};
