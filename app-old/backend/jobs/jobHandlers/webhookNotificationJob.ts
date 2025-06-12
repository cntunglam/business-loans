import { JobsEnum, NotificationStatusEnum, NotificationTransportEnum, NotificationTypeEnum } from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { NotifPayloadParams } from '../../services/notification.service';
import { generateWebhookPayload } from '../../services/webhook.service';
import { boss } from '../boss';
import { JobPayload } from '../jobsData';

const tier1Lenders = new Set([
  //Express
  'a9c21179-8606-4dad-b9fe-0615f596131a',
  //Best
  '154a2c23-40a5-4ea6-894a-155d55d0484e',
  //EZ
  '8d823a52-e0f4-4376-ada0-dac821237d94',
]);

const queueName = JobsEnum.WEBHOOK_NOTIFICATION;
export const initWebhookNotificationJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 2 }, async ([job]) => {
    const notificationId = job.data.notificationId;
    try {
      const notification = await prismaClient.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification?.webhookUrl || notification.transport !== NotificationTransportEnum.WEBHOOK) {
        throw new Error(`Notification not found for ID ${notificationId} or wrong transport`);
      }
      if (!notification.loanRequestId) {
        throw new Error(`Missing loanRequestId in payload for notification ${notificationId}`);
      }

      if (notification.companyId && !tier1Lenders.has(notification.companyId)) {
        console.log(`Company with ID: ${notification.companyId} is not a tier 1 lender`);
        return;
      }

      const typedNotificationType = notification.notificationType as NotificationTypeEnum;
      const typedPayload = notification.payload as NotifPayloadParams<typeof typedNotificationType>;

      const webhookPayload = await generateWebhookPayload(typedNotificationType, {
        ...typedPayload,
        loanRequestId: notification.loanRequestId,
      });

      const response = await fetch(
        CONFIG.NODE_ENV === 'production' ? notification.webhookUrl : `http://localhost:${CONFIG.PORT}/webhook-test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: notification.notificationType,
            data: webhookPayload,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to send webhook notification: ${response.statusText}`);
      }

      await prismaClient.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatusEnum.SENT,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      const stringErr = error instanceof Error ? error.message : JSON.stringify(error);
      await prismaClient.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatusEnum.FAILED,
          errorMessage: stringErr,
          failedAt: new Date(),
        },
      });
      throw error; // Re-throw to let pg-boss handle retries
    }
  });
};
