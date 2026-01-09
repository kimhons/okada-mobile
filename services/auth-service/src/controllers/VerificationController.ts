import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { VerificationService } from '../services/VerificationService';
import { NotificationService } from '../services/NotificationService';
import { ResponseUtil } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';
import { validationSchemas, validateRequest, isValidCameroonPhone } from '../../../shared/utils/validation';
import { VerificationType } from '../../../shared/types/auth';

export class VerificationController {
  /**
   * Send verification code
   */
  static async sendCode(req: Request, res: Response): Promise<void> {
    try {
      const { type, identifier } = req.body;

      // Validate input
      if (!type || !identifier) {
        ResponseUtil.badRequest(res, 'Type and identifier are required');
        return;
      }

      if (!Object.values(VerificationType).includes(type)) {
        ResponseUtil.badRequest(res, 'Invalid verification type');
        return;
      }

      // Normalize identifier
      const normalizedIdentifier = identifier.toLowerCase().trim();

      // Validate identifier format
      if (type === VerificationType.EMAIL) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)) {
          ResponseUtil.badRequest(res, 'Invalid email format');
          return;
        }
      } else if (type === VerificationType.PHONE) {
        if (!isValidCameroonPhone(normalizedIdentifier)) {
          ResponseUtil.badRequest(res, 'Invalid phone number format');
          return;
        }
      }

      // Check rate limiting
      const rateLimit = await VerificationService.checkGenerationRateLimit(normalizedIdentifier);
      if (!rateLimit.allowed) {
        const resetTimeMinutes = Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 60000);
        ResponseUtil.tooManyRequests(
          res,
          `Too many verification requests. Try again in ${resetTimeMinutes} minutes.`,
          resetTimeMinutes * 60
        );
        return;
      }

      // Generate verification code
      const verification = await VerificationService.generateCode({
        type,
        identifier: normalizedIdentifier
      });

      // Send notification
      let sent = false;
      if (type === VerificationType.EMAIL) {
        sent = await NotificationService.sendVerificationEmail(
          normalizedIdentifier,
          verification.code
        );
      } else if (type === VerificationType.PHONE) {
        sent = await NotificationService.sendVerificationSMS(
          normalizedIdentifier,
          verification.code
        );
      }

      if (!sent) {
        logger.error('Failed to send verification notification', undefined, {
          type,
          identifier: normalizedIdentifier
        });
        ResponseUtil.error(res, 'Failed to send verification code');
        return;
      }

      logger.audit('Verification code sent', {
        type,
        identifier: normalizedIdentifier,
        codeId: verification.id,
        ip: req.ip
      });

      ResponseUtil.success(res, {
        message: `Verification code sent to ${type === VerificationType.EMAIL ? 'email' : 'phone'}`,
        expiresAt: verification.expiresAt,
        remainingCodes: rateLimit.remainingCodes - 1
      }, 'Verification code sent successfully');
    } catch (error) {
      logger.error('Send verification code failed', error as Error, {
        type: req.body?.type,
        identifier: req.body?.identifier,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Failed to send verification code');
    }
  }

  /**
   * Verify code
   */
  static async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateRequest(validationSchemas.verifyCode, req.body);
      if (validation.error) {
        ResponseUtil.validationError(res, [validation.error]);
        return;
      }

      const { type, identifier, code } = validation.value;

      // Normalize identifier
      const normalizedIdentifier = identifier.toLowerCase().trim();

      // Verify the code
      const result = await VerificationService.verifyCode({
        type,
        identifier: normalizedIdentifier,
        code
      });

      if (!result.success) {
        logger.security('Verification code verification failed', {
          type,
          identifier: normalizedIdentifier,
          code: '[REDACTED]',
          message: result.message,
          attemptsRemaining: result.attemptsRemaining,
          ip: req.ip
        });

        ResponseUtil.badRequest(res, result.message, undefined, {
          attemptsRemaining: result.attemptsRemaining
        });
        return;
      }

      // Update user verification status if it's for a registered user
      if (type === VerificationType.EMAIL || type === VerificationType.PHONE) {
        const user = await UserModel.findByEmailOrPhone(normalizedIdentifier);
        if (user) {
          if (type === VerificationType.EMAIL && !user.emailVerifiedAt) {
            await UserModel.verifyEmail(user.id);
          } else if (type === VerificationType.PHONE && !user.phoneVerifiedAt) {
            await UserModel.verifyPhone(user.id);
          }

          // If both email and phone are now verified, activate the account
          const updatedUser = await UserModel.findById(user.id);
          if (updatedUser?.emailVerifiedAt && updatedUser?.phoneVerifiedAt &&
              updatedUser.status === 'pending_verification') {
            await UserModel.updateById(user.id, { status: 'active' });
          }
        }
      }

      logger.audit('Verification code verified successfully', {
        type,
        identifier: normalizedIdentifier,
        ip: req.ip
      });

      ResponseUtil.success(res, null, 'Verification successful');
    } catch (error) {
      logger.error('Verify code failed', error as Error, {
        type: req.body?.type,
        identifier: req.body?.identifier,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Verification failed');
    }
  }

  /**
   * Resend verification code
   */
  static async resendCode(req: Request, res: Response): Promise<void> {
    try {
      const { type, identifier } = req.body;

      if (!type || !identifier) {
        ResponseUtil.badRequest(res, 'Type and identifier are required');
        return;
      }

      // Use the same logic as sendCode
      await this.sendCode(req, res);
    } catch (error) {
      logger.error('Resend verification code failed', error as Error, {
        type: req.body?.type,
        identifier: req.body?.identifier,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Failed to resend verification code');
    }
  }

  /**
   * Check verification status
   */
  static async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const { type, identifier } = req.query;

      if (!type || !identifier) {
        ResponseUtil.badRequest(res, 'Type and identifier are required');
        return;
      }

      if (!Object.values(VerificationType).includes(type as VerificationType)) {
        ResponseUtil.badRequest(res, 'Invalid verification type');
        return;
      }

      const normalizedIdentifier = (identifier as string).toLowerCase().trim();

      const isVerified = await VerificationService.isVerified(
        type as VerificationType,
        normalizedIdentifier
      );

      ResponseUtil.success(res, {
        verified: isVerified,
        type,
        identifier: normalizedIdentifier
      }, 'Verification status retrieved');
    } catch (error) {
      logger.error('Check verification status failed', error as Error, {
        type: req.query?.type,
        identifier: req.query?.identifier
      });
      ResponseUtil.error(res, 'Failed to check verification status');
    }
  }

  /**
   * Send verification for current user (requires authentication)
   */
  static async sendForCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Authentication required');
        return;
      }

      const { type } = req.body;

      if (!type || !Object.values(VerificationType).includes(type)) {
        ResponseUtil.badRequest(res, 'Valid verification type is required');
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        ResponseUtil.notFound(res, 'User not found');
        return;
      }

      let identifier: string;
      let alreadyVerified = false;

      if (type === VerificationType.EMAIL) {
        identifier = user.email;
        alreadyVerified = !!user.emailVerifiedAt;
      } else if (type === VerificationType.PHONE) {
        identifier = user.phone.formatted;
        alreadyVerified = !!user.phoneVerifiedAt;
      } else {
        ResponseUtil.badRequest(res, 'Invalid verification type for user');
        return;
      }

      if (alreadyVerified) {
        ResponseUtil.badRequest(res, `${type} is already verified`);
        return;
      }

      // Check rate limiting
      const rateLimit = await VerificationService.checkGenerationRateLimit(identifier);
      if (!rateLimit.allowed) {
        const resetTimeMinutes = Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 60000);
        ResponseUtil.tooManyRequests(
          res,
          `Too many verification requests. Try again in ${resetTimeMinutes} minutes.`,
          resetTimeMinutes * 60
        );
        return;
      }

      // Generate verification code
      const verification = await VerificationService.generateCode({
        type,
        identifier
      });

      // Send notification
      let sent = false;
      if (type === VerificationType.EMAIL) {
        sent = await NotificationService.sendVerificationEmail(
          identifier,
          verification.code,
          user.profile.language
        );
      } else if (type === VerificationType.PHONE) {
        sent = await NotificationService.sendVerificationSMS(
          identifier,
          verification.code,
          user.profile.language
        );
      }

      if (!sent) {
        ResponseUtil.error(res, 'Failed to send verification code');
        return;
      }

      logger.audit('User verification code sent', {
        userId: req.user.id,
        type,
        identifier,
        codeId: verification.id,
        ip: req.ip
      });

      ResponseUtil.success(res, {
        message: `Verification code sent to your ${type}`,
        expiresAt: verification.expiresAt,
        remainingCodes: rateLimit.remainingCodes - 1
      }, 'Verification code sent successfully');
    } catch (error) {
      logger.error('Send user verification code failed', error as Error, {
        userId: req.user?.id,
        type: req.body?.type,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Failed to send verification code');
    }
  }

  /**
   * Get verification statistics (admin only)
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const timeRangeHours = parseInt(req.query.hours as string) || 24;

      if (timeRangeHours < 1 || timeRangeHours > 168) { // Max 1 week
        ResponseUtil.badRequest(res, 'Hours must be between 1 and 168');
        return;
      }

      const stats = await VerificationService.getVerificationStats(timeRangeHours);

      ResponseUtil.success(res, {
        ...stats,
        timeRangeHours,
        successRate: stats.total > 0 ? (stats.successful / stats.total * 100).toFixed(2) : 0
      }, 'Verification statistics retrieved');
    } catch (error) {
      logger.error('Get verification statistics failed', error as Error, {
        userId: req.user?.id
      });
      ResponseUtil.error(res, 'Failed to retrieve verification statistics');
    }
  }
}