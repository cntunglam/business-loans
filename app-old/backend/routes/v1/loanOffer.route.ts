import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import {
  closeLoanOffer,
  createLoanOfferHandler,
  deleteLoanOffer,
  removeOutcomeHandler,
} from '../../controllers/v1/loanOffer.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const loanOfferRouter = Router();

loanOfferRouter.post(
  '/',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  createLoanOfferHandler,
);

//Added this route for EzLoan because they can't have dynamic ID in URL. Serves same ourpose as /:id/close
loanOfferRouter.post(
  '/close',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  closeLoanOffer,
);

loanOfferRouter.post('/:id/close', verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN]), closeLoanOffer);

loanOfferRouter.delete(
  '/:id',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  deleteLoanOffer,
);
loanOfferRouter.put(
  '/:id/remove-outcome',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  removeOutcomeHandler,
);
