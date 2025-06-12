import { ERROR_KEYS, hasCustomerSupportPermissions, isAdmin, JwtPayload, UserRoleEnum } from '@roshi/shared';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prismaClient } from '../clients/prismaClient';
import { CONFIG } from '../config';
import { getShortUrlByCode, isPathAllowed } from '../services/shortUrl.service';
import { errorResponse } from './errorResponse';
import { isUUIDv4 } from './utils';

export const verifyAuth =
  (allowedRoles?: UserRoleEnum[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First try token-based authentication
      const token = req.header('Authorization')?.split(' ')[1];

      if (token) {
        const isAPIToken = isUUIDv4(token);
        if (isAPIToken) {
          const apiToken = await prismaClient.aPIToken.findUnique({
            where: { token: token },
            include: { user: true },
          });

          if (!apiToken) return errorResponse(res, 401, ERROR_KEYS.UNAUTHORIZED);
          req.user = {
            email: apiToken.user.email,
            role: apiToken.user.role,
            sub: apiToken.user.id,
            companyId: apiToken.user.companyId,
          };
        } else {
          const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
          if (allowedRoles && !allowedRoles.includes(decoded.role as UserRoleEnum)) {
            return errorResponse(res, 403, ERROR_KEYS.FORBIDDEN);
          }
          req.user = decoded;
          req.hasAdminPermissions = isAdmin(req.user.role);
          req.hasCustomerSupportPermissions = hasCustomerSupportPermissions(req.user.role);
        }
        return next();
      }

      // If no token, try short URL authentication
      const shortUrlCode = req.header('X-Short-Url');
      if (!shortUrlCode) {
        return errorResponse(res, 401, ERROR_KEYS.UNAUTHORIZED);
      }

      const shortUrl = await getShortUrlByCode(shortUrlCode);
      if (!shortUrl || shortUrl.type !== 'API_ACCESS' || !shortUrl.user) {
        return errorResponse(res, 401, ERROR_KEYS.UNAUTHORIZED);
      }

      // Check if the current path is allowed
      const currentPath = req.originalUrl;
      const isAllowed = isPathAllowed(shortUrl, currentPath!);

      if (!isAllowed) {
        return errorResponse(res, 403, ERROR_KEYS.FORBIDDEN);
      }

      if (allowedRoles && !allowedRoles.includes(shortUrl.user.role as UserRoleEnum))
        return errorResponse(res, 403, ERROR_KEYS.FORBIDDEN);

      // Add shortUrl info to request
      req.user = {
        companyId: shortUrl.user.companyId,
        sub: shortUrl.user.id,
        email: shortUrl.user.email,
        role: shortUrl.user.role,
      };
      req.hasAdminPermissions = isAdmin(req.user.role);
      req.hasCustomerSupportPermissions = hasCustomerSupportPermissions(req.user.role);
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return errorResponse(res, 401, ERROR_KEYS.UNAUTHORIZED);
      }
      return errorResponse(res, 500, ERROR_KEYS.INTERNAL_ERROR);
    }
  };

//Allows adding a user to the request object for anonymous routes
export const anonymousRoute = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token) {
    const isAPIToken = isUUIDv4(token);
    if (isAPIToken) {
      const apiToken = await prismaClient.aPIToken.findUnique({
        where: { token: token },
        include: { user: true },
      });

      if (!apiToken) return errorResponse(res, 401, ERROR_KEYS.UNAUTHORIZED);
      req.user = {
        email: apiToken.user.email,
        role: apiToken.user.role,
        sub: apiToken.user.id,
        companyId: apiToken.user.companyId,
      };
    } else {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
      req.user = decoded;
    }
  }
  return next();
};
