import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../shared/types/auth';
import { JWTService } from '../services/JWTService';
import { UserModel } from '../models/User';
import { ResponseUtil } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        jti: string;
      };
    }
  }
}

export interface AuthOptions {
  required?: boolean;
  roles?: UserRole[];
  permissions?: string[];
}

/**
 * Authentication middleware that validates JWT tokens
 */
export const authenticate = (options: AuthOptions = { required: true }) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTService.extractTokenFromHeader(authHeader || '');

      if (!token) {
        if (options.required) {
          ResponseUtil.unauthorized(res, 'Access token is required');
          return;
        }
        return next();
      }

      // Validate the token
      const validation = await JWTService.validateAccessToken(token);

      if (!validation.valid) {
        if (validation.expired) {
          ResponseUtil.unauthorized(res, 'Access token has expired');
        } else {
          ResponseUtil.unauthorized(res, validation.error || 'Invalid access token');
        }
        return;
      }

      const payload = validation.payload!;

      // Verify user still exists and is active
      const user = await UserModel.findById(payload.sub);
      if (!user) {
        ResponseUtil.unauthorized(res, 'User not found');
        return;
      }

      if (user.status !== 'active') {
        ResponseUtil.unauthorized(res, 'Account is not active');
        return;
      }

      // Check role-based access
      if (options.roles && !options.roles.includes(user.role)) {
        ResponseUtil.forbidden(res, 'Insufficient permissions');
        return;
      }

      // Set user in request context
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role as UserRole,
        jti: payload.jti
      };

      // Set user context for logging
      res.locals.user = req.user;

      logger.info('User authenticated', {
        userId: req.user.id,
        role: req.user.role,
        endpoint: req.path,
        method: req.method,
        jti: req.user.jti
      });

      next();
    } catch (error) {
      logger.error('Authentication middleware error', error as Error, {
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      ResponseUtil.error(res, 'Authentication failed', undefined, 500);
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.security('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path,
        method: req.method,
        ip: req.ip
      });

      ResponseUtil.forbidden(res, 'Insufficient permissions for this resource');
      return;
    }

    next();
  };
};

/**
 * Admin-only access middleware
 */
export const requireAdmin = authorize([UserRole.ADMIN]);

/**
 * Customer access middleware
 */
export const requireCustomer = authorize([UserRole.CUSTOMER, UserRole.ADMIN]);

/**
 * Rider access middleware
 */
export const requireRider = authorize([UserRole.RIDER, UserRole.ADMIN]);

/**
 * Merchant access middleware
 */
export const requireMerchant = authorize([UserRole.MERCHANT, UserRole.ADMIN]);

/**
 * Support access middleware
 */
export const requireSupport = authorize([UserRole.SUPPORT, UserRole.ADMIN]);

/**
 * Self-access middleware - allows users to access their own resources
 */
export const requireSelfOrAdmin = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    const targetUserId = req.params[userIdParam];
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isSelf = req.user.id === targetUserId;

    if (!isAdmin && !isSelf) {
      logger.security('Unauthorized self-access attempt', {
        userId: req.user.id,
        targetUserId,
        endpoint: req.path,
        method: req.method,
        ip: req.ip
      });

      ResponseUtil.forbidden(res, 'Access denied: You can only access your own resources');
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = authenticate({ required: false });

/**
 * Middleware to check if user's email is verified
 */
export const requireEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    ResponseUtil.unauthorized(res, 'Authentication required');
    return;
  }

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user || !user.emailVerifiedAt) {
      ResponseUtil.forbidden(res, 'Email verification required');
      return;
    }

    next();
  } catch (error) {
    logger.error('Email verification check failed', error as Error, {
      userId: req.user.id
    });
    ResponseUtil.error(res, 'Verification check failed', undefined, 500);
  }
};

/**
 * Middleware to check if user's phone is verified
 */
export const requirePhoneVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    ResponseUtil.unauthorized(res, 'Authentication required');
    return;
  }

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user || !user.phoneVerifiedAt) {
      ResponseUtil.forbidden(res, 'Phone verification required');
      return;
    }

    next();
  } catch (error) {
    logger.error('Phone verification check failed', error as Error, {
      userId: req.user.id
    });
    ResponseUtil.error(res, 'Verification check failed', undefined, 500);
  }
};

/**
 * Middleware to ensure account is not locked
 */
export const checkAccountStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    ResponseUtil.unauthorized(res, 'Authentication required');
    return;
  }

  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      ResponseUtil.unauthorized(res, 'User not found');
      return;
    }

    if (user.status === 'locked') {
      if (user.security.lockedUntil && new Date() < user.security.lockedUntil) {
        const unlockTime = user.security.lockedUntil.toISOString();
        ResponseUtil.forbidden(res, `Account is locked until ${unlockTime}`);
        return;
      } else if (user.security.lockedUntil && new Date() >= user.security.lockedUntil) {
        // Auto-unlock expired locks
        await UserModel.unlockAccount(user.id);
      }
    }

    if (user.status === 'suspended') {
      ResponseUtil.forbidden(res, 'Account has been suspended');
      return;
    }

    if (user.status === 'inactive') {
      ResponseUtil.forbidden(res, 'Account is inactive');
      return;
    }

    next();
  } catch (error) {
    logger.error('Account status check failed', error as Error, {
      userId: req.user.id
    });
    ResponseUtil.error(res, 'Account status check failed', undefined, 500);
  }
};

/**
 * Combined middleware for common authentication requirements
 */
export const requireAuth = authenticate();
export const requireVerifiedAuth = [
  authenticate(),
  requireEmailVerification,
  checkAccountStatus
];

/**
 * API key authentication for service-to-service communication
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedApiKey = process.env.INTERNAL_API_KEY;

  if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
    logger.security('Invalid API key attempt', {
      providedKey: apiKey ? 'provided' : 'missing',
      endpoint: req.path,
      method: req.method,
      ip: req.ip
    });

    ResponseUtil.unauthorized(res, 'Valid API key required');
    return;
  }

  // Set service context
  req.user = {
    id: 'system',
    email: 'system@okada.cm',
    role: UserRole.ADMIN,
    jti: 'service'
  };

  next();
};