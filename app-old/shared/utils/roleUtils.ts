import { UserRoleEnum } from "../models/databaseEnums";

export const hasCustomerSupportPermissions = (role?: string) => {
  return role === UserRoleEnum.CUSTOMER_SUPPORT || role === UserRoleEnum.ADMIN;
};

export const isAdmin = (role?: string) => {
  return role === UserRoleEnum.ADMIN;
};
