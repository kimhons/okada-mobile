import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { SessionModel } from '../models/Session';
import { JWTService } from '../services/JWTService';
import { VerificationService } from '../services/VerificationService';
import { NotificationService } from '../services/NotificationService';
import { ResponseUtil } from '../../../shared/utils/response';
import { logger } from '../../../shared/utils/logger';
import { validationSchemas, validateRequest } from '../../../shared/utils/validation';
import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  PublicUser,
  UserRole,
  AccountStatus,
  VerificationType
} from '../../../shared/types/auth';
import { Locale } from '../../../shared/types/common';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const validation = validateRequest(validationSchemas.register, req.body);
      if (validation.error) {
        ResponseUtil.validationError(res, [validation.error]);
        return;
      }

      const registerData: RegisterRequest = validation.value;

      // Check if user already exists
      const existingUser = await UserModel.findByEmailOrPhone(
        registerData.email || registerData.phone
      );

      if (existingUser) {
        ResponseUtil.conflict(res, 'User already exists with this email or phone');
        return;
      }

      // Create user
      const user = await UserModel.create({
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: registerData.role,
        language: registerData.language || Locale.FR
      });

      // Generate verification codes
      const [emailVerification, phoneVerification] = await Promise.all([
        VerificationService.generateCode({
          type: VerificationType.EMAIL,
          identifier: user.email
        }),
        VerificationService.generateCode({
          type: VerificationType.PHONE,
          identifier: user.phone.formatted
        })
      ]);

      // Send verification notifications
      await Promise.all([
        NotificationService.sendVerificationEmail(
          user.email,
          emailVerification.code,
          user.profile.language
        ),
        NotificationService.sendVerificationSMS(
          user.phone.formatted,
          phoneVerification.code,
          user.profile.language
        ),
        NotificationService.sendWelcomeEmail(
          user.email,
          user.profile.firstName,
          user.profile.language
        )
      ]);

      // Log registration event
      logger.audit('User registered', {
        userId: user.id,
        email: user.email,
        role: user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Return public user data
      const publicUser: PublicUser = {
        id: user.id,
        email: user.email,
        phone: user.phone.formatted,
        role: user.role,
        status: user.status,
        profile: user.profile,
        emailVerified: !!user.emailVerifiedAt,
        phoneVerified: !!user.phoneVerifiedAt,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };

      ResponseUtil.created(res, publicUser, 'Registration successful. Please verify your email and phone number.');
    } catch (error) {
      logger.error('Registration failed', error as Error, {
        email: req.body?.email,
        role: req.body?.role,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Registration failed');
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const validation = validateRequest(validationSchemas.login, req.body);
      if (validation.error) {
        ResponseUtil.validationError(res, [validation.error]);
        return;
      }

      const loginData: LoginRequest = validation.value;

      // Find user
      const user = await UserModel.findByEmailOrPhone(loginData.identifier);
      if (!user) {
        logger.security('Login attempt with non-existent user', {
          identifier: loginData.identifier,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        ResponseUtil.unauthorized(res, 'Invalid credentials');
        return;
      }

      // Check account status
      if (user.status === AccountStatus.LOCKED) {
        if (user.security.lockedUntil && new Date() < user.security.lockedUntil) {
          const unlockTime = user.security.lockedUntil.toISOString();
          ResponseUtil.forbidden(res, `Account is locked until ${unlockTime}`);
          return;
        } else if (user.security.lockedUntil && new Date() >= user.security.lockedUntil) {
          // Auto-unlock expired locks
          await UserModel.unlockAccount(user.id);
          user.status = AccountStatus.ACTIVE;
        }
      }

      if (user.status !== AccountStatus.ACTIVE) {
        ResponseUtil.forbidden(res, 'Account is not active');
        return;
      }

      // Verify password
      const isPasswordValid = await UserModel.verifyPassword(user.id, loginData.password);
      if (!isPasswordValid) {
        const attempts = user.security.loginAttempts + 1;
        await UserModel.updateLoginAttempts(user.id, attempts);

        // Lock account after max attempts
        const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
        if (attempts >= maxAttempts) {
          const lockDurationMinutes = parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || '30');
          await UserModel.lockAccount(user.id, lockDurationMinutes);

          // Send notification
          const unlockTime = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
          await NotificationService.sendAccountLockedNotification(
            user.email,
            user.phone.formatted,
            unlockTime,
            user.profile.language
          );

          logger.security('Account locked due to failed login attempts', {
            userId: user.id,
            attempts,
            ip: req.ip
          });

          ResponseUtil.forbidden(res, `Account locked due to too many failed attempts. Try again in ${lockDurationMinutes} minutes.`);
          return;
        }

        logger.security('Failed login attempt', {
          userId: user.id,
          attempts,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        const remainingAttempts = maxAttempts - attempts;
        ResponseUtil.unauthorized(res, `Invalid credentials. ${remainingAttempts} attempts remaining.`);
        return;
      }

      // Check if 2FA is required
      if (user.security.twoFactorEnabled && !loginData.twoFactorCode) {
        ResponseUtil.success(res, {
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        }, 'Two-factor authentication required');
        return;
      }

      // Verify 2FA if provided
      if (user.security.twoFactorEnabled && loginData.twoFactorCode) {
        // TODO: Implement 2FA verification
        // For now, we'll skip this step
      }

      // Reset login attempts
      if (user.security.loginAttempts > 0) {
        await UserModel.updateLoginAttempts(user.id, 0);
      }

      // Generate JWT tokens
      const tokenPair = await JWTService.generateTokenPair(
        user.id,
        user.email,
        user.role
      );

      // Create session
      await SessionModel.create({
        userId: user.id,
        refreshTokenJti: tokenPair.refreshToken.split('.')[2], // Extract JTI from token
        tokenFamily: tokenPair.tokenFamily,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Log successful login
      logger.audit('User logged in', {
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Prepare response
      const publicUser: PublicUser = {
        id: user.id,
        email: user.email,
        phone: user.phone.formatted,
        role: user.role,
        status: user.status,
        profile: user.profile,
        emailVerified: !!user.emailVerifiedAt,
        phoneVerified: !!user.phoneVerifiedAt,
        createdAt: user.createdAt,
        lastLoginAt: new Date()
      };

      const loginResponse: LoginResponse = {
        user: publicUser,
        tokens: {
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresIn: tokenPair.expiresIn
        }
      };

      ResponseUtil.success(res, loginResponse, 'Login successful');
    } catch (error) {
      logger.error('Login failed', error as Error, {
        identifier: req.body?.identifier,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Login failed');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateRequest(validationSchemas.refreshToken, req.body);
      if (validation.error) {
        ResponseUtil.validationError(res, [validation.error]);
        return;
      }

      const { refreshToken } = validation.value;

      // Validate refresh token
      const validation_result = await JWTService.validateRefreshToken(refreshToken);
      if (!validation_result.valid || !validation_result.payload) {
        ResponseUtil.unauthorized(res, validation_result.error || 'Invalid refresh token');
        return;
      }

      const payload = validation_result.payload;

      // Find session
      const session = await SessionModel.findByJti(payload.jti);
      if (!session || !session.isActive) {
        // Potential token reuse - revoke all tokens in family
        await SessionModel.revokeByTokenFamily(payload.tokenFamily);

        logger.security('Potential refresh token reuse detected', {
          userId: payload.sub,
          tokenFamily: payload.tokenFamily,
          jti: payload.jti,
          ip: req.ip
        });

        ResponseUtil.unauthorized(res, 'Invalid refresh token');
        return;
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        await SessionModel.revoke(session.refreshTokenJti);
        ResponseUtil.unauthorized(res, 'Refresh token has expired');
        return;
      }

      // Find user
      const user = await UserModel.findById(payload.sub);
      if (!user || user.status !== AccountStatus.ACTIVE) {
        await SessionModel.revoke(session.refreshTokenJti);
        ResponseUtil.unauthorized(res, 'User not found or inactive');
        return;
      }

      // Generate new token pair with same family
      const newTokenPair = await JWTService.generateTokenPair(
        user.id,
        user.email,
        user.role,
        payload.tokenFamily
      );

      // Revoke old refresh token
      await SessionModel.revoke(session.refreshTokenJti);

      // Create new session
      await SessionModel.create({
        userId: user.id,
        refreshTokenJti: newTokenPair.refreshToken.split('.')[2],
        tokenFamily: payload.tokenFamily,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      // Update session last used
      await SessionModel.updateLastUsed(newTokenPair.refreshToken.split('.')[2]);

      logger.audit('Token refreshed', {
        userId: user.id,
        tokenFamily: payload.tokenFamily,
        ip: req.ip
      });

      ResponseUtil.success(res, {
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
        expiresIn: newTokenPair.expiresIn
      }, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh failed', error as Error, {
        ip: req.ip
      });
      ResponseUtil.error(res, 'Token refresh failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Authentication required');
        return;
      }

      // Revoke current refresh token
      const refreshToken = req.body.refreshToken;
      if (refreshToken) {
        const validation = await JWTService.validateRefreshToken(refreshToken);
        if (validation.valid && validation.payload) {
          await SessionModel.revoke(validation.payload.jti);
        }
      }

      // Revoke access token
      await JWTService.revokeToken(req.user.jti);

      logger.audit('User logged out', {
        userId: req.user.id,
        ip: req.ip
      });

      ResponseUtil.success(res, null, 'Logged out successfully');
    } catch (error) {
      logger.error('Logout failed', error as Error, {
        userId: req.user?.id,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Logout failed');
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Authentication required');
        return;
      }

      // Revoke all user sessions
      const revokedSessions = await SessionModel.revokeByUserId(req.user.id);

      // Revoke all user tokens
      await JWTService.revokeAllUserTokens(req.user.id);

      logger.audit('User logged out from all devices', {
        userId: req.user.id,
        revokedSessions,
        ip: req.ip
      });

      ResponseUtil.success(res, { revokedSessions }, 'Logged out from all devices successfully');
    } catch (error) {
      logger.error('Logout all failed', error as Error, {
        userId: req.user?.id,
        ip: req.ip
      });
      ResponseUtil.error(res, 'Logout all failed');
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Authentication required');
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        ResponseUtil.notFound(res, 'User not found');
        return;
      }

      const publicUser: PublicUser = {
        id: user.id,
        email: user.email,
        phone: user.phone.formatted,
        role: user.role,
        status: user.status,
        profile: user.profile,
        emailVerified: !!user.emailVerifiedAt,
        phoneVerified: !!user.phoneVerifiedAt,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };

      ResponseUtil.success(res, publicUser, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile failed', error as Error, {
        userId: req.user?.id
      });
      ResponseUtil.error(res, 'Failed to retrieve profile');
    }
  }
}