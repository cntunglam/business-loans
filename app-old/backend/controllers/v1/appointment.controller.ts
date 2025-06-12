import {
  ActivityLogEnum,
  AppointmentStatusEnum,
  ERROR_KEYS,
  isHoliday,
  LoanRequestStatusEnum,
  NotificationTransportEnum,
  NotificationTypeEnum,
  SHARED_CONSTANTS,
  TargetTypeEnum,
  UserRoleEnum,
} from '@roshi/shared';
import {
  addMinutes,
  differenceInMinutes,
  differenceInSeconds,
  endOfWeek,
  getDay,
  isBefore,
  startOfWeek,
  subHours,
} from 'date-fns';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prismaClient } from '../../clients/prismaClient';
import { CONFIG } from '../../config';
import { createActivityLog } from '../../services/activityLog.service';
import { sendNotification } from '../../services/notification.service';
import { errorResponse } from '../../utils/errorResponse';
import { successResponse } from '../../utils/successResponse';
import { getCurrentTime } from '../../utils/utils';

export const createAppointmentSchema = z.object({
  loanResponseId: z.string(),
  scheduledTime: z.string().datetime(),
  storeId: z.string(),
});
export const createAppointment = async (req: Request, res: Response) => {
  const { loanResponseId, storeId, scheduledTime } = createAppointmentSchema.parse(req.body);

  const loanResponse = await prismaClient.loanResponse.findUniqueOrThrow({
    where: { id: loanResponseId },
    include: { lender: true, loanRequest: true },
  });
  const loanRequest = loanResponse.loanRequest;

  //Make sure appointment belongs to the user
  // if role = BORROWER,
  if (loanRequest.userId !== req.user?.sub && req.user?.role === UserRoleEnum.BORROWER)
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);
  // else if role = LENDER
  if (req.user?.role === UserRoleEnum.LENDER) {
    const lender = await prismaClient.company.findFirst({
      where: {
        loanResponses: { some: { id: req.body.loanResponseId, acceptedAt: { not: null } } },
        users: {
          some: { id: req.user!.sub },
        },
      },
      include: { users: true },
    });
    if (!lender) {
      return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);
    }
  }

  if (loanRequest.status === LoanRequestStatusEnum.DELETED) {
    return errorResponse(res, 400, ERROR_KEYS.LOAN_REQUEST_CLOSED);
  }

  const scheduledDateTime = new Date(scheduledTime);

  const currentTime = getCurrentTime();
  const minDate = addMinutes(currentTime, SHARED_CONSTANTS.APPOINTMENT_RESERVE_MINUTES);

  //Get all opening hours for the company
  const availableHours = await prismaClient.openingHours.findMany({
    where: { store: { id: storeId, companyId: loanResponse.lender.id } },
  });

  const selectedDay = availableHours.find((h) => h.dayOfWeek === getDay(scheduledDateTime));

  if (!selectedDay) return errorResponse(res, 400, ERROR_KEYS.INVALID_DATE);

  //Make sure selected hour is within the opening hours and is not full
  const [openHour, openMinute] = selectedDay.openHour.split(':').map(Number);
  const [closeHour, closeMinute] = selectedDay.closeHour.split(':').map(Number);
  const selectedHour = scheduledDateTime.getUTCHours();
  const selectedMinute = scheduledDateTime.getUTCMinutes();
  const isAfterOpen = selectedHour >= openHour || (selectedHour === openHour && selectedMinute >= openMinute);
  const isBeforeClose = selectedHour < closeHour || (selectedHour === closeHour && selectedMinute < closeMinute);

  if (req.user?.role === UserRoleEnum.BORROWER) {
    if (isBefore(scheduledDateTime, minDate)) return errorResponse(res, 400, ERROR_KEYS.APPOINTMENT_TOO_SOON);
    if (isHoliday(scheduledDateTime)) return errorResponse(res, 400, ERROR_KEYS.SELECTED_DATE_HOLIDAY);
    if (!isAfterOpen || !isBeforeClose) return errorResponse(res, 400, ERROR_KEYS.INVALID_DATE);
  }

  const existingAppointment = await prismaClient.appointment.findUnique({
    where: {
      loanResponseId: loanResponse.id,
    },
  });

  const appointment = await prismaClient.$transaction(async (tx) => {
    if (existingAppointment) {
      await tx.appointment.delete({
        where: {
          loanResponseId: loanResponse.id,
          // Must be a cancelled appointment first. To avoid accidental override
          cancelledAt: {
            not: null,
          },
        },
      });
    }

    const res = await tx.appointment.create({
      data: { openingHoursId: selectedDay.id, scheduledTime, loanResponseId },
      include: {
        loanResponse: {
          include: { loanRequest: { include: { user: true } }, lender: { select: { name: true, id: true } } },
        },
      },
    });

    await tx.loanResponse.update({
      where: { id: loanResponseId },
      data: {
        acceptedAt: new Date(),
      },
    });

    return res;
  });

  // send notification to borrower
  if (appointment.loanResponse.loanRequest.user?.phone) {
    sendNotification(
      {
        notificationType: NotificationTypeEnum.APPOINTMENT_SCHEDULED,
        targetType: UserRoleEnum.BORROWER,
        phoneNumber: appointment.loanResponse.loanRequest.user?.phone,
        payload: {
          appointmentId: appointment.id,
          loanRequestId: appointment.loanResponse.loanRequestId,
        },
        transport: NotificationTransportEnum.WHATSAPP,
        //Send after 1 minutes
      },
      { startAfter: 60 * CONFIG.NOTIFICATION_DELAY_MINUTES },
    );

    const diff = differenceInSeconds(
      subHours(scheduledDateTime, CONFIG.APPOINTMENT_REMINDER_HOURS_BEFORE),
      currentTime,
    );

    //Check if it's more than 2 hours before
    if (diff > 2 * 60 * 60) {
      sendNotification(
        {
          phoneNumber: appointment.loanResponse.loanRequest.user?.phone,
          notificationType: NotificationTypeEnum.APPOINTMENT_REMINDER,
          targetType: UserRoleEnum.BORROWER,
          payload: {
            appointmentId: appointment.id,
            loanRequestId: appointment.loanResponse.loanRequestId,
          },
          transport: NotificationTransportEnum.WHATSAPP,
        },
        { startAfter: diff },
      );
    }
  }

  if (req.user?.role !== UserRoleEnum.LENDER) {
    // We send both offer selected and appointment notification here since we removed the offer accepted notification
    sendNotification(
      {
        notificationType: NotificationTypeEnum.OFFER_SELECTED,
        targetType: UserRoleEnum.LENDER,
        companyId: appointment.loanResponse.lenderId,
        payload: {
          loanResponseId: appointment.loanResponseId,
          loanRequestId: appointment.loanResponse.loanRequestId,
        },
      },
      { startAfter: 60 * CONFIG.NOTIFICATION_DELAY_MINUTES },
    );

    // AppointmentScheduled: 5min after customer made the appointment (current time + 5min)
    sendNotification(
      {
        notificationType: NotificationTypeEnum.APPOINTMENT_SCHEDULED,
        targetType: UserRoleEnum.LENDER,
        companyId: appointment.loanResponse.lenderId,
        payload: {
          appointmentId: appointment.id,
          loanRequestId: appointment.loanResponse.loanRequestId,
        },
      },
      { startAfter: 60 * CONFIG.APPOINTMENT_SCHEDULED_NOTIFICATION_DELAY_MINUTES },
    );
  }

  const outcomeReminderDelay = differenceInSeconds(
    addMinutes(scheduledDateTime, CONFIG.APPOINTMENT_OUTCOME_REMINDER_NOTIFICATION_DELAY_MINUTES),
    currentTime,
  );
  sendNotification(
    {
      notificationType: NotificationTypeEnum.APPOINTMENT_OUTCOME_REMINDER,
      targetType: UserRoleEnum.LENDER,
      companyId: appointment.loanResponse.lenderId,
      payload: {
        appointmentId: appointment.id,
        loanRequestId: appointment.loanResponse.loanRequestId,
      },
    },
    { startAfter: outcomeReminderDelay },
  );

  // create activity log - APPOINTMENT_SET
  createActivityLog({
    userId: req.user?.sub || '',
    loanRequestId: loanRequest.id || '',
    activityType: ActivityLogEnum.APPOINTMENT_SET,
    targetType: TargetTypeEnum.APPOINTMENT,
    targetId: appointment.loanResponse.id,
  });

  return successResponse(res, 'ok');
};

