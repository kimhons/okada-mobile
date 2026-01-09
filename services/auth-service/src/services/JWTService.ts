import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { JWTPayload, RefreshTokenPayload } from '../../../shared/types/auth';
import { logger } from '../../../shared/utils/logger';
import { redis } from '../config/database';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenFamily: string;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
  expired?: boolean;
}

export interface RefreshTokenValidationResult {
  valid: boolean;
  payload?: RefreshTokenPayload;
  error?: string;
  expired?: boolean;
}

export class JWTService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  static {
    if (!this.JWT_SECRET || this.JWT_SECRET.length < 64) {
      throw new Error('JWT_SECRET must be at least 64 characters long');
    }
    if (!this.JWT_REFRESH_SECRET || this.JWT_REFRESH_SECRET.length < 64) {
      throw new Error('JWT_REFRESH_SECRET must be at least 64 characters long');
    }
  }

  static async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    tokenFamily?: string
  ): Promise<TokenPair> {
    try {
      const jti = uuidv4();
      const refreshJti = uuidv4();
      const family = tokenFamily || uuidv4();

      const now = Math.floor(Date.now() / 1000);
      const accessTokenExpiry = this.parseExpiry(this.JWT_EXPIRES_IN);
      const refreshTokenExpiry = this.parseExpiry(this.JWT_REFRESH_EXPIRES_IN);

      // Create access token payload
      const accessPayload: JWTPayload = {
        sub: userId,
        email,
        role,
        iat: now,
        exp: now + accessTokenExpiry,
        jti
      };

      // Create refresh token payload
      const refreshPayload: RefreshTokenPayload = {
        sub: userId,
        tokenFamily: family,
        iat: now,
        exp: now + refreshTokenExpiry,
        jti: refreshJti
      };

      // Sign tokens
      const accessToken = jwt.sign(accessPayload, this.JWT_SECRET!, {
        algorithm: 'HS256'
      });

      const refreshToken = jwt.sign(refreshPayload, this.JWT_REFRESH_SECRET!, {
        algorithm: 'HS256'
      });

      // Store access token JTI in Redis for revocation
      await this.storeTokenJti(jti, userId, accessTokenExpiry);

      logger.info('JWT token pair generated', {
        userId,
        jti,
        refreshJti,
        tokenFamily: family
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiry,
        tokenFamily: family
      };
    } catch (error) {
      logger.error('Failed to generate token pair', error as Error, { userId });
      throw new Error('Token generation failed');
    }
  }

  static async validateAccessToken(token: string): Promise<TokenValidationResult> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET!) as JWTPayload;

      // Check if token is revoked
      const isRevoked = await this.isTokenRevoked(decoded.jti);
      if (isRevoked) {
        return {
          valid: false,
          error: 'Token has been revoked'
        };
      }

      return {
        valid: true,
        payload: decoded
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'Token has expired',
          expired: true
        };
      }

      if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          error: 'Invalid token'
        };
      }

      logger.error('Access token validation error', error);
      return {
        valid: false,
        error: 'Token validation failed'
      };
    }
  }

  static async validateRefreshToken(token: string): Promise<RefreshTokenValidationResult> {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET!) as RefreshTokenPayload;

      return {
        valid: true,
        payload: decoded
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'Refresh token has expired',
          expired: true
        };
      }

      if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          error: 'Invalid refresh token'
        };
      }

      logger.error('Refresh token validation error', error);
      return {
        valid: false,
        error: 'Refresh token validation failed'
      };
    }
  }

  static async revokeToken(jti: string): Promise<void> {
    try {
      await redis.set(`revoked:${jti}`, '1', 24 * 60 * 60); // 24 hours TTL
      logger.info('Token revoked', { jti });
    } catch (error) {
      logger.error('Failed to revoke token', error as Error, { jti });
      throw error;
    }
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // Get all active tokens for user
      const pattern = `token:${userId}:*`;
      const keys = await redis.getClient().keys(pattern);

      if (keys.length > 0) {
        const pipeline = redis.getClient().pipeline();

        // Mark all tokens as revoked
        for (const key of keys) {
          const jti = key.split(':')[2];
          pipeline.set(`revoked:${jti}`, '1', 'EX', 24 * 60 * 60);
        }

        // Delete token records
        pipeline.del(...keys);
        await pipeline.exec();

        logger.info('All user tokens revoked', {
          userId,
          revokedTokens: keys.length
        });
      }
    } catch (error) {
      logger.error('Failed to revoke all user tokens', error as Error, { userId });
      throw error;
    }
  }

  static async isTokenRevoked(jti: string): Promise<boolean> {
    try {
      const revoked = await redis.exists(`revoked:${jti}`);
      return revoked === 1;
    } catch (error) {
      logger.error('Failed to check token revocation', error as Error, { jti });
      // Fail secure - assume token is revoked if check fails
      return true;
    }
  }

  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }

  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  static async cleanupExpiredTokens(): Promise<number> {
    try {
      // Get all token keys
      const pattern = 'token:*';
      const keys = await redis.getClient().keys(pattern);

      let cleaned = 0;
      const now = Math.floor(Date.now() / 1000);

      for (const key of keys) {
        const tokenData = await redis.get(key);
        if (tokenData) {
          const data = JSON.parse(tokenData);
          if (data.exp && data.exp < now) {
            await redis.del(key);
            cleaned++;
          }
        }
      }

      if (cleaned > 0) {
        logger.info('Expired tokens cleaned up', { cleanedTokens: cleaned });
      }

      return cleaned;
    } catch (error) {
      logger.error('Failed to cleanup expired tokens', error as Error);
      return 0;
    }
  }

  private static async storeTokenJti(
    jti: string,
    userId: string,
    expiresIn: number
  ): Promise<void> {
    const key = `token:${userId}:${jti}`;
    const data = {
      jti,
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresIn
    };

    await redis.set(key, JSON.stringify(data), expiresIn);
  }

  private static parseExpiry(expiryStr: string): number {
    const unit = expiryStr.slice(-1);
    const value = parseInt(expiryStr.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      case 'w': return value * 7 * 24 * 60 * 60;
      default: throw new Error(`Invalid expiry format: ${expiryStr}`);
    }
  }
}