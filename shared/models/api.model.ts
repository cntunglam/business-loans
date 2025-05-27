import { z } from "zod";
import { ERROR_KEYS } from "../data/errorKeys";

export interface ResponseMetadata {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  status: number;
  message: string;
  data: T[];
  meta: ResponseMetadata;
}

export interface ErrorResponse<T = {}> {
  status: number;
  message: string;
  error: {
    code: ERROR_KEYS;
    fields: T;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId: string | null;
  exp?: number;
}

export const numberFilterSchema = z.object({
  lt: z.coerce.number().optional(),
  lte: z.coerce.number().optional(),
  gt: z.coerce.number().optional(),
  gte: z.coerce.number().optional(),
});

export const dateFilterSchema = z.object({
  lt: z.string().date().optional(),
  lte: z.string().date().optional(),
  gt: z.string().date().optional(),
  gte: z.string().date().optional(),
});