export const deleteAppointmentHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const found = await prismaClient.appointment.findFirstOrThrow({
    where: { id },
    include: {
      loanResponse: { include: { loanRequest: true } },
    },
  });

  if (found.loanResponse.loanRequest.userId !== req.user?.sub && !req.hasCustomerSupportPermissions)
    return errorResponse(res, 400, ERROR_KEYS.UNAUTHORIZED);

  if (!found) return errorResponse(res, 400, ERROR_KEYS.NOT_FOUND);
  if (found.cancelledAt) return errorResponse(res, 400, ERROR_KEYS.ALREADY_CANCELLED);

  //If a date is set, make sure it's not in the past
  if (found.scheduledTime) {
    const scheduledDateTime = new Date(found.scheduledTime);
    //Admin can still delete
    if (isBefore(scheduledDateTime, getCurrentTime()) && !req.hasCustomerSupportPermissions)
      return errorResponse(res, 400, ERROR_KEYS.INVALID_DATE);
  }

  const appointment = await prismaClient.appointment.update({
    where: { id },
    data: {
      status: getAppointmentCancelStatusByRole(req.user?.role),
      cancelledAt: new Date(),
    },
    include: {
      loanResponse: {
        include: { loanRequest: { include: { user: true } }, lender: { select: { name: true, id: true } } },
      },
    },
  });

  // create activity log - APPOINTMENT_CANCELED
  createActivityLog({
    userId: req.user?.sub || '',
    loanRequestId: appointment.loanResponse.loanRequestId || '',
    activityType: ActivityLogEnum.APPOINTMENT_CANCELED,
    targetType: TargetTypeEnum.APPOINTMENT,
    targetId: appointment.loanResponse.id,
  });

  // Only send notifications if appointment was created more than 3 minutes ago
  if (differenceInMinutes(new Date(), appointment.createdAt) > CONFIG.NOTIFICATION_DELAY_MINUTES) {
    if (req.user?.role !== UserRoleEnum.LENDER) {
      // AppointmentCancelled: 5min after customer cancelled appointment (current time + 5min)
      sendNotification(
        {
          notificationType: NotificationTypeEnum.APPOINTMENT_CANCELED,
          targetType: UserRoleEnum.LENDER,
          payload: {
            appointmentId: appointment.id,
            loanRequestId: appointment.loanResponse.loanRequestId,
            loanResponseId: appointment.loanResponse.id,
          },
          companyId: appointment.loanResponse.lenderId,
        },
        {
          startAfter: 60 * CONFIG.APPOINTMENT_CANCELLED_NOTIFICATION_DELAY_MINUTES,
        },
      );
    }

    if (appointment.loanResponse.loanRequest.user?.phone) {
      sendNotification({
        phoneNumber: appointment.loanResponse.loanRequest.user?.phone,
        notificationType: NotificationTypeEnum.APPOINTMENT_CANCELED,
        targetType: UserRoleEnum.BORROWER,
        payload: {
          appointmentId: appointment.id,
          loanRequestId: appointment.loanResponse.loanRequestId,
          loanResponseId: appointment.loanResponse.id,
        },
        transport: NotificationTransportEnum.WHATSAPP,
      });
    }
  }

  return successResponse(res, appointment);
};

