import { UserRole, AccountStatus, VerificationType, Locale, CameroonPhoneNumber } from './common';

export interface User {
  id: string;
  email: string;
  phone: CameroonPhoneNumber;
  passwordHash: string;
  role: UserRole;
  status: AccountStatus;
  profile: UserProfile;
  security: UserSecurity;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  language: Locale;
  timezone: string;
}

export interface UserSecurity {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  loginAttempts: number;
  lockedUntil?: Date;
  passwordChangedAt: Date;
  securityQuestions?: SecurityQuestion[];
}

export interface SecurityQuestion {
  question: string;
  answerHash: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    locationSharing: boolean;
    dataProcessing: boolean;
  };
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  language?: Locale;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface LoginResponse {
  user: PublicUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  requiresTwoFactor?: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  profile: UserProfile;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerificationRequest {
  type: VerificationType;
  identifier: string; // email or phone
  code?: string;
}

export interface PasswordResetRequest {
  identifier: string; // email or phone
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetupRequest {
  password: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
  backupCode?: string;
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti: string; // JWT ID for revocation
}

export interface RefreshTokenPayload {
  sub: string; // user id
  tokenFamily: string; // for rotation detection
  iat: number;
  exp: number;
  jti: string;
}

export interface Session {
  id: string;
  userId: string;
  refreshTokenJti: string;
  tokenFamily: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
}

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

export interface AuthEvent {
  type: 'register' | 'login' | 'logout' | 'password_reset' | 'verification' | 'two_factor';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorCode?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}