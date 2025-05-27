import { ERROR_KEYS } from '@roshi/shared';
import { Response } from 'express';
import { HTTP_STATUS_CODE, HTTP_STATUS_CODES } from '../data/httpStatusCodes';

// errorResponse.ts
export const errorResponse = (res: Response, status: HTTP_STATUS_CODE, errorCode: ERROR_KEYS, fields = {}) => {
  const result = {
    status,
    message: HTTP_STATUS_CODES[status],
    error: {
      code: errorCode,
      fields,
    },
    data: null,
  };
  res.status(status).json(result);
  return result;
};

/* Example
{
  "status": 400,
  "message": "Bad Request",
  "error": {
    "code": "INVALID_INPUT",
    "fields": {
      "username": "Username is required.",
      "email": "Invalid email format."
    }
  }
}
*/