export const getWeeklyAppointmentsHandler = async (req: Request, res: Response) => {
  const dateSchema = z.object({
    date: z.string().datetime(),
  });

  try {
    const { date } = dateSchema.parse(req.query);
    const targetDate = new Date(date);

    // Get start and end of week for the given date
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday = 1
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

    // If user is a lender, we need to filter by their company
    const company = await prismaClient.company.findFirstOrThrow({
      where: { users: { some: { id: req.user!.sub } } },
    });

    const companyFilter = {
      loanResponse: {
        lenderId: company.id,
      },
    };

    const appointments = await prismaClient.appointment.findMany({
      where: {
        cancelledAt: null,
        scheduledTime: {
          gte: weekStart,
          lte: weekEnd,
        },
        ...companyFilter,
      },
      include: {
        openingHours: {
          include: {
            store: true,
          },
        },
        loanResponse: {
          include: {
            loanRequest: {
              include: {
                user: true,
              },
            },
            lender: true,
          },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });
    // Transform appointments into simplified format organized by day of week
    const transformedAppointments = appointments.map((appointment) => ({
      scheduledTime: appointment.scheduledTime,
      userName: appointment.loanResponse.loanRequest.user.name,
    }));

    // Group appointments by day of week (1-7, Monday-Sunday)
    const appointmentsByDay = Array.from({ length: 7 }, (_, i) => {
      const dayIndex = (i + 1) % 7; // Shift index to start from Monday (1) to Sunday (0)
      const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      return {
        dayOfWeek: dayIndex,
        date: date.toISOString(),
        dayOfWeekLocale: new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
        }),
        appointments: transformedAppointments
          .filter((appt) => getDay(new Date(appt.scheduledTime!)) === dayIndex)
          .sort((a, b) => new Date(a.scheduledTime!).getTime() - new Date(b.scheduledTime!).getTime()),
      };
    });

    return successResponse(res, appointmentsByDay);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, ERROR_KEYS.BAD_REQUEST);
    }
    throw error;
  }
};

const getAppointmentCancelStatusByRole = (role?: string) => {
  if (role === UserRoleEnum.BORROWER) {
    return AppointmentStatusEnum.CANCELLED_BY_BORROWER;
  }
  return AppointmentStatusEnum.CANCELLED_BY_ADMIN;
};
