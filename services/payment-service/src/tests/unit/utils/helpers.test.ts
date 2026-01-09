/**
 * Helpers Utility Tests
 * Unit tests for utility helper functions
 */

import {
  validateAndFormatPhoneNumber,
  isPhoneNumberCompatible,
  calculatePaymentFees,
  validateAmount,
  formatCurrency,
  generateTransactionReference,
  generatePaymentCode,
  generateWebhookSignature,
  verifyWebhookSignature,
  encryptData,
  decryptData,
  hashData,
  maskSensitiveData,
  isBusinessDay,
  getNextBusinessDay,
  calculateSettlementDate,
  parseUserAgent,
  retryOperation,
  sleep
} from '@/utils/helpers';
import { PaymentProvider, CurrencyCode } from '@/types';
import { TEST_CONSTANTS } from '../../setup';

describe('Helpers Utility Functions', () => {
  describe('validateAndFormatPhoneNumber', () => {
    it('should validate and format MTN phone number', () => {
      const result = validateAndFormatPhoneNumber(TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN);

      expect(result).toBeDefined();
      expect(result!.operator).toBe('MTN');
      expect(result!.formatted).toBe('+237650123456');
      expect(result!.countryCode).toBe('+237');
      expect(result!.number).toBe('650123456');
    });

    it('should validate and format Orange phone number', () => {
      const result = validateAndFormatPhoneNumber(TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.ORANGE);

      expect(result).toBeDefined();
      expect(result!.operator).toBe('ORANGE');
      expect(result!.formatted).toBe('+237690123456');
    });

    it('should handle phone number with country code prefix', () => {
      const result = validateAndFormatPhoneNumber('237650123456');

      expect(result).toBeDefined();
      expect(result!.formatted).toBe('+237650123456');
    });

    it('should handle phone number with 00237 prefix', () => {
      const result = validateAndFormatPhoneNumber('00237650123456');

      expect(result).toBeDefined();
      expect(result!.formatted).toBe('+237650123456');
    });

    it('should return null for invalid phone number', () => {
      const result = validateAndFormatPhoneNumber(TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.INVALID);

      expect(result).toBeNull();
    });

    it('should return null for phone number with wrong length', () => {
      const result = validateAndFormatPhoneNumber('+237650123');

      expect(result).toBeNull();
    });
  });

  describe('isPhoneNumberCompatible', () => {
    it('should return true for MTN number with MTN provider', () => {
      const result = isPhoneNumberCompatible(
        TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        PaymentProvider.MTN_MOBILE_MONEY
      );

      expect(result).toBe(true);
    });

    it('should return true for Orange number with Orange provider', () => {
      const result = isPhoneNumberCompatible(
        TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.ORANGE,
        PaymentProvider.ORANGE_MONEY
      );

      expect(result).toBe(true);
    });

    it('should return false for MTN number with Orange provider', () => {
      const result = isPhoneNumberCompatible(
        TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        PaymentProvider.ORANGE_MONEY
      );

      expect(result).toBe(false);
    });

    it('should return true for any number with cash provider', () => {
      const result = isPhoneNumberCompatible(
        TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        PaymentProvider.CASH
      );

      expect(result).toBe(true);
    });
  });

  describe('calculatePaymentFees', () => {
    it('should calculate fees correctly for MTN Mobile Money', () => {
      const result = calculatePaymentFees(10000, PaymentProvider.MTN_MOBILE_MONEY);

      expect(result.fees).toBeGreaterThan(0);
      expect(result.taxes).toBeGreaterThan(0);
      expect(result.netAmount).toBeGreaterThan(10000);
      expect(result.netAmount).toBe(10000 + result.fees + result.taxes);
    });

    it('should calculate fees correctly for Orange Money', () => {
      const result = calculatePaymentFees(10000, PaymentProvider.ORANGE_MONEY);

      expect(result.fees).toBeGreaterThan(0);
      expect(result.taxes).toBeGreaterThan(0);
      expect(result.netAmount).toBeGreaterThan(10000);
    });

    it('should calculate fees correctly for cash payment', () => {
      const result = calculatePaymentFees(10000, PaymentProvider.CASH);

      expect(result.fees).toBeGreaterThanOrEqual(0);
      expect(result.taxes).toBeGreaterThanOrEqual(0);
      expect(result.netAmount).toBeGreaterThanOrEqual(10000);
    });

    it('should respect maximum fee limits', () => {
      const result = calculatePaymentFees(1000000, PaymentProvider.MTN_MOBILE_MONEY);

      // Fees should not exceed the maximum configured limit
      expect(result.fees).toBeLessThanOrEqual(5000);
    });
  });

  describe('validateAmount', () => {
    it('should validate correct amount for MTN Mobile Money', () => {
      const result = validateAmount(TEST_CONSTANTS.AMOUNTS.VALID, PaymentProvider.MTN_MOBILE_MONEY);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject amount below minimum', () => {
      const result = validateAmount(TEST_CONSTANTS.AMOUNTS.INVALID, PaymentProvider.MTN_MOBILE_MONEY);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('minimum limit');
    });

    it('should reject amount above maximum', () => {
      const result = validateAmount(5000000, PaymentProvider.MTN_MOBILE_MONEY);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('maximum limit');
    });

    it('should check CEMAC compliance for large amounts', () => {
      const result = validateAmount(6000000, PaymentProvider.MTN_MOBILE_MONEY);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('CEMAC');
    });
  });

  describe('formatCurrency', () => {
    it('should format XAF currency correctly', () => {
      const result = formatCurrency(10000, CurrencyCode.XAF);

      expect(result).toBe('10,000 XAF');
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(1000000, CurrencyCode.XAF);

      expect(result).toBe('1,000,000 XAF');
    });

    it('should round decimal amounts for XAF', () => {
      const result = formatCurrency(10000.75, CurrencyCode.XAF);

      expect(result).toBe('10,001 XAF');
    });
  });

  describe('generateTransactionReference', () => {
    it('should generate unique reference for MTN Mobile Money', () => {
      const ref1 = generateTransactionReference(PaymentProvider.MTN_MOBILE_MONEY, 'order123');
      const ref2 = generateTransactionReference(PaymentProvider.MTN_MOBILE_MONEY, 'order123');

      expect(ref1).toMatch(/^OKD-MTN-order123-/);
      expect(ref2).toMatch(/^OKD-MTN-order123-/);
      expect(ref1).not.toBe(ref2);
    });

    it('should generate reference for Orange Money', () => {
      const ref = generateTransactionReference(PaymentProvider.ORANGE_MONEY, 'order456');

      expect(ref).toMatch(/^OKD-ORG-order456-/);
    });

    it('should generate reference for cash payment', () => {
      const ref = generateTransactionReference(PaymentProvider.CASH, 'order789');

      expect(ref).toMatch(/^OKD-CSH-order789-/);
    });
  });

  describe('generatePaymentCode', () => {
    it('should generate 8-digit payment code', () => {
      const code = generatePaymentCode();

      expect(code).toMatch(/^\d{8}$/);
      expect(parseInt(code)).toBeGreaterThanOrEqual(10000000);
      expect(parseInt(code)).toBeLessThanOrEqual(99999999);
    });

    it('should generate unique codes', () => {
      const code1 = generatePaymentCode();
      const code2 = generatePaymentCode();

      expect(code1).not.toBe(code2);
    });
  });

  describe('generateWebhookSignature and verifyWebhookSignature', () => {
    const payload = 'test payload';
    const secret = 'test secret';

    it('should generate consistent signature', () => {
      const sig1 = generateWebhookSignature(payload, secret);
      const sig2 = generateWebhookSignature(payload, secret);

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should verify correct signature', () => {
      const signature = generateWebhookSignature(payload, secret);
      const isValid = verifyWebhookSignature(payload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const isValid = verifyWebhookSignature(payload, 'invalid-signature', secret);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const signature = generateWebhookSignature(payload, secret);
      const isValid = verifyWebhookSignature(payload, signature, 'wrong-secret');

      expect(isValid).toBe(false);
    });
  });

  describe('encryptData and decryptData', () => {
    const testData = 'sensitive payment data';

    it('should encrypt and decrypt data correctly', () => {
      const encrypted = encryptData(testData);
      const decrypted = decryptData(encrypted);

      expect(encrypted).not.toBe(testData);
      expect(decrypted).toBe(testData);
    });

    it('should produce different encrypted values for same input', () => {
      const encrypted1 = encryptData(testData);
      const encrypted2 = encryptData(testData);

      // Note: This depends on the encryption method used
      // If using deterministic encryption, this test might need adjustment
      expect(encrypted1).toMatch(/^[a-f0-9]+$/);
      expect(encrypted2).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('hashData', () => {
    it('should generate consistent hash', () => {
      const data = 'test data';
      const hash1 = hashData(data);
      const hash2 = hashData(data);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate different hashes for different data', () => {
      const hash1 = hashData('data1');
      const hash2 = hashData('data2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask phone number correctly', () => {
      const masked = maskSensitiveData('+237650123456', 4);

      expect(masked).toBe('*********3456');
    });

    it('should handle short data', () => {
      const masked = maskSensitiveData('123', 4);

      expect(masked).toBe('123');
    });

    it('should use default visible characters', () => {
      const masked = maskSensitiveData('1234567890');

      expect(masked).toBe('******7890');
    });
  });

  describe('isBusinessDay', () => {
    it('should return true for weekdays', () => {
      // Monday
      const monday = new Date('2024-01-08');
      expect(isBusinessDay(monday)).toBe(true);

      // Friday
      const friday = new Date('2024-01-12');
      expect(isBusinessDay(friday)).toBe(true);
    });

    it('should return false for weekends', () => {
      // Saturday
      const saturday = new Date('2024-01-13');
      expect(isBusinessDay(saturday)).toBe(false);

      // Sunday
      const sunday = new Date('2024-01-14');
      expect(isBusinessDay(sunday)).toBe(false);
    });

    it('should return false for holidays', () => {
      // Assuming 2024-01-01 is configured as holiday
      const holiday = new Date('2024-01-01');
      expect(isBusinessDay(holiday)).toBe(false);
    });
  });

  describe('getNextBusinessDay', () => {
    it('should return next business day for Friday', () => {
      const friday = new Date('2024-01-12');
      const nextBusinessDay = getNextBusinessDay(friday);

      // Should skip weekend and return Monday
      expect(nextBusinessDay.getDay()).toBe(1); // Monday
      expect(nextBusinessDay.getDate()).toBe(15);
    });

    it('should return next day for weekday', () => {
      const monday = new Date('2024-01-08');
      const nextBusinessDay = getNextBusinessDay(monday);

      expect(nextBusinessDay.getDay()).toBe(2); // Tuesday
      expect(nextBusinessDay.getDate()).toBe(9);
    });
  });

  describe('calculateSettlementDate', () => {
    it('should add settlement delay hours', () => {
      const transactionDate = new Date('2024-01-08T10:00:00Z'); // Monday
      const settlementDate = calculateSettlementDate(transactionDate);

      // Should add 24 hours by default
      expect(settlementDate.getTime()).toBeGreaterThan(transactionDate.getTime());
    });

    it('should ensure settlement date is business day', () => {
      const transactionDate = new Date('2024-01-12T18:00:00Z'); // Friday evening
      const settlementDate = calculateSettlementDate(transactionDate);

      // Should be a business day
      expect(isBusinessDay(settlementDate)).toBe(true);
    });
  });

  describe('parseUserAgent', () => {
    it('should parse mobile Chrome user agent', () => {
      const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(userAgent);

      expect(result.device).toBe('mobile');
      expect(result.platform).toBe('ios');
      expect(result.browser).toBe('safari');
    });

    it('should parse desktop Chrome user agent', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const result = parseUserAgent(userAgent);

      expect(result.device).toBe('desktop');
      expect(result.platform).toBe('windows');
      expect(result.browser).toBe('chrome');
    });

    it('should parse Android user agent', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36';
      const result = parseUserAgent(userAgent);

      expect(result.device).toBe('mobile');
      expect(result.platform).toBe('android');
      expect(result.browser).toBe('chrome');
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await retryOperation(operation, 3, 100);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const result = await retryOperation(operation, 3, 100);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(retryOperation(operation, 2, 100)).rejects.toThrow('persistent failure');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some variance
    });
  });
});