import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import {
  assignCustomerSupport,
  createGuarantor,
  deleteGuarantor,
  deleteMyLoanRequest,
  getActivityLogsByLoanRequestId,
  getClosedLoanRequests,
  getLoanRequestById,
  getLoanRequests,
  getLoanResponsesByLoanRequestId,
  getMyLoanRequest,
  getPartnerOffers,
  restoreMyLoanRequest,
} from '../../controllers/v1/loanRequest.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const loanRequestRouter = Router();

loanRequestRouter.delete('/', verifyAuth(), deleteMyLoanRequest);
loanRequestRouter.get('/me', verifyAuth(), getMyLoanRequest);
loanRequestRouter.post('/:loanRequestId/restore', verifyAuth(), restoreMyLoanRequest);

loanRequestRouter.get('/partner-offers', verifyAuth(), getPartnerOffers);
loanRequestRouter.get(
  '',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getLoanRequests,
);
loanRequestRouter.get(
  '/closed',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getClosedLoanRequests,
);
loanRequestRouter.get(
  '/:id',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getLoanRequestById,
);

// Guarantor
loanRequestRouter.post(
  '/guarantor',
  verifyAuth([UserRoleEnum.BORROWER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  createGuarantor,
);
loanRequestRouter.delete(
  '/guarantor',
  verifyAuth([UserRoleEnum.BORROWER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  deleteGuarantor,
);

loanRequestRouter.get(
  '/:id/activity-logs',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getActivityLogsByLoanRequestId,
);

loanRequestRouter.get(
  '/:id/loan-responses',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getLoanResponsesByLoanRequestId,
);

loanRequestRouter.put('/:id/assign-customer-support', verifyAuth([UserRoleEnum.ADMIN]), assignCustomerSupport);
