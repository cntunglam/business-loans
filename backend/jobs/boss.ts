import { JobsEnum } from '@roshi/shared';
import PgBoss from 'pg-boss';
import { CONFIG } from '../config';
import { initActivateReapplyLoanRequestJob } from './jobHandlers/activateReapplyLoanRequestJob';
import { initCheckLendersFiltersJob } from './jobHandlers/checkLenderFiltersJob';
import { initEmailNotificationJob } from './jobHandlers/emailNotificationJob';
import { initFetchMLCBReportJob } from './jobHandlers/fetchMlcbReportJob';
// import { initLeadGradingJob } from './jobHandlers/leadGradingJob';
import { initLoanRequestJob } from './jobHandlers/loanRequestJob';
import { initReApplyJob } from './jobHandlers/reApplyJob';
import { initTelegramNotificationJob } from './jobHandlers/telegramNotificationJob';
import { initWaMessageReceivedJob } from './jobHandlers/waMessageReceivedJob';
import { initWebhookNotificationJob } from './jobHandlers/webhookNotificationJob';
import { initWhatsappNotificationJob } from './jobHandlers/whatsappNotificationJob';
import { JobPayload } from './jobsData';

export const JobQueuesOptions: Partial<Record<JobsEnum, PgBoss.Queue>> = {
  [JobsEnum.WEBHOOK_NOTIFICATION]: {
    name: JobsEnum.WEBHOOK_NOTIFICATION,
    retryLimit: 10,
    retryDelay: 120,
    retryBackoff: true,
  },
  //In case there is a failure, we don't want to query the endpoint too much
  [JobsEnum.FETCH_MLCB_REPORT]: {
    name: JobsEnum.FETCH_MLCB_REPORT,
    retryLimit: 0,
  },
  [JobsEnum.LEAD_GRADING]: {
    name: JobsEnum.LEAD_GRADING,
    retryLimit: 0,
  },
};

export const boss = new PgBoss({
  connectionString: CONFIG.JOBS_DATABASE_URL,
  ssl: CONFIG.JOBS_DATABASE_USE_SSL === 'true' || false,
});

export const createJob = <T extends JobsEnum>(queueName: T, payload: JobPayload<T>, options?: PgBoss.SendOptions) => {
  return boss.send(queueName, payload || {}, options || {});
};

process.on('SIGINT', async () => {
  console.log('pg-boss shutting down...');
  try {
    await boss.stop();
    console.log('pg-boss stopped successfully.');
  } catch (error) {
    console.error('Error during pg-boss shutdown:', error);
  } finally {
    process.exit(0);
  }
});

(async () => {
  try {
    boss.on('error', (error) => {
      console.error('pg-boss error:', error);
    });
    await boss.start();
    for (const queueName of Object.values(JobsEnum)) {
      const options = queueName in JobQueuesOptions ? JobQueuesOptions[queueName] : undefined;
      await boss.createQueue(queueName, options);
    }

    initCheckLendersFiltersJob();
    initEmailNotificationJob();
    initTelegramNotificationJob();
    initWebhookNotificationJob();
    initWhatsappNotificationJob();
    initWaMessageReceivedJob();
    //initValidateDocumentJob();
    initFetchMLCBReportJob();
    // initLeadGradingJob();

    initReApplyJob();
    initActivateReapplyLoanRequestJob(); // triggered when users go to dashboard or click email link (to go to dashboard)
    initLoanRequestJob();

    console.log('pg-boss connection successful!');
  } catch (error) {
    console.log('Error during pg-boss start:', error);
  }
})();
