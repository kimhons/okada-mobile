import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/User';
import { VerificationService } from '../../services/VerificationService';
import { NotificationService } from '../../services/NotificationService';
import { UserRole, VerificationType } from '../../../../shared/types/auth';

// Mock external services
jest.mock('../../services/NotificationService');
jest.mock('../../models/User');
jest.mock('../../services/VerificationService');

describe('Auth Integration Tests', () => {
  const baseUrl = '/api/v1/auth';
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    phone: {
      countryCode: '+237',
      operator: 'MTN',
      number: '654321000',
      formatted: '+237 6 54 32 10 00'
    },
    role: UserRole.CUSTOMER,
    status: 'active',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      language: 'fr',
      timezone: 'Africa/Douala'
    },
    security: {
      twoFactorEnabled: false,
      loginAttempts: 0,
      passwordChangedAt: new Date()
    },
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true,
        marketing: false
      },
      privacy: {
        profileVisibility: 'private',
        locationSharing: false,
        dataProcessing: true
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerifiedAt: new Date(),
    phoneVerifiedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    const validRegisterData = {
      email: 'newuser@example.com',
      phone: '+237654321001',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'New',
      lastName: 'User',
      role: UserRole.CUSTOMER,
      language: 'fr',
      termsAccepted: true,
      privacyPolicyAccepted: true
    };

    it('should register a new user successfully', async () => {
      // Mock dependencies
      (UserModel.findByEmailOrPhone as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);
      (VerificationService.generateCode as jest.Mock).mockResolvedValue({
        id: 'verification-id',
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
      (NotificationService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);
      (NotificationService.sendVerificationSMS as jest.Mock).mockResolvedValue(true);
      (NotificationService.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(validRegisterData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Registration successful')
      });

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', validRegisterData.email);
      expect(response.body.data).not.toHaveProperty('passwordHash');

      // Verify service calls
      expect(UserModel.create).toHaveBeenCalledWith({
        email: validRegisterData.email,
        phone: validRegisterData.phone,
        password: validRegisterData.password,
        firstName: validRegisterData.firstName,
        lastName: validRegisterData.lastName,
        role: validRegisterData.role,
        language: validRegisterData.language
      });

      expect(VerificationService.generateCode).toHaveBeenCalledTimes(2); // Email and phone
      expect(NotificationService.sendVerificationEmail).toHaveBeenCalled();
      expect(NotificationService.sendVerificationSMS).toHaveBeenCalled();
      expect(NotificationService.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should reject registration with existing email', async () => {
      (UserModel.findByEmailOrPhone as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(validRegisterData)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User already exists with this email or phone'
      });
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validRegisterData };
      delete invalidData.email;

      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(invalidData)
        .expect(422);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Validation Error'
      });
    });

    it('should validate password strength', async () => {
      const weakPasswordData = {
        ...validRegisterData,
        password: 'weak',
        confirmPassword: 'weak'
      };

      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(weakPasswordData)
        .expect(422);

      expect(response.body.errors).toContain(
        expect.stringContaining('Password must contain at least one lowercase letter')
      );
    });

    it('should validate Cameroon phone number format', async () => {
      const invalidPhoneData = {
        ...validRegisterData,
        phone: '+1234567890' // Invalid Cameroon number
      };

      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(invalidPhoneData)
        .expect(422);

      expect(response.body.errors).toContain(
        expect.stringContaining('Phone number must be a valid Cameroonian number')
      );
    });
  });

  describe('POST /login', () => {
    const validLoginData = {
      identifier: 'test@example.com',
      password: 'Password123!'
    };

    it('should login user successfully', async () => {
      const userWithPassword = {
        ...mockUser,
        passwordHash: 'hashed-password'
      };

      (UserModel.findByEmailOrPhone as jest.Mock).mockResolvedValue(userWithPassword);
      (UserModel.verifyPassword as jest.Mock).mockResolvedValue(true);
      (UserModel.updateLoginAttempts as jest.Mock).mockResolvedValue(undefined);
      (UserModel.updateLastLogin as jest.Mock).mockResolvedValue(undefined);

      // Mock session creation
      const mockSessionModel = require('../../models/Session');
      mockSessionModel.SessionModel = {
        create: jest.fn().mockResolvedValue({})
      };

      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send(validLoginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful'
      });

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.tokens).toHaveProperty('expiresIn');

      // Verify password was checked
      expect(UserModel.verifyPassword).toHaveBeenCalledWith(
        mockUser.id,
        validLoginData.password
      );
    });

    it('should reject login with invalid credentials', async () => {
      (UserModel.findByEmailOrPhone as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send(validLoginData)
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should reject login with wrong password', async () => {
      (UserModel.findByEmailOrPhone as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.verifyPassword as jest.Mock).mockResolvedValue(false);
      (UserModel.updateLoginAttempts as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send(validLoginData)
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
      expect(UserModel.updateLoginAttempts).toHaveBeenCalled();
    });

    it('should handle account lockout', async () => {
      const lockedUser = {
        ...mockUser,
        status: 'locked',
        security: {
          ...mockUser.security,
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      };

      (UserModel.findByEmailOrPhone as jest.Mock).mockResolvedValue(lockedUser);

      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send(validLoginData)
        .expect(403);

      expect(response.body.message).toContain('Account is locked');
    });
  });

  describe('POST /verify/send', () => {
    it('should send email verification code', async () => {
      (VerificationService.checkGenerationRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remainingCodes: 2,
        resetTime: new Date(Date.now() + 5 * 60 * 1000)
      });

      (VerificationService.generateCode as jest.Mock).mockResolvedValue({
        id: 'verification-id',
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      (NotificationService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post(`${baseUrl}/verify/send`)
        .send({
          type: VerificationType.EMAIL,
          identifier: 'test@example.com'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Verification code sent successfully'
      });

      expect(VerificationService.generateCode).toHaveBeenCalledWith({
        type: VerificationType.EMAIL,
        identifier: 'test@example.com'
      });

      expect(NotificationService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should send SMS verification code', async () => {
      (VerificationService.checkGenerationRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remainingCodes: 2,
        resetTime: new Date(Date.now() + 5 * 60 * 1000)
      });

      (VerificationService.generateCode as jest.Mock).mockResolvedValue({
        id: 'verification-id',
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      (NotificationService.sendVerificationSMS as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post(`${baseUrl}/verify/send`)
        .send({
          type: VerificationType.PHONE,
          identifier: '+237654321000'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Verification code sent successfully'
      });

      expect(NotificationService.sendVerificationSMS).toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      (VerificationService.checkGenerationRateLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        remainingCodes: 0,
        resetTime: new Date(Date.now() + 5 * 60 * 1000)
      });

      const response = await request(app)
        .post(`${baseUrl}/verify/send`)
        .send({
          type: VerificationType.EMAIL,
          identifier: 'test@example.com'
        })
        .expect(429);

      expect(response.body.message).toContain('Too many verification requests');
    });

    it('should validate identifier format for email', async () => {
      const response = await request(app)
        .post(`${baseUrl}/verify/send`)
        .send({
          type: VerificationType.EMAIL,
          identifier: 'invalid-email'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid email format');
    });

    it('should validate identifier format for phone', async () => {
      const response = await request(app)
        .post(`${baseUrl}/verify/send`)
        .send({
          type: VerificationType.PHONE,
          identifier: '+1234567890'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid phone number format');
    });
  });

  describe('POST /verify/confirm', () => {
    it('should verify code successfully', async () => {
      (VerificationService.verifyCode as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Verification successful'
      });

      (UserModel.findByEmailOrPhone as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.verifyEmail as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`${baseUrl}/verify/confirm`)
        .send({
          type: VerificationType.EMAIL,
          identifier: 'test@example.com',
          code: '123456'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Verification successful'
      });

      expect(VerificationService.verifyCode).toHaveBeenCalledWith({
        type: VerificationType.EMAIL,
        identifier: 'test@example.com',
        code: '123456'
      });
    });

    it('should handle invalid verification code', async () => {
      (VerificationService.verifyCode as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid verification code',
        attemptsRemaining: 2
      });

      const response = await request(app)
        .post(`${baseUrl}/verify/confirm`)
        .send({
          type: VerificationType.EMAIL,
          identifier: 'test@example.com',
          code: 'wrong-code'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid verification code');
      expect(response.body.data).toHaveProperty('attemptsRemaining', 2);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`${baseUrl}/verify/confirm`)
        .send({
          type: VerificationType.EMAIL,
          identifier: 'test@example.com'
          // Missing code
        })
        .expect(422);

      expect(response.body.message).toBe('Validation Error');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // Make multiple requests to trigger rate limiting
      const promises = Array(6).fill(null).map(() =>
        request(app)
          .post(`${baseUrl}/login`)
          .send({ identifier: 'test', password: 'test' })
      );

      const responses = await Promise.all(promises);

      // Last request should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.message).toContain('Too many authentication attempts');
    });
  });

  describe('Health Check', () => {
    it('should return service health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Service is healthy',
        data: {
          service: 'okada-auth-service',
          status: 'healthy'
        }
      });
    });
  });
});