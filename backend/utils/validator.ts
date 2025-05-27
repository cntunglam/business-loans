import { ERROR_KEYS } from '@roshi/shared';
import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { errorResponse } from './errorResponse';

export const validate = (schema: ZodSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return errorResponse(res, 400, ERROR_KEYS.VALIDATION_ERROR, e.issues);
      }
    }
  };
};
