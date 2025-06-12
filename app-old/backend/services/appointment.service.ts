import { formatWithoutTz } from '@roshi/shared';
import { prismaClient } from '../clients/prismaClient';

export const getAppointment = async (appointmentId: string) => {
  const appointment = await prismaClient.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: {
      loanResponse: {
        include: {
          lender: { select: { name: true, id: true, salesPhoneNumber: true } },
          loanRequest: { include: { user: { select: { name: true, id: true, email: true } } } },
        },
      },
      openingHours: { include: { store: true } },
    },
  });

  return appointment;
};

export const getAppointmentForWebhook = async (appointmentId: string) => {
  const appointment = await getAppointment(appointmentId);
  return {
    appointmentId: appointment.id,
    loanResponseId: appointment.loanResponseId,
    loanRequestId: appointment.loanResponse?.loanRequestId,
    appointment: {
      scheduledTime: formatWithoutTz(appointment.scheduledTime!, 'yyyy-MM-dd HH:mm'),
      store: {
        name: appointment.openingHours?.store?.name,
        address: appointment.openingHours?.store?.address,
        id: appointment.openingHours?.store?.id,
      },
    },
  };
};
