import { ApiResponse, PaginatedApiResponse, ResponseMetadata } from '@roshi/shared';
import { Response } from 'express';

export function successResponse<T>(res: Response, data: T, message?: string): ApiResponse<T>;
export function successResponse<T>(
  res: Response,
  data: T[],
  message: string,
  meta: ResponseMetadata,
): PaginatedApiResponse<T>;
export function successResponse<T>(res: Response, data: T, message = 'OK', meta?: ResponseMetadata) {
  const result = {
    status: 200,
    message,
    data: data,
    meta: meta ?? undefined,
  };
  res.status(200).json(result);
  return result;
}

/* Example
{
  "status": 200,
  "message": "OK",
  "data": {
    "id": 123,
    "name": "Example Resource"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 50
  }
}
*/
