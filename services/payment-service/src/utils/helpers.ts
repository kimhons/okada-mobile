/**
 * Utility Helper Functions for Payment Service
 * Common utilities used across the payment service
 */

import crypto from 'crypto';
import { config } from '@/config';
import { CameroonPhoneNumber, CurrencyCode, PaymentProvider } from '@/types';
import { logger } from './logger';

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry operation with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> => {
  let attempt = 1;
  let delay = initialDelay;

  while (attempt <= maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      logger.warn(`Operation failed on attempt ${attempt}/${maxAttempts}`, {
        error: error.message,
        attempt,
        nextDelay: attempt < maxAttempts ? delay : null
      });

      if (attempt === maxAttempts) {
        throw error;
      }

      await sleep(delay);
      delay *= backoffMultiplier;
      attempt++;
    }
  }

  throw new Error('Retry operation failed - this should never be reached');
};

/**
 * Generate unique transaction reference
 */
export const generateTransactionReference = (
  provider: PaymentProvider,
  orderId: string
): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const providerPrefix = {
    [PaymentProvider.MTN_MOBILE_MONEY]: 'MTN',
    [PaymentProvider.ORANGE_MONEY]: 'ORG',
    [PaymentProvider.CASH]: 'CSH'
  }[provider];

  return `OKD-${providerPrefix}-${orderId}-${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate secure payment code for cash payments
 */
export const generatePaymentCode = (): string => {
  // Generate 8-digit numeric code
  const min = 10000000;
  const max = 99999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Validate and format Cameroon phone number
 */
export const validateAndFormatPhoneNumber = (phoneNumber: string): CameroonPhoneNumber | null => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid Cameroon number
  let nationalNumber: string;

  if (cleaned.startsWith('237')) {
    nationalNumber = cleaned.substring(3);
  } else if (cleaned.startsWith('00237')) {
    nationalNumber = cleaned.substring(5);
  } else if (cleaned.length === 9) {
    nationalNumber = cleaned;
  } else {
    return null;
  }

  // Validate length (should be 9 digits)
  if (nationalNumber.length !== 9) {
    return null;
  }

  // Determine operator based on prefix
  const prefix = nationalNumber.substring(0, 3);
  let operator: 'MTN' | 'ORANGE' | 'CAMTEL' | 'NEXTTEL';

  if (['650', '651', '652', '653', '654', '680', '681', '682', '683', '684'].includes(prefix)) {
    operator = 'MTN';
  } else if (['690', '691', '692', '693', '694', '695', '696', '697', '698', '699'].includes(prefix)) {
    operator = 'ORANGE';
  } else if (['233', '234', '235', '236', '237', '238', '239'].includes(prefix)) {
    operator = 'CAMTEL';
  } else if (['666', '667', '668', '669'].includes(prefix)) {
    operator = 'NEXTTEL';
  } else {
    return null;
  }

  return {
    countryCode: '+237',
    number: nationalNumber,
    operator,
    formatted: `+237${nationalNumber}`
  };
};

/**
 * Check if phone number is compatible with payment provider
 */
export const isPhoneNumberCompatible = (
  phoneNumber: string,
  provider: PaymentProvider
): boolean => {
  const parsed = validateAndFormatPhoneNumber(phoneNumber);
  if (!parsed) return false;

  switch (provider) {
    case PaymentProvider.MTN_MOBILE_MONEY:
      return parsed.operator === 'MTN';
    case PaymentProvider.ORANGE_MONEY:
      return parsed.operator === 'ORANGE';
    default:
      return true;
  }
};

/**
 * Calculate payment fees
 */
export const calculatePaymentFees = (
  amount: number,
  provider: PaymentProvider
): { fees: number; taxes: number; netAmount: number } => {
  const providerConfig = config.payment.providers[provider];

  // Calculate provider fees
  let fees = providerConfig.fees.fixed;
  fees += Math.min(
    amount * (providerConfig.fees.percentage / 100),
    providerConfig.fees.maxFee || Infinity
  );

  // Calculate taxes (VAT on fees)
  const taxes = fees * config.cameroon.taxation.vatRate;

  // Net amount (amount + fees + taxes)
  const netAmount = amount + fees + taxes;

  return {
    fees: Math.round(fees),
    taxes: Math.round(taxes),
    netAmount: Math.round(netAmount)
  };
};

/**
 * Calculate merchant commission
 */
export const calculateMerchantCommission = (amount: number): number => {
  return Math.round(amount * config.cameroon.taxation.commissionRate);
};

/**
 * Format currency amount (XAF has no decimal places)
 */
export const formatCurrency = (
  amount: number,
  currency: CurrencyCode = CurrencyCode.XAF
): string => {
  if (currency === CurrencyCode.XAF) {
    return `${Math.round(amount).toLocaleString()} XAF`;
  }
  return `${amount.toFixed(2)} ${currency}`;
};

/**
 * Validate amount for Cameroon regulations
 */
export const validateAmount = (
  amount: number,
  provider: PaymentProvider,
  isDaily: boolean = false
): { valid: boolean; reason?: string } => {
  const providerConfig = config.payment.providers[provider];
  const cemac = config.cameroon.cemacCompliance;

  // Check minimum amount
  if (amount < providerConfig.minAmount) {
    return {
      valid: false,
      reason: `Amount below minimum limit of ${formatCurrency(providerConfig.minAmount)}`
    };
  }

  // Check maximum amount
  if (amount > providerConfig.maxAmount) {
    return {
      valid: false,
      reason: `Amount exceeds maximum limit of ${formatCurrency(providerConfig.maxAmount)}`
    };
  }

  // Check CEMAC compliance
  if (cemac.enabled) {
    if (amount > cemac.transactionLimit) {
      return {
        valid: false,
        reason: `Amount exceeds CEMAC transaction limit of ${formatCurrency(cemac.transactionLimit)}`
      };
    }

    if (isDaily && amount > cemac.dailyLimit) {
      return {
        valid: false,
        reason: `Amount exceeds CEMAC daily limit of ${formatCurrency(cemac.dailyLimit)}`
      };
    }
  }

  return { valid: true };
};

/**
 * Generate HMAC signature for webhooks
 */
export const generateWebhookSignature = (payload: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    const expectedSignature = generateWebhookSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    return false;
  }
};

/**
 * Encrypt sensitive data
 */
export const encryptData = (data: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', config.security.encryptionKey);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData: string): string => {
  const decipher = crypto.createDecipher('aes-256-cbc', config.security.encryptionKey);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Hash sensitive data (one-way)
 */
export const hashData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate secure random string
 */
export const generateSecureRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) return data;
  const visiblePart = data.slice(-visibleChars);
  const maskedPart = '*'.repeat(data.length - visibleChars);
  return maskedPart + visiblePart;
};

/**
 * Check if date is business day in Cameroon
 */
export const isBusinessDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];

  // Check if it's weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Check if it's a holiday
  return !config.cameroon.settlement.holidayDates.includes(dateString);
};

/**
 * Get next business day
 */
export const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
};

/**
 * Calculate settlement date
 */
export const calculateSettlementDate = (transactionDate: Date): Date => {
  const settlementDate = new Date(transactionDate);
  settlementDate.setHours(settlementDate.getHours() + config.cameroon.settlement.delayHours);

  // Ensure it's a business day
  return isBusinessDay(settlementDate) ? settlementDate : getNextBusinessDay(settlementDate);
};

/**
 * Validate USSD session data
 */
export const validateUSSDSession = (sessionData: any): boolean => {
  return (
    sessionData &&
    typeof sessionData.sessionId === 'string' &&
    typeof sessionData.phoneNumber === 'string' &&
    typeof sessionData.currentStep === 'string' &&
    sessionData.expiresAt &&
    new Date(sessionData.expiresAt) > new Date()
  );
};

/**
 * Generate QR code data for payment
 */
export const generateQRCodeData = (
  provider: PaymentProvider,
  amount: number,
  reference: string
): string => {
  const qrData = {
    provider,
    amount,
    currency: CurrencyCode.XAF,
    reference,
    timestamp: Date.now()
  };

  return Buffer.from(JSON.stringify(qrData)).toString('base64');
};

/**
 * Parse QR code data
 */
export const parseQRCodeData = (qrCode: string): any => {
  try {
    const decoded = Buffer.from(qrCode, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    logger.error('Failed to parse QR code data:', error);
    return null;
  }
};

/**
 * Get provider display name
 */
export const getProviderDisplayName = (provider: PaymentProvider): string => {
  const names = {
    [PaymentProvider.MTN_MOBILE_MONEY]: 'MTN Mobile Money',
    [PaymentProvider.ORANGE_MONEY]: 'Orange Money',
    [PaymentProvider.CASH]: 'Cash Payment'
  };

  return names[provider] || provider;
};

/**
 * Check if environment is test
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing';
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>\"']/g, '');
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

/**
 * Convert amount to minor currency units (cents for currencies with decimals)
 * For XAF, this is just the same since it has no decimal places
 */
export const toMinorCurrencyUnits = (amount: number, currency: CurrencyCode = CurrencyCode.XAF): number => {
  if (currency === CurrencyCode.XAF) {
    return Math.round(amount);
  }
  // For other currencies that might be added later
  return Math.round(amount * 100);
};

/**
 * Convert from minor currency units to major units
 */
export const fromMinorCurrencyUnits = (amount: number, currency: CurrencyCode = CurrencyCode.XAF): number => {
  if (currency === CurrencyCode.XAF) {
    return amount;
  }
  // For other currencies that might be added later
  return amount / 100;
};

/**
 * Generate correlation ID for request tracking
 */
export const generateCorrelationId = (): string => {
  return `okd-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
};

