import { JwtPayload } from '@roshi/shared';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      hasAdminPermissions: boolean;
      hasCustomerSupportPermissions: boolean;
    }
  }
}
