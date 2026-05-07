import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Typed API response helpers.
 *
 * Every endpoint returns one of these shapes so the frontend
 * can rely on a single discriminated-union contract.
 */

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
  requestId?: string;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
  requestId?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  requestId?: string,
): SuccessResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
  ...(requestId && { requestId }),
});

export const createPaginatedResponse = <T>(
  items: T[],
  pagination: PaginationMeta,
  requestId?: string,
): SuccessResponse<PaginatedResult<T>> => ({
  success: true,
  data: { items, pagination },
  ...(requestId && { requestId }),
});

export const createErrorResponse = (
  code: string,
  message: string,
  requestId?: string,
): ErrorResponse => ({
  success: false,
  error: { code, message },
  ...(requestId && { requestId }),
});

export const sendSuccess = <T>(
  reply: FastifyReply,
  request: FastifyRequest,
  data: T,
  message?: string,
  statusCode = 200,
) =>
  reply
    .code(statusCode)
    .send(createSuccessResponse(data, message, request.requestId));

export const sendPaginated = <T>(
  reply: FastifyReply,
  request: FastifyRequest,
  items: T[],
  pagination: PaginationMeta,
  statusCode = 200,
) =>
  reply
    .code(statusCode)
    .send(createPaginatedResponse(items, pagination, request.requestId));
