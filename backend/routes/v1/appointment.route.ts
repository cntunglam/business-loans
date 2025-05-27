import { Router } from 'express';

import { UserRoleEnum } from '@roshi/shared';
import {
  createAppointment,
  deleteAppointmentHandler,
  getWeeklyAppointmentsHandler,
} from '../../controllers/v1/appointment.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const appointmentRouter = Router();

// Appointment routes
appointmentRouter.post('/', verifyAuth(), createAppointment);
appointmentRouter.delete('/:id', verifyAuth(), deleteAppointmentHandler);
appointmentRouter.get(
  '/scheduled-appointments',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getWeeklyAppointmentsHandler,
);
