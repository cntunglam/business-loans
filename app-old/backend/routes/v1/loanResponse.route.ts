import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import { contactBorrower, getLoanResponseByIds } from '../../controllers/v1/loanResponse.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const loanResponseRouter = Router();

loanResponseRouter.get('/ids', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getLoanResponseByIds);

loanResponseRouter.get(
  '/:id/contact-borrower',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  contactBorrower,
);