/**
 * Check if string is valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Parse user agent for device information
 */
export const parseUserAgent = (userAgent: string): { device: string; platform: string; browser: string } => {
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';

  let platform = 'unknown';
  if (/Android/.test(userAgent)) platform = 'android';
  else if (/iPhone|iPad/.test(userAgent)) platform = 'ios';
  else if (/Windows/.test(userAgent)) platform = 'windows';
  else if (/Mac/.test(userAgent)) platform = 'mac';
  else if (/Linux/.test(userAgent)) platform = 'linux';

  let browser = 'unknown';
  if (/Chrome/.test(userAgent)) browser = 'chrome';
  else if (/Firefox/.test(userAgent)) browser = 'firefox';
  else if (/Safari/.test(userAgent)) browser = 'safari';
  else if (/Edge/.test(userAgent)) browser = 'edge';

  return { device, platform, browser };
};

export default {
  sleep,
  retryOperation,
  generateTransactionReference,
  generatePaymentCode,
  validateAndFormatPhoneNumber,
  isPhoneNumberCompatible,
  calculatePaymentFees,
  calculateMerchantCommission,
  formatCurrency,
  validateAmount,
  generateWebhookSignature,
  verifyWebhookSignature,
  encryptData,
  decryptData,
  hashData,
  generateSecureRandomString,
  maskSensitiveData,
  isBusinessDay,
  getNextBusinessDay,
  calculateSettlementDate,
  validateUSSDSession,
  generateQRCodeData,
  parseQRCodeData,
  getProviderDisplayName,
  isTestEnvironment,
  sanitizeInput,
  toMinorCurrencyUnits,
  fromMinorCurrencyUnits,
  generateCorrelationId,
  isValidUUID,
  parseUserAgent
};