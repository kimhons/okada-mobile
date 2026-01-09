import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { redis } from '../config/database';
import { ResponseUtil } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';

// Rate limiting configurations
const defaultWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const defaultMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

/**
 * General API rate limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: defaultWindowMs,
  max: defaultMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: Math.ceil(defaultWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.security('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method
    });

    ResponseUtil.tooManyRequests(
      res,
      'Too many requests from this IP. Please try again later.',
      Math.ceil(defaultWindowMs / 1000)
    );
  }
});

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP + identifier for more granular limiting
    const identifier = req.body?.identifier || req.body?.email || req.body?.phone || '';
    return `auth:${req.ip}:${identifier}`;
  },
  handler: (req: Request, res: Response) => {
    logger.security('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      identifier: req.body?.identifier || 'unknown',
      endpoint: req.path
    });

    ResponseUtil.tooManyRequests(
      res,
      'Too many authentication attempts. Please try again in 15 minutes.',
      900
    );
  }
});

/**
 * Very strict rate limiting for password reset
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 1 hour.',
    retryAfter: 3600
  },
  keyGenerator: (req: Request) => {
    const identifier = req.body?.identifier || '';
    return `password_reset:${req.ip}:${identifier}`;
  },
  handler: (req: Request, res: Response) => {
    logger.security('Password reset rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      identifier: req.body?.identifier || 'unknown'
    });

    ResponseUtil.tooManyRequests(
      res,
      'Too many password reset attempts. Please try again in 1 hour.',
      3600
    );
  }
});

/**
 * Rate limiting for OTP verification
 */
export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 attempts per window
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please try again in 10 minutes.',
    retryAfter: 600
  },
  keyGenerator: (req: Request) => {
    const identifier = req.body?.identifier || '';
    return `otp:${req.ip}:${identifier}`;
  },
  handler: (req: Request, res: Response) => {
    logger.security('OTP verification rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      identifier: req.body?.identifier || 'unknown'
    });

    ResponseUtil.tooManyRequests(
      res,
      'Too many OTP verification attempts. Please try again in 10 minutes.',
      600
    );
  }
});

/**
 * Progressive delay for authentication attempts
 */
export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per window at full speed
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 5000, // Maximum delay of 5 seconds
  keyGenerator: (req: Request) => {
    const identifier = req.body?.identifier || req.body?.email || req.body?.phone || '';
    return `auth_slow:${req.ip}:${identifier}`;
  }
});

/**
 * Custom Redis-based rate limiter for more complex scenarios
 */
export class CustomRateLimiter {
  static async checkLimit(
    key: string,
    limit: number,
    windowSeconds: number,
    identifier?: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    try {
      const redisKey = `rate_limit:${key}${identifier ? `:${identifier}` : ''}`;
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);

      // Use sliding window log approach
      const pipeline = redis.getClient().pipeline();

      // Remove expired entries
      pipeline.zremrangebyscore(redisKey, 0, windowStart);

      // Count current requests
      pipeline.zcard(redisKey);

      // Add current request
      pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);

      // Set expiry
      pipeline.expire(redisKey, windowSeconds);

      const results = await pipeline.exec();

      if (!results) {
        throw new Error('Redis pipeline failed');
      }

      const currentCount = (results[1][1] as number) || 0;
      const allowed = currentCount < limit;
      const remaining = Math.max(0, limit - currentCount - 1);
      const resetTime = new Date(now + (windowSeconds * 1000));

      if (!allowed) {
        // Calculate retry after time
        const retryAfter = Math.ceil(windowSeconds);
        return { allowed, remaining: 0, resetTime, retryAfter };
      }

      return { allowed, remaining, resetTime };
    } catch (error) {
      logger.error('Custom rate limiter error', error as Error, { key, identifier });
      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: new Date(Date.now() + windowSeconds * 1000)
      };
    }
  }

  static middleware(
    key: string,
    limit: number,
    windowSeconds: number,
    message?: string
  ) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const identifier = req.ip;
        const result = await this.checkLimit(key, limit, windowSeconds, identifier);

        // Set rate limit headers
        res.set({
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.getTime().toString()
        });

        if (!result.allowed) {
          if (result.retryAfter) {
            res.set('Retry-After', result.retryAfter.toString());
          }

          logger.security('Custom rate limit exceeded', {
            key,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method
          });

          ResponseUtil.tooManyRequests(
            res,
            message || 'Rate limit exceeded',
            result.retryAfter
          );
          return;
        }

        next();
      } catch (error) {
        logger.error('Rate limiting middleware error', error as Error, {
          key,
          endpoint: req.path
        });
        // Fail open
        next();
      }
    };
  }
}

/**
 * User-specific rate limiting (requires authentication)
 */
export const userRateLimit = (
  limit: number = 1000,
  windowMinutes: number = 60
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(); // Skip if not authenticated
    }

    const key = `user_rate_limit:${req.user.id}`;
    const windowSeconds = windowMinutes * 60;

    const result = await CustomRateLimiter.checkLimit(
      key,
      limit,
      windowSeconds,
      req.user.id
    );

    res.set({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.getTime().toString()
    });

    if (!result.allowed) {
      logger.security('User rate limit exceeded', {
        userId: req.user.id,
        endpoint: req.path,
        method: req.method
      });

      ResponseUtil.tooManyRequests(
        res,
        'User rate limit exceeded',
        result.retryAfter
      );
      return;
    }

    next();
  };
};

/**
 * Cleanup function to remove old rate limit data
 */
export const cleanupRateLimitData = async (): Promise<number> => {
  try {
    const pattern = 'rate_limit:*';
    const keys = await redis.getClient().keys(pattern);

    let cleaned = 0;
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const key of keys) {
      // Remove entries older than 24 hours
      const removed = await redis.getClient().zremrangebyscore(key, 0, cutoff);
      if (removed > 0) {
        cleaned += removed;
      }

      // Check if set is empty and delete
      const count = await redis.getClient().zcard(key);
      if (count === 0) {
        await redis.del(key);
      }
    }

    if (cleaned > 0) {
      logger.info('Rate limit data cleaned', { cleanedEntries: cleaned });
    }

    return cleaned;
  } catch (error) {
    logger.error('Failed to cleanup rate limit data', error as Error);
    return 0;
  }
};