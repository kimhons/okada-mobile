import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { VerificationController } from '../controllers/VerificationController';
import { PasswordController } from '../controllers/PasswordController';
import {
  authenticate,
  requireAdmin,
  requireAuth,
  checkAccountStatus
} from '../middleware/auth';
import {
  authRateLimit,
  passwordResetRateLimit,
  otpRateLimit,
  authSlowDown
} from '../middleware/rateLimiting';

const router = Router();

// Authentication routes
router.post('/register', authRateLimit, authSlowDown, AuthController.register);
router.post('/login', authRateLimit, authSlowDown, AuthController.login);
router.post('/refresh', authRateLimit, AuthController.refreshToken);
router.post('/logout', requireAuth, AuthController.logout);
router.post('/logout-all', requireAuth, AuthController.logoutAll);

// Profile routes
router.get('/profile', requireAuth, checkAccountStatus, AuthController.getProfile);

// Verification routes
router.post('/verify/send', otpRateLimit, VerificationController.sendCode);
router.post('/verify/confirm', otpRateLimit, VerificationController.verifyCode);
router.post('/verify/resend', otpRateLimit, VerificationController.resendCode);
router.get('/verify/status', VerificationController.checkStatus);

// User verification routes (requires authentication)
router.post('/verify/send-user', requireAuth, otpRateLimit, VerificationController.sendForCurrentUser);

// Password reset routes
router.post('/password/reset-request', passwordResetRateLimit, PasswordController.requestReset);
router.post('/password/verify-otp', passwordResetRateLimit, PasswordController.verifyResetOTP);
router.post('/password/reset', passwordResetRateLimit, PasswordController.resetPassword);
router.post('/password/change', requireAuth, checkAccountStatus, PasswordController.changePassword);
router.get('/password/validate-token', PasswordController.validateResetToken);

// Admin routes
router.get('/verify/statistics', requireAuth, requireAdmin, VerificationController.getStatistics);

export default router;