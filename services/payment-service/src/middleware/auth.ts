/**
 * Authentication Middleware
 * JWT-based authentication for payment service endpoints
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger } from '@/utils/logger';

interface JWTPayload {
  userId: string;
  role: string;
  merchantId?: string;
  permissions: string[];
  exp: number;
  iat: number;
}

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authentication middleware
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token required'
        },
        meta: {
          timestamp: new Date(),
          requestId: req.get('X-Request-ID')
        }
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authorization token has expired'
        },
        meta: {
          timestamp: new Date(),
          requestId: req.get('X-Request-ID')
        }
      });
      return;
    }

    // Attach user info to request
    req.user = decoded;

    logger.debug('User authenticated', {
      userId: decoded.userId,
      role: decoded.role,
      merchantId: decoded.merchantId
    });

    next();
  } catch (error) {
    logger.error('Authentication failed:', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authorization token'
        },
        meta: {
          timestamp: new Date(),
          requestId: req.get('X-Request-ID')
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication error'
        },
        meta: {
          timestamp: new Date(),
          requestId: req.get('X-Request-ID')
        }
      });
    }
  }
};

/**
 * Admin role authorization middleware
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Admin role required'
      }
    });
    return;
  }

  next();
};

/**
 * Merchant role authorization middleware
 */
export const requireMerchant = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
    return;
  }

  if (!['admin', 'merchant'].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Merchant role or higher required'
      }
    });
    return;
  }

  next();
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Permission '${permission}' required`
        }
      });
      return;
    }

    next();
  };
};

export { AuthenticatedRequest };