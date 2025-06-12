import { JobsEnum } from '@roshi/shared';
import { processWaMessageFromPicky } from '../../services/whatsapp.service';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.WA_MESSAGE_RECEIVED;
export const initWaMessageReceivedJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 2 }, async ([job]) => {
    try {
      const payload = job.data;
      await processWaMessageFromPicky(payload);
    } catch (err) {
      console.error('Error processing message from picky', err);
      throw err;
    }
  });
};
