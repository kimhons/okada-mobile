/**
 * Error Handler Middleware
 * Centralized error handling for payment service
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import {
  PaymentError,
  ValidationError,
  FraudError,
  ProviderError,
  NetworkError,
  TimeoutError
} from '@/types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.get('X-Request-ID')
  });

  // Handle specific error types
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        field: error.field
      },
      meta: {
        timestamp: new Date(),
        requestId: req.get('X-Request-ID')
      }
    });
    return;
  }

  if (error instanceof FraudError) {
    res.status(403).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        riskLevel: error.riskLevel,
        details: error.details
      },
      meta: {
        timestamp: new Date(),
        requestId: req.get('X-Request-ID')
      }
    });
    return;
  }

  if (error instanceof ProviderError) {
    res.status(502).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        provider: error.provider,
        providerCode: error.providerCode
      },
      meta: {
        timestamp: new Date(),
        requestId: req.get('X-Request-ID')
      }
    });
    return;
  }

  if (error instanceof NetworkError) {
    res.status(503).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      meta: {
        timestamp: new Date(),
        requestId: req.get('X-Request-ID')
      }
    });
    return;
  }

  if (error instanceof TimeoutError) {
    res.status(408).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      meta: {
        timestamp: new Date(),
        requestId: req.get('X-Request-ID')
      }
    });
    return;
  }

  if (error instanceof PaymentError) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      meta: {
        timestamp: new Date(),
        requestId: req.get('X-Request-ID')
      }
    });
    return;
  }

  // Handle specific HTTP errors
  if (error.name === 'SyntaxError' && 'body' in error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body'
      },
      meta: {
        timestamp: new Date(),
        requestId: req.get('X-Request-ID')
      }
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    },
    meta: {
      timestamp: new Date(),
      requestId: req.get('X-Request-ID')
    }
  });
};