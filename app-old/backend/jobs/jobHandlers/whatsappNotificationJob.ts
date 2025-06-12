import {
  JobsEnum,
  NotificationStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import { prismaClient } from '../../clients/prismaClient';
import { whatsappClient } from '../../clients/whatsappClient';
import { CONFIG } from '../../config';
import { NotifPayloadParams } from '../../services/notification.service';
import { handleWANotification } from '../../services/notifications/whatsappNotification.service';
import { boss, createJob } from '../boss';
import { JobPayload } from '../jobsData';

const queueName = JobsEnum.WHATSAPP_NOTIFICATION;
export const initWhatsappNotificationJob = () => {
  boss.work<JobPayload<typeof queueName>>(queueName, { pollingIntervalSeconds: 15 }, async ([job]) => {
    const notificationId = job.data.notificationId;
    try {
      const notification = await prismaClient.notification.findUnique({
        where: { id: notificationId },
      });
      if (!notification?.phoneNumber || notification.transport !== NotificationTransportEnum.WHATSAPP) {
        throw new Error(`Notification not found ${notificationId} or missing data`);
      }

      const typedNotificationType = notification.notificationType as NotificationTypeEnum;
      const typedPayload = notification.payload as NotifPayloadParams<typeof typedNotificationType>;
      const res = await handleWANotification(typedNotificationType, {
        ...typedPayload,
        loanRequestId: notification.loanRequestId!,
        targetUser: notification.targetType as UserRoleEnum,
      });
      if (res.retry) {
        //Create new job and mark this one as completed by returning
        createJob(JobsEnum.WHATSAPP_NOTIFICATION, { notificationId }, { startAfter: res.retry });
        return;
      }
      if (res.content) {
        const response = await whatsappClient.sendMessage(
          CONFIG.WA_PHONE_NUMBER,
          { phone: notification.phoneNumber },
          res.content,
        );
        await prismaClient.notification.update({
          where: { id: notificationId },
          data: {
            status: NotificationStatusEnum.SENT,
            sentAt: new Date(),
            //Store WaMessage ID
            responsePayload: { id: response!.id },
          },
        });
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
      throw error; // Re-throw to let pg-boss handle retries
    }
  });
};
