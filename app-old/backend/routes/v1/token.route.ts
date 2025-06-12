import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import { deleteAPIToken, generateAPIToken, getMyAPITokens } from '../../controllers/v1/token.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const tokenRouter = Router();

tokenRouter.post(
  '/',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  generateAPIToken,
);
tokenRouter.get(
  '/me',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getMyAPITokens,
);
tokenRouter.delete(
  '/:id',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  deleteAPIToken,
);

// tokenRouter.post('/refresh', refreshToken);
// tokenRouter.delete('/:userId', verifyAuth([UserRoleEnum.ADMIN]), deleteToken);
