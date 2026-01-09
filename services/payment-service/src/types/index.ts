/**
 * Okada Payment Service - Type Definitions
 * Comprehensive type system for Cameroon payment integrations
 */

export enum PaymentProvider {
  MTN_MOBILE_MONEY = 'mtn_mobile_money',
  ORANGE_MONEY = 'orange_money',
  CASH = 'cash'
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CASH_PICKUP = 'cash_pickup'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed',
  EXPIRED = 'expired'
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  DISBURSEMENT = 'disbursement',
  COMMISSION = 'commission',
  TAX = 'tax',
  SETTLEMENT = 'settlement'
}

export enum CurrencyCode {
  XAF = 'XAF' // Central African CFA Franc
}

export enum FraudRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum USSDCode {
  MTN_MOBILE_MONEY = '*126#',
  ORANGE_MONEY = '*150#'
}

export interface PaymentRequest {
  orderId: string;
  customerId: string;
  merchantId?: string;
  amount: number;
  currency: CurrencyCode;
  provider: PaymentProvider;
  method: PaymentMethod;
  phoneNumber?: string;
  description: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
  expiresAt?: Date;
  retryCount?: number;
}

export interface PaymentResponse {
  transactionId: string;
  externalTransactionId?: string;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  provider: PaymentProvider;
  method: PaymentMethod;
  fees?: number;
  taxes?: number;
  netAmount?: number;
  paymentUrl?: string;
  ussdCode?: string;
  qrCode?: string;
  reference?: string;
  message?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerId: string;
  merchantId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  provider: PaymentProvider;
  method: PaymentMethod;
  externalTransactionId?: string;
  reference: string;
  description: string;
  phoneNumber?: string;
  fees: number;
  taxes: number;
  commission: number;
  netAmount: number;
  metadata: Record<string, any>;
  fraudScore?: number;
  riskLevel?: FraudRiskLevel;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: Date;
  failureReason?: string;
  callbackUrl?: string;
  webhookAttempts: number;
  webhookLastAttempt?: Date;
  expiresAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  refundId: string;
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  provider: PaymentProvider;
  reference: string;
  reason: string;
  createdAt: Date;
}

export interface WebhookPayload {
  event: string;
  transactionId: string;
  externalTransactionId?: string;
  status: TransactionStatus;
  amount?: number;
  currency?: CurrencyCode;
  provider: PaymentProvider;
  timestamp: Date;
  signature?: string;
  data?: Record<string, any>;
}

export interface MTNPaymentRequest {
  amount: string;
  currency: CurrencyCode;
  externalId: string;
  payer: {
    partyIdType: 'MSISDN';
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
  callbackUrl?: string;
}

export interface MTNPaymentResponse {
  status: string;
  reason?: string;
  externalId: string;
  amount: string;
  currency: CurrencyCode;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
  financialTransactionId?: string;
}

export interface OrangePaymentRequest {
  merchant_key: string;
  currency: CurrencyCode;
  order_id: string;
  amount: number;
  return_url: string;
  cancel_url: string;
  notif_url: string;
  lang: 'fr' | 'en';
  reference: string;
}

export interface OrangePaymentResponse {
  payment_url: string;
  payment_token: string;
  pay_token: string;
}

export interface PaymentProvider {
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<PaymentResponse>;
  refundPayment(request: RefundRequest): Promise<RefundResponse>;
  getPaymentStatus(externalTransactionId: string): Promise<TransactionStatus>;
}

export interface FraudDetectionResult {
  score: number;
  riskLevel: FraudRiskLevel;
  reasons: string[];
  recommendations: string[];
  blocked: boolean;
}

export interface PaymentConfig {
  provider: PaymentProvider;
  enabled: boolean;
  testMode: boolean;
  minAmount: number;
  maxAmount: number;
  supportedCurrencies: CurrencyCode[];
  fees: {
    fixed: number;
    percentage: number;
    maxFee?: number;
  };
  retryConfig: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
}

export interface USSDSession {
  sessionId: string;
  phoneNumber: string;
  provider: PaymentProvider;
  transactionId?: string;
  currentStep: string;
  data: Record<string, any>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettlementReport {
  id: string;
  merchantId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalTransactions: number;
    totalAmount: number;
    totalFees: number;
    totalTaxes: number;
    totalCommissions: number;
    netAmount: number;
  };
  transactions: Transaction[];
  status: 'pending' | 'processing' | 'completed';
  generatedAt: Date;
  fileUrl?: string;
}

export interface AuditLog {
  id: string;
  transactionId?: string;
  userId?: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface PaymentNotification {
  id: string;
  transactionId: string;
  type: 'sms' | 'email' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  createdAt: Date;
}

export interface CashPaymentCode {
  id: string;
  code: string;
  transactionId: string;
  amount: number;
  currency: CurrencyCode;
  customerId: string;
  merchantId?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// Response interfaces for API endpoints
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: Date;
    requestId: string;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  status?: TransactionStatus[];
  provider?: PaymentProvider[];
  method?: PaymentMethod[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  customerId?: string;
  merchantId?: string;
}

// Cameroon-specific types
export interface CameroonPhoneNumber {
  countryCode: '+237';
  number: string; // 9 digits
  operator: 'MTN' | 'ORANGE' | 'CAMTEL' | 'NEXTTEL';
  formatted: string; // +237XXXXXXXXX
}

export interface CameroonTaxConfig {
  vatRate: number; // 19.25%
  municipalTax: number;
  specialTax?: number;
  exemptions: string[];
}

export interface CEMACCompliance {
  transactionLimit: number; // XAF 5,000,000
  dailyLimit: number;
  monthlyLimit: number;
  kycRequired: boolean;
  reportingRequired: boolean;
}

export enum CameroonRegion {
  ADAMAOUA = 'adamaoua',
  CENTRE = 'centre',
  EST = 'est',
  EXTREME_NORD = 'extreme_nord',
  LITTORAL = 'littoral',
  NORD = 'nord',
  NORD_OUEST = 'nord_ouest',
  OUEST = 'ouest',
  SUD = 'sud',
  SUD_OUEST = 'sud_ouest'
}

export interface CameroonAddress {
  region: CameroonRegion;
  city: string;
  quarter?: string;
  street?: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Error types
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class FraudError extends PaymentError {
  constructor(message: string, public riskLevel: FraudRiskLevel, details?: any) {
    super(message, 'FRAUD_DETECTED', 403, details);
    this.name = 'FraudError';
  }
}

export class ProviderError extends PaymentError {
  constructor(
    message: string,
    public provider: PaymentProvider,
    public providerCode?: string,
    details?: any
  ) {
    super(message, 'PROVIDER_ERROR', 502, details);
    this.name = 'ProviderError';
  }
}

export class ValidationError extends PaymentError {
  constructor(message: string, public field: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', 503, details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends PaymentError {
  constructor(message: string, details?: any) {
    super(message, 'TIMEOUT_ERROR', 408, details);
    this.name = 'TimeoutError';
  }
}