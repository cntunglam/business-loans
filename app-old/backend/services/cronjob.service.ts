import { ERROR_KEYS, LogLevel, LogSource } from '@roshi/shared';
import { CronJob } from 'cron';
import { CONFIG } from '../config';
import logger from '../utils/logger';
import { addBorrowersToMailChimpList } from './mailChimp.service';
import { computeReapplyLoanRequests } from './re-apply.service';
import { generateInvoicesForLastMonth } from './zohoBooks.service';

export const setupCronJobs = () => {
  const cronJobs = [
    new CronJob('0 0 1 * *', generateInvoicesForLastMonth, null, false, CONFIG.TIMEZONE),
    new CronJob('0 3 * * *', computeReapplyLoanRequests, null, false, CONFIG.TIMEZONE),
    new CronJob('0 0 * * *', addBorrowersToMailChimpList, null, false, CONFIG.TIMEZONE),
    // new CronJob('0 0 * * *', updateAllCompanyRating, null, false, CONFIG.TIMEZONE),
  ];

  cronJobs.forEach((job) => {
    job.errorHandler = (error) => {
      logger({
        error: error instanceof Error ? error : new Error(JSON.stringify(error)),
        source: LogSource.CRON_JOB,
        level: LogLevel.ERROR,
        errorType: ERROR_KEYS.INTERNAL_ERROR,
      });
    };
    job.start();
  });
};
