import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { VerificationService } from '../services/VerificationService';
import { NotificationService } from '../services/NotificationService';
import { JWTService } from '../services/JWTService';
import { SessionModel } from '../models/Session';
import { ResponseUtil } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';
import { validationSchemas, validateRequest } from '../../../shared/utils/validation';
import { VerificationType } from '../../../shared/types/auth';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class PasswordController {
  /**
   * Request password reset
   */
  static async requestReset(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateRequest(validationSchemas.passwordReset, req.body);
      if (validation.error) {
        ResponseUtil.validationError(res, [validation.error]);
        return;
      }

      const { identifier } = validation.value;

      // Find user
      const user = await UserModel.findByEmailOrPhone(identifier);
      if (!user) {
        // Don't reveal if user exists or not for security
        ResponseUtil.success(res, null, 'If an account exists with this identifier, you will receive reset instructions.');
        return;
      }

      // Check if account is locked
      if (user.status === 'locked' && user.security.lockedUntil && new Date() < user.security.lockedUntil) {
        ResponseUtil.forbidden(res, 'Account is currently locked. Please try again later.');
        return;
      }

      // Check rate limiting for password reset
      const rateLimit = await VerificationService.checkGenerationRateLimit(
        identifier,
        60, // 1 hour window
        3   // max 3 reset attempts per hour
      );

      if (!rateLimit.allowed) {
        const resetTimeMinutes = Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 60000);
        ResponseUtil.tooManyRequests(
          res,
          `Too many password reset requests. Try again in ${resetTimeMinutes} minutes.`,
          resetTimeMinutes * 60
        );
        return;
      }

      // Determine reset method based on identifier
      const isEmail = identifier.includes('@');
      const resetMethod = isEmail ? 'email' : 'sms';

      if (resetMethod === 'email') {
        // Generate secure reset token for email
        const resetToken = this.generateResetToken(user.id);

        // Send email with reset link
        const sent = await NotificationService.sendPasswordResetEmail(
          user.email,
          resetToken,
          user.profile.language
        );

        if (!sent) {
          ResponseUtil.error(res, 'Failed to send password reset email');
          return;
        }
      } else {
        // Generate OTP for SMS
        const verification = await VerificationService.generateCode({
          type: VerificationType.PASSWORD_RESET,
          identifier: user.phone.formatted,
          expiryMinutes: 10
        });

        // Send SMS with OTP
        const sent = await NotificationService.sendPasswordResetSMS(
          user.phone.formatted,
          verification.code,
          user.profile.language
        );

        if (!sent) {
          ResponseUtil.error(res, 'Failed to send password reset SMS');
          return;
        }
      }

      logger.audit('Password reset requested', {
        userId: user.id,
        method: resetMethod,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      ResponseUtil.success(res, {
        method: resetMethod,
        message: resetMethod === 'email'
          ? 'Password reset instructions sent to your email'
          : 'Password reset code sent to your phone'
      }, 'Password reset instructions sent');
    } catch (error) {
      logger.error('Password reset request failed', error as Error, {
        identifier: req.body?.identifier,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Failed to process password reset request');
    }
  }

  /**
   * Verify password reset OTP (for SMS method)
   */
  static async verifyResetOTP(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, code } = req.body;

      if (!identifier || !code) {
        ResponseUtil.badRequest(res, 'Identifier and code are required');
        return;
      }

      // Find user
      const user = await UserModel.findByEmailOrPhone(identifier);
      if (!user) {
        ResponseUtil.badRequest(res, 'Invalid identifier or code');
        return;
      }

      // Verify the OTP
      const result = await VerificationService.verifyCode({
        type: VerificationType.PASSWORD_RESET,
        identifier: user.phone.formatted,
        code
      });

      if (!result.success) {
        ResponseUtil.badRequest(res, result.message, undefined, {
          attemptsRemaining: result.attemptsRemaining
        });
        return;
      }

      // Generate temporary reset token for the verified user
      const resetToken = this.generateResetToken(user.id, true); // Short-lived token

      logger.audit('Password reset OTP verified', {
        userId: user.id,
        ip: req.ip
      });

      ResponseUtil.success(res, {
        resetToken,
        expiresIn: 300 // 5 minutes
      }, 'OTP verified. You can now reset your password.');
    } catch (error) {
      logger.error('Password reset OTP verification failed', error as Error, {
        identifier: req.body?.identifier,
        ip: req.ip
      });
      ResponseUtil.error(res, 'OTP verification failed');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateRequest(validationSchemas.passwordResetConfirm, req.body);
      if (validation.error) {
        ResponseUtil.validationError(res, [validation.error]);
        return;
      }

      const { token, newPassword } = validation.value;

      // Verify reset token
      let userId: string;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;

        // Check token type
        if (decoded.type !== 'password_reset') {
          throw new Error('Invalid token type');
        }
      } catch (error) {
        ResponseUtil.badRequest(res, 'Invalid or expired reset token');
        return;
      }

      // Find user
      const user = await UserModel.findById(userId);
      if (!user) {
        ResponseUtil.badRequest(res, 'Invalid reset token');
        return;
      }

      // Update password
      await UserModel.updatePassword(userId, newPassword);

      // Revoke all existing sessions and tokens for security
      await Promise.all([
        SessionModel.revokeByUserId(userId),
        JWTService.revokeAllUserTokens(userId)
      ]);

      // Reset login attempts if account was locked
      if (user.security.loginAttempts > 0) {
        await UserModel.updateLoginAttempts(userId, 0);
      }

      // Unlock account if it was locked
      if (user.status === 'locked') {
        await UserModel.unlockAccount(userId);
      }

      logger.audit('Password reset completed', {
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Send notification about password change
      await NotificationService.sendSuspiciousActivityAlert(
        user.email,
        'Password changed',
        req.ip || 'unknown',
        user.profile.language
      );

      ResponseUtil.success(res, null, 'Password reset successfully. Please log in with your new password.');
    } catch (error) {
      logger.error('Password reset failed', error as Error, {
        ip: req.ip
      });
      ResponseUtil.error(res, 'Password reset failed');
    }
  }

  /**
   * Change password (requires authentication)
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Authentication required');
        return;
      }

      const validation = validateRequest(validationSchemas.changePassword, req.body);
      if (validation.error) {
        ResponseUtil.validationError(res, [validation.error]);
        return;
      }

      const { currentPassword, newPassword } = validation.value;

      // Verify current password
      const isCurrentPasswordValid = await UserModel.verifyPassword(
        req.user.id,
        currentPassword
      );

      if (!isCurrentPasswordValid) {
        logger.security('Invalid current password in change password attempt', {
          userId: req.user.id,
          ip: req.ip
        });
        ResponseUtil.badRequest(res, 'Current password is incorrect');
        return;
      }

      // Update password
      await UserModel.updatePassword(req.user.id, newPassword);

      // Revoke all other sessions except current one
      const currentRefreshToken = req.body.currentRefreshToken;
      let currentJti: string | undefined;

      if (currentRefreshToken) {
        const validation = await JWTService.validateRefreshToken(currentRefreshToken);
        if (validation.valid && validation.payload) {
          currentJti = validation.payload.jti;
        }
      }

      await SessionModel.revokeByUserId(req.user.id, currentJti);

      // Get user for notification
      const user = await UserModel.findById(req.user.id);
      if (user) {
        // Send notification about password change
        await NotificationService.sendSuspiciousActivityAlert(
          user.email,
          'Password changed',
          req.ip || 'unknown',
          user.profile.language
        );
      }

      logger.audit('Password changed', {
        userId: req.user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      ResponseUtil.success(res, null, 'Password changed successfully. Other sessions have been logged out.');
    } catch (error) {
      logger.error('Password change failed', error as Error, {
        userId: req.user?.id,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Failed to change password');
    }
  }

  /**
   * Validate reset token
   */
  static async validateResetToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token) {
        ResponseUtil.badRequest(res, 'Reset token is required');
        return;
      }

      try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as any;

        if (decoded.type !== 'password_reset') {
          throw new Error('Invalid token type');
        }

        // Check if user still exists
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
          throw new Error('User not found');
        }

        ResponseUtil.success(res, {
          valid: true,
          userId: decoded.userId,
          expiresAt: new Date(decoded.exp * 1000)
        }, 'Reset token is valid');
      } catch (error) {
        ResponseUtil.badRequest(res, 'Invalid or expired reset token');
      }
    } catch (error) {
      logger.error('Reset token validation failed', error as Error, {
        token: req.query?.token ? '[REDACTED]' : 'missing'
      });
      ResponseUtil.error(res, 'Token validation failed');
    }
  }

  /**
   * Generate password reset token
   */
  private static generateResetToken(userId: string, shortLived: boolean = false): string {
    const expiresIn = shortLived ? '5m' : '1h';

    return jwt.sign(
      {
        userId,
        type: 'password_reset',
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET!,
      { expiresIn }
    );
  }
}