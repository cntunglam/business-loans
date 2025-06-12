import { ERROR_KEYS, LogLevel, LogSource, Prisma } from '@roshi/shared';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { CONFIG } from '../config';
import { errorResponse } from './errorResponse';
import logger from './logger';
import { RoshiError } from './roshiError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (CONFIG.NODE_ENV === 'development') {
    console.error(err);
  }
  if (err instanceof RoshiError) {
    return errorResponse(res, 500, err.code);
  }
  if (err instanceof ZodError) {
    //managed error
    logger({
      error: err,
      source: LogSource.API,
      level: LogLevel.WARN,
      req,
      errorType: ERROR_KEYS.VALIDATION_ERROR,
    });
    return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR, err.issues);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === 'P2018' || err.code === 'P2025')) {
    //managed error
    logger({
      error: err,
      source: LogSource.API,
      level: LogLevel.WARN,
      req,
      errorType: ERROR_KEYS.NOT_FOUND,
    });
    return errorResponse(res, 404, ERROR_KEYS.NOT_FOUND);
  } else {
    //Unmanaged error
    logger({
      error: err,
      source: LogSource.API,
      level: LogLevel.ERROR,
      req,
      errorType: ERROR_KEYS.INTERNAL_ERROR,
    });
    return errorResponse(res, 500, ERROR_KEYS.INTERNAL_ERROR); // Respond with a 500 status code and a generic error message
  }
};

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
