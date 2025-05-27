import {
  JobsEnum,
  NotificationStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { NotifPayloadParams } from '../../services/notification.service';
import { handleEmailNotification } from '../../services/notifications/emailNotification.service';
import { boss, createJob } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.EMAIL_NOTIFICATION;
export const initEmailNotificationJob = () => {
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

      if (notification.transport !== NotificationTransportEnum.EMAIL || !notification.recipientEmail) {
        throw new Error(`Notification ${notificationId} is not an email notification`);
      }
      const batchNotifications = notification.batchId
        ? await prismaClient.notification.findMany({
            where: { batchId: notification.batchId, sentAt: null },
          })
        : [];
      //Check if notification with same batchId has been created more recently
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

      const userSettings = await prismaClient.userSettings.findUnique({
        where: { userEmail: notification.recipientEmail },
      });

      if (userSettings?.emailNotificationsDisabled) {
        console.log(' User has disabled email notifications ', notification.recipientEmail);
        return;
      }

      const typedNotificationType = notification.notificationType as NotificationTypeEnum;
      const typedPayload = notification.payload as NotifPayloadParams<typeof typedNotificationType>;
      const res = await handleEmailNotification(notification.recipientEmail, typedNotificationType, {
        ...typedPayload,
        batchId: notification.batchId,
        loanRequestId: notification.loanRequestId!,
        targetUser: notification.targetType as UserRoleEnum,
      });
      if (res.retry) {
        //Create new job and mark this one as completed by returning
        createJob(JobsEnum.EMAIL_NOTIFICATION, { notificationId }, { startAfter: res.retry });
        return;
      }
      await prismaClient.notification.updateMany({
        where: { id: { in: batchNotifications.map((notif) => notif.id) } },
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
