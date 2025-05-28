import { UserRoleEnum, UserStatusEnum } from '@roshi/shared';
import { format } from 'date-fns';
import { mailChimpClient } from '../clients/mailChimpClient';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';
import { getAgeFromDateOfBirth } from '../utils/age';

export const addBorrowersToMailChimpList = async () => {
  const borrowers = await prismaClient.user.findMany({
    where: {
      role: UserRoleEnum.BORROWER,
      status: UserStatusEnum.ACTIVE,
    },
    include: {
      loanRequests: {
        include: {
          applicantInfo: {
            include: { documents: true, applicantOf: true, guarantorOf: true },
          },
        },
      },
    },
  });

  const BATCH_SIZE = 500;
  let totalCreated = 0;
  let totalErrors = 0;
  let allErrors: any[] = [];

  for (let i = 0; i < borrowers.length; i += BATCH_SIZE) {
    const batch = borrowers.slice(i, i + BATCH_SIZE);
    const response = await mailChimpClient.lists.batchListMembers(CONFIG.MAIL_CHIMP_AUDIENCE_ID /* Unique List ID */, {
      members: batch.map((user) => {
        const loanReq = user.loanRequests.length > 0 ? user.loanRequests[0] : undefined;
        const applicantInfo = loanReq?.applicantInfo;
        const data = {
          email_address: user.email,
          status: 'subscribed',
          merge_fields: {
            EMAIL: user.email,
            USER_ID: user.id,
            NAME: user.name || '',
            CREATED_AT: format(user.createdAt, 'MM/dd/yyyy'),
            AGE: getAgeFromDateOfBirth(applicantInfo?.dateOfBirth),
            JOB: applicantInfo?.province,
            INCOME: applicantInfo?.monthlyIncome,
          },
        };
        return data;
      }),
      update_existing: true, // This will update existing subscribers instead of error
    });

    totalCreated += response.total_created;
    totalErrors += response.error_count;
    if (response.errors) {
      allErrors = [...allErrors, ...response.errors];
    }
  }

  console.log(`Added/updated ${totalCreated} members`);
  console.log(`${totalErrors} errors`);

  if (allErrors.length > 0) {
    console.log('Errors:', allErrors);
  }
};
