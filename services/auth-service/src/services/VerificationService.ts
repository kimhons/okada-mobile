import { postgres } from '../config/database';
import { VerificationType } from '../../../shared/types/auth';
import { logger } from '../../../shared/utils/logger';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface VerificationCode {
  id: string;
  type: VerificationType;
  identifier: string;
  code: string;
  hashedCode: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  verifiedAt?: Date;
}

export interface CreateVerificationCodeOptions {
  type: VerificationType;
  identifier: string;
  expiryMinutes?: number;
  maxAttempts?: number;
  codeLength?: number;
}

export interface VerifyCodeOptions {
  type: VerificationType;
  identifier: string;
  code: string;
}

export class VerificationService {
  private static readonly DEFAULT_EXPIRY_MINUTES = parseInt(
    process.env.OTP_EXPIRY_MINUTES || '10'
  );
  private static readonly DEFAULT_MAX_ATTEMPTS = 3;
  private static readonly DEFAULT_CODE_LENGTH = 6;

  /**
   * Generate and store a verification code
   */
  static async generateCode(options: CreateVerificationCodeOptions): Promise<{
    id: string;
    code: string;
    expiresAt: Date;
  }> {
    const {
      type,
      identifier,
      expiryMinutes = this.DEFAULT_EXPIRY_MINUTES,
      maxAttempts = this.DEFAULT_MAX_ATTEMPTS,
      codeLength = this.DEFAULT_CODE_LENGTH
    } = options;

    try {
      // Generate verification code
      const code = this.generateRandomCode(codeLength);
      const hashedCode = await bcrypt.hash(code, 12);
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Deactivate any existing codes for this identifier and type
      await this.deactivateExistingCodes(type, identifier);

      // Store the new code
      const query = `
        INSERT INTO verification_codes (
          type,
          identifier,
          code,
          hashed_code,
          expires_at,
          max_attempts
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const values = [
        type,
        identifier.toLowerCase(),
        code, // Store plain code temporarily for immediate return
        hashedCode,
        expiresAt,
        maxAttempts
      ];

      const result = await postgres.query(query, values);
      const id = result.rows[0].id;

      // Clear the plain code from database for security
      await postgres.query(
        'UPDATE verification_codes SET code = NULL WHERE id = $1',
        [id]
      );

      logger.info('Verification code generated', {
        id,
        type,
        identifier,
        expiryMinutes
      });

      return { id, code, expiresAt };
    } catch (error) {
      logger.error('Failed to generate verification code', error as Error, {
        type,
        identifier
      });
      throw new Error('Failed to generate verification code');
    }
  }

  /**
   * Verify a code
   */
  static async verifyCode(options: VerifyCodeOptions): Promise<{
    success: boolean;
    message: string;
    attemptsRemaining?: number;
  }> {
    const { type, identifier, code } = options;

    try {
      // Find the most recent active code
      const query = `
        SELECT * FROM verification_codes
        WHERE type = $1 AND identifier = $2 AND verified = false
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await postgres.query(query, [type, identifier.toLowerCase()]);

      if (result.rows.length === 0) {
        logger.security('Verification code not found', {
          type,
          identifier,
          providedCode: code
        });
        return {
          success: false,
          message: 'Invalid or expired verification code'
        };
      }

      const dbCode = result.rows[0];

      // Check if code has expired
      if (new Date() > new Date(dbCode.expires_at)) {
        logger.security('Expired verification code attempt', {
          type,
          identifier,
          codeId: dbCode.id
        });
        return {
          success: false,
          message: 'Verification code has expired'
        };
      }

      // Check if max attempts exceeded
      if (dbCode.attempts >= dbCode.max_attempts) {
        logger.security('Max verification attempts exceeded', {
          type,
          identifier,
          codeId: dbCode.id,
          attempts: dbCode.attempts
        });
        return {
          success: false,
          message: 'Maximum verification attempts exceeded'
        };
      }

      // Increment attempt count
      await this.incrementAttempts(dbCode.id);

      // Verify the code
      const isValid = await bcrypt.compare(code, dbCode.hashed_code);

      if (!isValid) {
        const attemptsRemaining = dbCode.max_attempts - dbCode.attempts - 1;

        logger.security('Invalid verification code attempt', {
          type,
          identifier,
          codeId: dbCode.id,
          attemptsRemaining
        });

        return {
          success: false,
          message: 'Invalid verification code',
          attemptsRemaining: Math.max(0, attemptsRemaining)
        };
      }

      // Mark code as verified
      await this.markAsVerified(dbCode.id);

      logger.audit('Verification code verified successfully', {
        type,
        identifier,
        codeId: dbCode.id
      });

      return {
        success: true,
        message: 'Verification successful'
      };
    } catch (error) {
      logger.error('Failed to verify code', error as Error, {
        type,
        identifier
      });
      throw new Error('Verification failed');
    }
  }

