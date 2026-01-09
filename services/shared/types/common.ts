export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
  requestId?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  RIDER = 'rider',
  MERCHANT = 'merchant',
  SUPPORT = 'support'
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  LOCKED = 'locked'
}

export enum VerificationType {
  EMAIL = 'email',
  PHONE = 'phone',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR = 'two_factor'
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
}

export interface CameroonPhoneNumber {
  countryCode: string; // +237
  operator: 'MTN' | 'Orange' | 'Camtel' | 'Nexttel';
  number: string; // 9 digits
  formatted: string; // +237 6XX XXX XXX
}

export enum Locale {
  EN = 'en',
  FR = 'fr'
}

export interface LocalizedContent {
  en: string;
  fr: string;
}

export enum Currency {
  XAF = 'XAF' // Central African Franc
}

export interface MonetaryAmount {
  amount: number; // No decimals for XAF
  currency: Currency;
  formatted: string; // "1,500 FCFA"
}

export interface AuditLog {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'password_change' | 'account_lockout' | 'suspicious_activity';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, any>;
  timestamp: Date;
}