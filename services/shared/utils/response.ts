import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/common';
import { logger } from './logger';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Internal Server Error',
    errors?: string[],
    statusCode: number = 500,
    data?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      data,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId
    };

    // Log error for monitoring
    logger.error('API Error Response', undefined, {
      statusCode,
      message,
      errors,
      requestId: res.locals.requestId,
      userId: res.locals.user?.id
    });

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId
    };

    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message: string = 'Bad Request', errors?: string[]): Response {
    return this.error(res, message, errors, 400);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, undefined, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, undefined, 403);
  }

  static notFound(res: Response, message: string = 'Not Found'): Response {
    return this.error(res, message, undefined, 404);
  }

  static conflict(res: Response, message: string = 'Conflict'): Response {
    return this.error(res, message, undefined, 409);
  }

  static tooManyRequests(
    res: Response,
    message: string = 'Too Many Requests',
    retryAfter?: number
  ): Response {
    if (retryAfter) {
      res.set('Retry-After', retryAfter.toString());
    }
    return this.error(res, message, undefined, 429);
  }

  static validationError(res: Response, errors: string[]): Response {
    return this.error(res, 'Validation Error', errors, 422);
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

// Middleware to add request ID
export const addRequestId = (req: any, res: any, next: any): void => {
  res.locals.requestId = req.headers['x-request-id'] ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
};

export default ResponseUtil;