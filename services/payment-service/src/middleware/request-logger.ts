/**
 * Request Logger Middleware
 * Adds request logging and correlation IDs
 */

import { Request, Response, NextFunction } from 'express';
import { generateCorrelationId } from '@/utils/helpers';
import { logger } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate correlation ID if not present
  const correlationId = req.get('X-Request-ID') || generateCorrelationId();

  // Set correlation ID header
  req.headers['x-request-id'] = correlationId;
  res.setHeader('X-Request-ID', correlationId);

  // Log request start
  const startTime = Date.now();

  logger.info('Request started', {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length')
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): any {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};