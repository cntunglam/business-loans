import { JobsEnum, NotificationTypeEnum, UserRoleEnum } from '@roshi/shared';
import { getCompanyIdsByLeadSettings } from '../../services/leadFilters.service';
import { sendNotification } from '../../services/notification.service';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.CHECK_LENDER_FILTERS;
export const initCheckLendersFiltersJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 2 }, async ([job]) => {
    const companiesToNotify = await getCompanyIdsByLeadSettings(job.data.loanRequestId);

    await Promise.allSettled(
      companiesToNotify.map((company) =>
        sendNotification({
          notificationType: NotificationTypeEnum.NEW_LOAN_REQUEST,
          targetType: UserRoleEnum.LENDER,
          companyId: company,
          payload: { loanRequestId: job.data.loanRequestId },
        }),
      ),
    );

    // if (companiesToNotify.length === 0) {
    //   await prismaClient.loanResponse.updateMany({
    //     where: {
    //       loanRequestId: job.data.loanRequestId,
    //     },
    //     data: {
    //       status: LoanResponseStatusEnum.REJECTED,
    //       comment: 'Lead did not meet lender filters',
    //       rejectionReasons: ['Lead did not meet lender filters'],
    //     },
    //   });
    // }
  });
};
