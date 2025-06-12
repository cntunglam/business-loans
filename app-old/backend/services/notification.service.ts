import {
  hasCustomerSupportPermissions,
  JobsEnum,
  NotificationStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  Prisma,
  UserRoleEnum,
} from '@roshi/shared';
import { randomUUID } from 'crypto';
import PgBoss from 'pg-boss';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';
import { createJob } from '../jobs/boss';

export const generateBatchId = {
  [NotificationTypeEnum.OFFER_RECEIVED]: (options: { loanRequestId: string }) =>
    `LOAN_OFFER_RECEIVED_${options.loanRequestId}`,
  //Batch together appointment related
  [NotificationTypeEnum.APPOINTMENT_SCHEDULED]: (options: { appointmentId: string }) =>
    `APPOINTMENT_${options.appointmentId}`,
  [NotificationTypeEnum.APPOINTMENT_CANCELED]: (options: { appointmentId: string }) =>
    `APPOINTMENT_${options.appointmentId}`,
};

export const generateUniqueKey = {
  [NotificationTypeEnum.WELCOME]: (options: { loanRequestId: string }) => `WELCOME_${options.loanRequestId}`,
  [NotificationTypeEnum.OFFER_RECEIVED]: (options: { loanRequestId: string; loanResponseId: string }) =>
    `LOAN_OFFER_RECEIVED_${options.loanRequestId}_${options.loanResponseId}`,
  [NotificationTypeEnum.OFFER_SELECTED]: (options: {
    role: UserRoleEnum;
    loanRequestId: string;
    loanResponseId: string;
  }) => `OFFER_SELECTED_${options.role}_${options.loanRequestId}_${options.loanResponseId}`,
  [NotificationTypeEnum.APPOINTMENT_SCHEDULED]: (options: { role: UserRoleEnum; appointmentId: string }) =>
    `APPOINTMENT_SCHEDULED_${options.role}_${options.appointmentId}`,
  [NotificationTypeEnum.APPOINTMENT_CANCELED]: (options: { role: UserRoleEnum; appointmentId: string }) =>
    `APPOINTMENT_CANCELED_${options.role}_${options.appointmentId}`,
  [NotificationTypeEnum.APPOINTMENT_OUTCOME_REMINDER]: (options: { appointmentId: string }) =>
    `APPOINTMENT_OUTCOME_REMINDER_${options.appointmentId}`,
  //We use same unique ID for AUTO_IPA and NEW_LOAN_REQUEST. Because we only ever send 1 or the other. Never both
  [NotificationTypeEnum.NEW_LOAN_REQUEST]: (options: {
    role: UserRoleEnum;
    loanRequestId: string;
    companyId?: string;
  }) => `NEW_LOAN_REQUEST_OR_AUTO_IPA_${options.role}_${options.loanRequestId}_${options.companyId || 0}`,
  [NotificationTypeEnum.AUTO_IPA]: (options: { role: UserRoleEnum; loanRequestId: string; companyId?: string }) =>
    `NEW_LOAN_REQUEST_OR_AUTO_IPA_${options.role}_${options.loanRequestId}_${options.companyId || 0}`,
  [NotificationTypeEnum.LOAN_REQUEST_FOLLOW_UP]: (options: { loanRequestId: string }) =>
    `LOAN_REQUEST_FOLLOW_UP_${options.loanRequestId}`,
  [NotificationTypeEnum.APPOINTMENT_REMINDER]: (options: { appointmentId: string }) =>
    `APPOINTMENT_REMINDER_${options.appointmentId}`,
  [NotificationTypeEnum.CASHBACK_OFFER]: (options: { loanRequestId: string }) =>
    `CASHBACK_OFFER_${options.loanRequestId}`,
  [NotificationTypeEnum.CASHBACK_OFFER2]: (options: { loanRequestId: string }) =>
    `CASHBACK_OFFER2_${options.loanRequestId}`,
  [NotificationTypeEnum.PRICE_BEAT]: (options: { loanRequestId: string }) => `PRICE_BEAT_${options.loanRequestId}`,
  [NotificationTypeEnum.REVIEW_LINK]: (options: { loanRequestId: string }) => `REVIEW_LINK_${options.loanRequestId}`,
  [NotificationTypeEnum.LOWER_AMOUNT_DISBURSED]: (options: { loanRequestId: string }) =>
    `LOWER_AMOUNT_DISBURSED_${options.loanRequestId}`,
};

