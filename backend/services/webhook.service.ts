import { NotificationTypeEnum } from '@roshi/shared';
import { getAppointmentForWebhook } from './appointment.service';
import { formatLoanRequestForLender, getLoanRequest } from './loanRequest.service';
import { getLoanResponse } from './loanResponse.service';
import { NotifPayloadParams } from './notification.service';

export const generateWebhookPayload = async <T extends NotificationTypeEnum>(
  notificationType: T,
  params: { loanRequestId: string } & NotifPayloadParams<T>,
) => {
  switch (notificationType) {
    case NotificationTypeEnum.APPOINTMENT_SCHEDULED: {
      const typedParams = params as NotifPayloadParams<NotificationTypeEnum.APPOINTMENT_SCHEDULED>;
      return getAppointmentForWebhook(typedParams.appointmentId);
    }
    case NotificationTypeEnum.APPOINTMENT_CANCELED: {
      const typedParams = params as NotifPayloadParams<NotificationTypeEnum.APPOINTMENT_CANCELED>;
      return {
        appointmentId: typedParams.appointmentId,
        loanResponseId: typedParams.loanResponseId,
        loanRequestId: params.loanRequestId,
      };
    }
    case NotificationTypeEnum.OFFER_SELECTED: {
      const typedParams = params as NotifPayloadParams<NotificationTypeEnum.OFFER_SELECTED>;
      const loanRequest = await getLoanRequest(params.loanRequestId);
      const loanResponse = await getLoanResponse(typedParams.loanResponseId);
      const formattedLoanRequest = formatLoanRequestForLender(loanRequest);
      return {
        loanResponseId: typedParams.loanResponseId,
        loanResponse: loanResponse,
        loanRequestId: params.loanRequestId,
        loanRequest: formattedLoanRequest,
        userId: loanRequest.user?.id,
        user: {
          id: loanRequest.user?.id,
          name: loanRequest.user?.name,
          phone: loanRequest.user?.phone,
          nric: loanRequest.user?.nric,
        },
      };
    }
  }
};