  /**
   * Check if an identifier has been verified for a specific type
   */
  static async isVerified(type: VerificationType, identifier: string): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count FROM verification_codes
        WHERE type = $1 AND identifier = $2 AND verified = true
      `;

      const result = await postgres.query(query, [type, identifier.toLowerCase()]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      logger.error('Failed to check verification status', error as Error, {
        type,
        identifier
      });
      return false;
    }
  }

  /**
   * Get verification statistics for monitoring
   */
  static async getVerificationStats(
    timeRangeHours: number = 24
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    expired: number;
    byType: Record<string, number>;
  }> {
    try {
      const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

      const queries = [
        // Total codes generated
        'SELECT COUNT(*) as count FROM verification_codes WHERE created_at > $1',
        // Successful verifications
        'SELECT COUNT(*) as count FROM verification_codes WHERE created_at > $1 AND verified = true',
        // Failed attempts (exceeded max attempts)
        'SELECT COUNT(*) as count FROM verification_codes WHERE created_at > $1 AND attempts >= max_attempts AND verified = false',
        // Expired codes
        'SELECT COUNT(*) as count FROM verification_codes WHERE created_at > $1 AND expires_at < CURRENT_TIMESTAMP AND verified = false',
        // By type
        'SELECT type, COUNT(*) as count FROM verification_codes WHERE created_at > $1 GROUP BY type'
      ];

      const results = await Promise.all(
        queries.map(query => postgres.query(query, [cutoffTime]))
      );

      const byType: Record<string, number> = {};
      results[4].rows.forEach(row => {
        byType[row.type] = parseInt(row.count);
      });

      return {
        total: parseInt(results[0].rows[0].count),
        successful: parseInt(results[1].rows[0].count),
        failed: parseInt(results[2].rows[0].count),
        expired: parseInt(results[3].rows[0].count),
        byType
      };
    } catch (error) {
      logger.error('Failed to get verification statistics', error as Error, {
        timeRangeHours
      });
      throw error;
    }
  }

  /**
   * Clean up expired verification codes
   */
  static async cleanupExpiredCodes(): Promise<number> {
    try {
      const query = `
        DELETE FROM verification_codes
        WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `;

      const result = await postgres.query(query);
      const deletedCount = result.rowCount || 0;

      if (deletedCount > 0) {
        logger.info('Expired verification codes cleaned up', {
          deletedCount
        });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired codes', error as Error);
      return 0;
    }
  }

  /**
   * Rate limiting check for code generation
   */
  static async checkGenerationRateLimit(
    identifier: string,
    windowMinutes: number = 5,
    maxCodes: number = 3
  ): Promise<{
    allowed: boolean;
    remainingCodes: number;
    resetTime: Date;
  }> {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

      const query = `
        SELECT COUNT(*) as count FROM verification_codes
        WHERE identifier = $1 AND created_at > $2
      `;

      const result = await postgres.query(query, [identifier.toLowerCase(), windowStart]);
      const currentCount = parseInt(result.rows[0].count);

      const allowed = currentCount < maxCodes;
      const remainingCodes = Math.max(0, maxCodes - currentCount);
      const resetTime = new Date(Date.now() + windowMinutes * 60 * 1000);

      if (!allowed) {
        logger.security('Verification code generation rate limit exceeded', {
          identifier,
          currentCount,
          maxCodes,
          windowMinutes
        });
      }

      return { allowed, remainingCodes, resetTime };
    } catch (error) {
      logger.error('Failed to check generation rate limit', error as Error, {
        identifier
      });
      // Fail open
      return {
        allowed: true,
        remainingCodes: 3,
        resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
      };
    }
  }

  private static generateRandomCode(length: number): string {
    const digits = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }

    return code;
  }

  private static async deactivateExistingCodes(
    type: VerificationType,
    identifier: string
  ): Promise<void> {
    const query = `
      UPDATE verification_codes
      SET verified = true, verified_at = CURRENT_TIMESTAMP
      WHERE type = $1 AND identifier = $2 AND verified = false
    `;

    await postgres.query(query, [type, identifier.toLowerCase()]);
  }

  private static async incrementAttempts(codeId: string): Promise<void> {
    const query = `
      UPDATE verification_codes
      SET attempts = attempts + 1
      WHERE id = $1
    `;

    await postgres.query(query, [codeId]);
  }

  private static async markAsVerified(codeId: string): Promise<void> {
    const query = `
      UPDATE verification_codes
      SET verified = true, verified_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await postgres.query(query, [codeId]);
  }
}