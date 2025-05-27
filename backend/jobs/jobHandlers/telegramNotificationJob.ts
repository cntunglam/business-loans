import {
  JobsEnum,
  NotificationStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { NotifPayloadParams } from '../../services/notification.service';
import { generateTgNotificationContent } from '../../services/notifications/telegramNotification.service';
import { sendMessage } from '../../services/telegram.service';
import { boss, createJob } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.TELEGRAM_NOTIFICATION;

export const initTelegramNotificationJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 2 }, async ([job]) => {
    const notificationId = job.data.notificationId;
    try {
      const notification = await prismaClient.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error(`Notification not found for ID ${notificationId}`);
      }

      if (notification.sentAt) {
        throw new Error(`Notification ${notificationId} is already sent`);
      }

      if (notification.transport !== NotificationTransportEnum.TELEGRAM || !notification.recipientTelegramChatId) {
        throw new Error(`Notification ${notificationId} is not a Telegram notification`);
      }

      const batchNotifications = notification.batchId
        ? await prismaClient.notification.findMany({
            where: { batchId: notification.batchId, sentAt: null },
          })
        : [];

      if (
        batchNotifications.length > 0 &&
        batchNotifications.some((notif) => notif.createdAt > notification.createdAt)
      ) {
        await prismaClient.notification.update({
          where: { id: notification.id },
          data: {
            status: NotificationStatusEnum.IGNORED,
            errorMessage: 'Batch notification will be handled by another job',
          },
        });
        return;
      }

      const typedNotificationType = notification.notificationType as NotificationTypeEnum;
      const typedPayload = notification.payload as NotifPayloadParams<typeof typedNotificationType>;

      const res = await generateTgNotificationContent(typedNotificationType, {
        ...typedPayload,
        batchId: notification.batchId,
        loanRequestId: notification.loanRequestId!,
        targetUser: notification.targetType as UserRoleEnum,
      });

      if (res.retry) {
        //Create new job and mark this one as completed by returning
        createJob(JobsEnum.TELEGRAM_NOTIFICATION, { notificationId }, { startAfter: res.retry });
        return;
      } else if (res.content) {
        if (res.content) {
          sendMessage(notification.recipientTelegramChatId, res.content, res.buttons);
          const notificationIds =
            batchNotifications.length > 0 ? batchNotifications.map((notif) => notif.id) : [notificationId];

          await prismaClient.notification.updateMany({
            where: { id: { in: notificationIds } },
            data: {
              status: NotificationStatusEnum.SENT,
              sentAt: new Date(),
            },
          });
        }
      } else {
        //If no content is provided, it means we don't want to send the notification
        await prismaClient.notification.update({
          where: { id: notificationId },
          data: {
            status: NotificationStatusEnum.IGNORED,
            failedAt: new Date(),
            responsePayload: res.reason,
          },
        });
      }
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
      throw error;
    }
  });
};