//LoanRequestId is referenced directly on the notification, and doesn't need to be included here
export const notificationRequiredPayload = {
  [NotificationTypeEnum.OFFER_SELECTED]: (payload: { loanResponseId: string }) => payload,
  [NotificationTypeEnum.APPOINTMENT_SCHEDULED]: (payload: { appointmentId: string }) => payload,
  [NotificationTypeEnum.APPOINTMENT_REMINDER]: (payload: { appointmentId: string }) => payload,
  [NotificationTypeEnum.APPOINTMENT_CANCELED]: (payload: { appointmentId: string; loanResponseId: string }) => payload,
  [NotificationTypeEnum.AUTO_IPA]: (payload: { loanResponseId: string }) => payload,
  [NotificationTypeEnum.OFFER_RECEIVED]: (payload: { loanResponseId: string }) => payload,
  [NotificationTypeEnum.APPOINTMENT_OUTCOME_REMINDER]: (payload: { appointmentId: string }) => payload,
};

export type NotifPayloadParams<T extends NotificationTypeEnum> = T extends keyof typeof notificationRequiredPayload
  ? Parameters<(typeof notificationRequiredPayload)[T]>[0]
  : {};
type NotifUniqueKeyParams<T extends NotificationTypeEnum> = T extends keyof typeof generateUniqueKey
  ? Parameters<NonNullable<(typeof generateUniqueKey)[T]>>[0]
  : {};
type NotifBatchIdParams<T extends NotificationTypeEnum> = T extends keyof typeof generateBatchId
  ? Parameters<NonNullable<(typeof generateBatchId)[T]>>[0]
  : {};

//We want to omit role from payload since it's passed as a different parameter
type fullPayloadParams<T extends NotificationTypeEnum> = Omit<
  { loanRequestId: string } & NotifPayloadParams<T> & NotifUniqueKeyParams<T> & NotifBatchIdParams<T>,
  'role' | 'companyId' | 'phoneNumber'
>;

interface SendNotificationBaseParams<T extends NotificationTypeEnum> {
  notificationType: T;
  payload: fullPayloadParams<T>;
  companyId?: string;
  targetType: UserRoleEnum;
  transport?: NotificationTransportEnum;
  recipientEmail?: string;
  phoneNumber?: string;
}

interface SendNotificationLenderParams<T extends NotificationTypeEnum> extends SendNotificationBaseParams<T> {
  companyId: string;
  targetType: UserRoleEnum.LENDER;
  recipientEmail?: never;
  phoneNumber?: never;
  //Retrieved from Company notification settings. No need to specify
  transport?: never;
}

interface SendNotificationWhatsappBorrowerParams<T extends NotificationTypeEnum> extends SendNotificationBaseParams<T> {
  companyId?: never;
  targetType: UserRoleEnum.BORROWER;
  transport: NotificationTransportEnum.WHATSAPP;
  phoneNumber: string;
}

interface SendNotificationEmailBorrowerParams<T extends NotificationTypeEnum> extends SendNotificationBaseParams<T> {
  companyId?: never;
  targetType: UserRoleEnum.BORROWER;
  transport: NotificationTransportEnum.EMAIL;
  recipientEmail: string;
}

interface SendNotificationAdminParams<T extends NotificationTypeEnum> extends SendNotificationBaseParams<T> {
  companyId?: never;
  targetType: UserRoleEnum.ADMIN | UserRoleEnum.CUSTOMER_SUPPORT;
  recipientEmail?: never;
  phoneNumber?: string;
  transport?: never;
}

