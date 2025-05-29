import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import {
  addCompany,
  addUser,
  convertToNormalLoanRequestHandler,
  createJobHandler,
  generateInvoicesForLastMonth,
  getAllAppointments,
  getAllClosedLeads,
  getAllLeads,
  getAllUsers,
  getCompanies,
  getLeadById,
  getTemplate,
  getUserByPhone,
  testEmail,
  updateCompany,
  updateLoanRequestAdmin,
  updateLoanResponseAdmin,
  updateMailchimp,
  updateUser,
} from '../../controllers/v1/admin.controller';
import { computeReapplyLoanRequests } from '../../services/re-apply.service';
import { verifyAuth } from '../../utils/verifyAuth';

export const adminRouter = Router();

adminRouter.get('/company', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getCompanies);
adminRouter.post('/company', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), addCompany);
adminRouter.put('/company/:id', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), updateCompany);
adminRouter.get('/user', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getAllUsers);
adminRouter.put('/user/:id', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), updateUser);
adminRouter.post('/user', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), addUser);
adminRouter.put(
  '/loan-request/:id',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  updateLoanRequestAdmin,
);
adminRouter.get('/appointment', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getAllAppointments);
adminRouter.post('/test', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), testEmail);
adminRouter.put(
  '/loan-response/:id',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  updateLoanResponseAdmin,
);
adminRouter.get('/leads', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getAllLeads);
adminRouter.get('/leads/:id', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getLeadById);
adminRouter.get('/user/:phone', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getUserByPhone);
adminRouter.post('/template', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getTemplate);
adminRouter.get('/closed', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getAllClosedLeads);
adminRouter.post('/job', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), createJobHandler);
adminRouter.post('/mailchimp-update', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), updateMailchimp);
adminRouter.put(
  '/loan-request/:id/convert-to-normal',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  convertToNormalLoanRequestHandler,
);

adminRouter.get('/generate-invoices', verifyAuth([UserRoleEnum.ADMIN]), generateInvoicesForLastMonth);

// Used for testing
adminRouter.get('/trigger-reapply', verifyAuth([UserRoleEnum.ADMIN]), () => computeReapplyLoanRequests());
