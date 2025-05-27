import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import { getLogs } from '../../controllers/v1/logger.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const loggerRouter = Router();

loggerRouter.get('/', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getLogs);
