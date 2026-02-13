import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../models/common.types';

export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  statusCode: number = 500,
  details?: Record<string, unknown>
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return res.status(statusCode).json(response);
};

export const createdResponse = <T>(res: Response, data: T): Response => {
  return successResponse(res, data, 201);
};

export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

export const badRequestResponse = (
  res: Response,
  message: string,
  code: string = 'BAD_REQUEST',
  details?: Record<string, unknown>
): Response => {
  return errorResponse(res, message, code, 400, details);
};

export const unauthorizedResponse = (
  res: Response,
  message: string = 'Unauthorized',
  code: string = 'UNAUTHORIZED'
): Response => {
  return errorResponse(res, message, code, 401);
};

export const forbiddenResponse = (
  res: Response,
  message: string = 'Forbidden',
  code: string = 'FORBIDDEN'
): Response => {
  return errorResponse(res, message, code, 403);
};

export const notFoundResponse = (
  res: Response,
  message: string = 'Not Found',
  code: string = 'NOT_FOUND'
): Response => {
  return errorResponse(res, message, code, 404);
};

export const conflictResponse = (
  res: Response,
  message: string,
  code: string = 'CONFLICT'
): Response => {
  return errorResponse(res, message, code, 409);
};

export const validationErrorResponse = (
  res: Response,
  message: string,
  details: Record<string, unknown>
): Response => {
  return errorResponse(res, message, 'VALIDATION_ERROR', 422, details);
};
