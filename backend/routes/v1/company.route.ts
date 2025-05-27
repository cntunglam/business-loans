import { UserRoleEnum } from '@roshi/shared';
import { Router } from 'express';
import {
  getCompanyLeadSettings,
  getCompanyNotificationSettings,
  getCompanyStores,
  getOfferPreferenceSettings,
  updateCompanyLeadSettings,
  updateNotificationSettings,
  updateOfferPreferenceSettings,
} from '../../controllers/v1/company.controller';
import { verifyAuth } from '../../utils/verifyAuth';

export const companyRouter = Router();

companyRouter.get('/:companyId/store', verifyAuth(), getCompanyStores);
companyRouter.put(
  '/notification',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  updateNotificationSettings,
);
companyRouter.get(
  '/notification',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getCompanyNotificationSettings,
);
companyRouter.put(
  '/lead-settings',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  updateCompanyLeadSettings,
);
companyRouter.get(
  '/lead-settings',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getCompanyLeadSettings,
);
companyRouter.get(
  '/preference-settings',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  getOfferPreferenceSettings,
);
companyRouter.put(
  '/preference-settings',
  verifyAuth([UserRoleEnum.LENDER, UserRoleEnum.ADMIN, UserRoleEnum.CUSTOMER_SUPPORT]),
  updateOfferPreferenceSettings,
);
