import {
  ERROR_KEYS,
  formatWithoutTz,
  LoanRequestStatusEnum,
  MessageTemplatesEnum,
  NotificationTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import PgBoss from 'pg-boss';
import { CONFIG } from '../../config';
import { generateMessage } from '../../data/messageTemplates/messageTemplates';
import { RoshiError } from '../../utils/roshiError';
import { getAppointment } from '../appointment.service';
import { getLoanRequest } from '../loanRequest.service';
import { NotifPayloadParams } from '../notification.service';
import { TelegramButton } from '../telegram.service';

type Response = Promise<{
  reason?: string;
  retry?: PgBoss.SendOptions['startAfter'];
  content?: string;
  buttons?: TelegramButton[];
}>;

export const generateTgNotificationContent = async <T extends NotificationTypeEnum>(
  notificationType: NotificationTypeEnum,
  params: { loanRequestId: string; targetUser: UserRoleEnum; batchId?: string | null } & NotifPayloadParams<T>,
): Response => {
  const loanRequest = await getLoanRequest(params.loanRequestId);
  if (!loanRequest || loanRequest.status === LoanRequestStatusEnum.DELETED) return {};

  switch (notificationType) {
    case NotificationTypeEnum.APPOINTMENT_OUTCOME_REMINDER:
    case NotificationTypeEnum.APPOINTMENT_SCHEDULED: {
      const typedParams = params as NotifPayloadParams<NotificationTypeEnum.APPOINTMENT_SCHEDULED>;
      return await handleAppointmentNotification(notificationType, typedParams.appointmentId);
    }
    case NotificationTypeEnum.APPOINTMENT_CANCELED: {
      return {
        content: generateMessage(MessageTemplatesEnum.LENDER_APPOINTMENT_CANCELED, {
          borrowerName: loanRequest.user.name || '-',
        }),
      };
    }
    default:
      throw new RoshiError(ERROR_KEYS.TELEGRAM_NOTIFICATION_NOT_SUPPORTED, { fields: { notificationType } });
  }
};

export const handleAppointmentNotification = async (
  notificationType: NotificationTypeEnum,
  appointmentId: string,
): Response => {
  const appointment = await getAppointment(appointmentId);
  if (!appointment || !appointment.scheduledTime || !appointment.openingHours?.store || appointment.cancelledAt)
    throw new RoshiError(ERROR_KEYS.NOT_FOUND, {
      message: 'Missing appointment data',
      fields: { appointment: JSON.stringify(appointment) },
    });

  const date = formatWithoutTz(appointment.scheduledTime, 'd MMMM');
  const time = formatWithoutTz(appointment.scheduledTime, 'HH:mm');
  if (notificationType === NotificationTypeEnum.APPOINTMENT_SCHEDULED) {
    return {
      buttons: [
        {
          text: 'View appointment',
          url: `${CONFIG.CLIENT_APP_URL}/lender/dashboard?tab=offer-accepted&modal=appointment&id=${appointment.loanResponse.loanRequestId}`,
        },
      ],
      content: generateMessage(MessageTemplatesEnum.LENDER_APPOINTMENT_SCHEDULED, {
        // Fallback to email if name is not available
        borrowerName: appointment.loanResponse.loanRequest.user.name || appointment.loanResponse.loanRequest.user.email,
        date,
        time,
        location: appointment.openingHours?.store.name,
      }),
    };
  }

  const deepLink = `/lender/dashboard?tab=offer-accepted&modal=close&id=${appointment.loanResponse.loanRequestId}`;
  const buttons = [
    {
      text: 'Confirm',
      url: CONFIG.CLIENT_APP_URL + deepLink,
    },
  ];
  return {
    buttons: buttons,
    content: generateMessage(MessageTemplatesEnum.LENDER_APPOINTMENT_OUTCOME_REMINDER, {
      borrowerName: appointment.loanResponse.loanRequest.user.name || appointment.loanResponse.loanRequest.user.email,
      date: date,
      time: time,
    }),
  };
};
