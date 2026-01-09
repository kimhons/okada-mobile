import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error values
  error.statusCode = error.statusCode || 500;
  error.isOperational = error.isOperational || false;

  // Log error
  logger.error('Unhandled error', error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.method !== 'GET' ? '[REDACTED]' : undefined,
    params: req.params,
    query: req.query
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    ResponseUtil.validationError(res, [error.message]);
    return;
  }

  if (error.name === 'CastError') {
    ResponseUtil.badRequest(res, 'Invalid data format');
    return;
  }

  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if (error.message.includes('duplicate key')) {
      ResponseUtil.conflict(res, 'Resource already exists');
      return;
    }
  }

  if (error.name === 'JsonWebTokenError') {
    ResponseUtil.unauthorized(res, 'Invalid token');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    ResponseUtil.unauthorized(res, 'Token expired');
    return;
  }

  // PostgreSQL errors
  if (error.message.includes('duplicate key value violates unique constraint')) {
    ResponseUtil.conflict(res, 'Resource already exists');
    return;
  }

  if (error.message.includes('violates foreign key constraint')) {
    ResponseUtil.badRequest(res, 'Invalid reference');
    return;
  }

  // Default error response
  if (process.env.NODE_ENV === 'development') {
    ResponseUtil.error(res, error.message, [error.stack || ''], error.statusCode);
  } else {
    // Production - don't leak error details
    if (error.isOperational) {
      ResponseUtil.error(res, error.message, undefined, error.statusCode);
    } else {
      ResponseUtil.error(res, 'Something went wrong!', undefined, 500);
    }
  }
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection', new Error(reason), {
      reason: reason?.toString(),
      promise: promise.toString()
    });

    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', error);

    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Handle SIGTERM and SIGINT
 */
export const handleGracefulShutdown = (server: any): void => {
  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(() => {
      logger.info('HTTP server closed');

      // Close database connections
      import('../config/database').then(({ closeAllConnections }) => {
        closeAllConnections()
          .then(() => {
            logger.info('All database connections closed');
            process.exit(0);
          })
          .catch((error) => {
            logger.error('Error closing database connections', error);
            process.exit(1);
          });
      });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error: AppError = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.isOperational = true;

  next(error);
};

/**
 * Request timeout handler
 */
export const timeoutHandler = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', {
          url: req.originalUrl,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timeoutMs
        });

        ResponseUtil.error(res, 'Request timeout', undefined, 408);
      }
    }, timeoutMs);

    // Clear timeout if response is sent
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};