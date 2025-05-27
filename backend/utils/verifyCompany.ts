import { ERROR_KEYS } from '@roshi/shared';
import { NextFunction, Request, Response } from 'express';
import { errorResponse } from './errorResponse';

//Must run after verifyToken
export const verifyCompany = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.params.companyId) return errorResponse(res, 401, ERROR_KEYS.COMPANY_NOT_FOUND);
  if (!req.user?.companyId) return errorResponse(res, 401, ERROR_KEYS.COMPANY_NOT_FOUND);
  if (req.params.companyId !== req.user.companyId) return errorResponse(res, 401, ERROR_KEYS.UNAUTHORIZED);
  next();
};
