import { Prisma } from '@roshi/shared';

export function getLoanRequestPrismaQuery<T extends Prisma.LoanRequestFindManyArgs>(
  include: Prisma.Subset<T, Prisma.LoanRequestFindManyArgs>,
): T {
  return include;
}