async function getLenderNotificationSettings(notificationType: NotificationTypeEnum, companyId: string) {
  const settings = await prismaClient.companyNotificationSetting.findMany({
    where: {
      OR: [
        {
          emailNotificationsEnabled: true,
          emailNotificationTypes: { has: notificationType },
        },
        {
          webhookNotificationsEnabled: true,
          webhookNotificationTypes: { has: notificationType },
        },
        {
          telegramNotificationsEnabled: true,
          telegramNotificationTypes: { has: notificationType },
        },
      ],
      companyId,
    },
  });
  const webhookTarget = settings.find(
    (notif) =>
      notif.webhooks &&
      notif.webhooks.length > 0 &&
      notif.webhookNotificationsEnabled &&
      notif.webhookNotificationTypes.includes(notificationType),
  );
  const emailTarget = settings.find(
    (notif) =>
      notif.emailNotificationsEnabled &&
      notif.emails.length > 0 &&
      notif.emailNotificationTypes.includes(notificationType),
  );
  const telegramTarget = settings.find(
    (notif) =>
      notif.telegramNotificationsEnabled &&
      notif.telegramChatIds.length > 0 &&
      notif.telegramNotificationTypes.includes(notificationType),
  );
  return {
    webhook: webhookTarget?.webhooks[0],
    email: emailTarget?.emails[0],
    telegram: telegramTarget?.telegramChatIds[0],
  };
}

export const sendNotification = async <T extends NotificationTypeEnum>(
  params:
    | SendNotificationLenderParams<T>
    | SendNotificationEmailBorrowerParams<T>
    | SendNotificationWhatsappBorrowerParams<T>
    | SendNotificationAdminParams<T>,
  jobOptions?: PgBoss.SendOptions,
) => {
  const uniqueKeyFn =
    params.notificationType in generateUniqueKey
      ? generateUniqueKey[params.notificationType as keyof typeof generateUniqueKey]
      : undefined;
  const uniqueId = uniqueKeyFn
    ? uniqueKeyFn({
        ...params.payload,
        role: params.targetType,
        companyId: params.companyId,
        phoneNumber: params.phoneNumber,
      } as any)
    : randomUUID();
  const createNotifPayload: Prisma.NotificationCreateArgs = {
    data: {
      payload: params.payload as any,
      notificationType: params.notificationType,
      status: NotificationStatusEnum.PENDING,
      targetType: params.targetType,
      companyId: params.companyId,
      loanRequestId: params.payload.loanRequestId,
      phoneNumber: params.phoneNumber,
      uniqueKey: uniqueId,
      transport: params.transport || NotificationTransportEnum.EMAIL,
      batchId:
        params.notificationType in generateBatchId
          ? //Okay to cast to any. We already check when calling this function.
            generateBatchId[params.notificationType as keyof typeof generateBatchId](params.payload as any)
          : undefined,
      recipientEmail: hasCustomerSupportPermissions(params.targetType)
        ? CONFIG.ADMIN_NOTIFICATION_EMAIL
        : params.targetType === UserRoleEnum.BORROWER
          ? params.recipientEmail
          : undefined,
    },
  };
  try {
    if (params.targetType === UserRoleEnum.LENDER) {
      const lenderSettings = await getLenderNotificationSettings(params.notificationType, params.companyId);
      if (lenderSettings.webhook) {
        const webhookNotif = await prismaClient.notification.create({
          data: {
            ...createNotifPayload.data,
            transport: NotificationTransportEnum.WEBHOOK,
            webhookUrl: lenderSettings.webhook,
          },
        });
        createJob(JobsEnum.WEBHOOK_NOTIFICATION, { notificationId: webhookNotif.id }, jobOptions);
      }
      if (lenderSettings.email) {
        const emailNotif = await prismaClient.notification.create({
          data: {
            ...createNotifPayload.data,
            transport: NotificationTransportEnum.EMAIL,
            recipientEmail: lenderSettings.email,
          },
        });
        createJob(JobsEnum.EMAIL_NOTIFICATION, { notificationId: emailNotif.id }, jobOptions);
      }
      if (lenderSettings.telegram) {
        const telegramNotif = await prismaClient.notification.create({
          data: {
            ...createNotifPayload.data,
            transport: NotificationTransportEnum.TELEGRAM,
            recipientTelegramChatId: lenderSettings.telegram,
          },
        });
        await createJob(JobsEnum.TELEGRAM_NOTIFICATION, { notificationId: telegramNotif.id }, jobOptions);
      }
    } else {
      const newNotif = await prismaClient.notification.create({
        data: createNotifPayload.data,
      });
      createJob(
        newNotif.transport === NotificationTransportEnum.EMAIL
          ? JobsEnum.EMAIL_NOTIFICATION
          : JobsEnum.WHATSAPP_NOTIFICATION,
        { notificationId: newNotif.id },
        jobOptions,
      );
    }
  } catch (err) {
    //No need to throw here. It just means this notification has been already created.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return;
    } else {
      throw err;
    }
  }
};
