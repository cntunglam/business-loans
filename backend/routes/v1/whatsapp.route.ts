import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import {
  getAllConversations,
  getGeneratedReply,
  getWhatsappGroup,
  getWhatsappUser,
  sendWhatsappMessage,
} from '../../controllers/v1/whatsapp.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const whatsppRouter = Router();

whatsppRouter.get('/user/:phone', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getWhatsappUser);
whatsppRouter.get('/group/:groupId', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), getWhatsappGroup);
whatsppRouter.post('/message', verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]), sendWhatsappMessage);
whatsppRouter.post(
  '/generate-reply',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getGeneratedReply,
);
whatsppRouter.get(
  '/conversations',
  verifyAuth([UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getAllConversations,
);
