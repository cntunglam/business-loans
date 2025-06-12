import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import { getApplicantInfo } from '../../controllers/v1/applicantInfo.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const applicantInfoRouter = Router();

applicantInfoRouter.get(
  '/:id',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getApplicantInfo,
);
