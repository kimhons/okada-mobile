/**
 * Fraud Detection Service Tests
 * Unit tests for fraud detection and risk assessment
 */

import { FraudDetectionService } from '@/services/fraud-detection';
import { PaymentProvider, FraudRiskLevel, FraudError } from '@/types';
import { createMockPaymentRequest, TEST_CONSTANTS } from '../../setup';

describe('FraudDetectionService', () => {
  let fraudDetectionService: FraudDetectionService;

  beforeEach(() => {
    fraudDetectionService = new FraudDetectionService();

    // Enable fraud detection for tests
    process.env.FRAUD_DETECTION_ENABLED = 'true';
    process.env.RISK_SCORE_THRESHOLD = '75';
    process.env.MAX_SINGLE_TRANSACTION_AMOUNT = '1000000';
    process.env.SUSPICIOUS_VELOCITY_THRESHOLD = '10';
  });

  describe('analyzePaymentRisk', () => {
    it('should return low risk for normal payment request', async () => {
      const paymentRequest = createMockPaymentRequest({
        amount: TEST_CONSTANTS.AMOUNTS.VALID,
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      const result = await fraudDetectionService.analyzePaymentRisk(paymentRequest);

      expect(result.riskLevel).toBe(FraudRiskLevel.LOW);
      expect(result.score).toBeLessThan(30);
      expect(result.blocked).toBe(false);
      expect(result.reasons).toHaveLength(0);
      expect(result.recommendations).toContain('Standard processing');
    });

    it('should detect high amount transaction risk', async () => {
      const paymentRequest = createMockPaymentRequest({
        amount: 1500000, // Above threshold
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.MTN_MOBILE_MONEY
      });

      const result = await fraudDetectionService.analyzePaymentRisk(paymentRequest);

      expect(result.score).toBeGreaterThan(20);
      expect(result.reasons).toContain(expect.stringMatching(/amount.*exceeds.*threshold/i));
      expect(result.recommendations).toContain('Verify transaction legitimacy');
    });

    it('should detect phone number operator mismatch', async () => {
      const paymentRequest = createMockPaymentRequest({
        amount: TEST_CONSTANTS.AMOUNTS.VALID,
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.ORANGE_MONEY // Mismatch
      });

      const result = await fraudDetectionService.analyzePaymentRisk(paymentRequest);

      expect(result.score).toBeGreaterThan(25);
      expect(result.reasons).toContain(expect.stringMatching(/operator mismatch/i));
    });

    it('should detect suspicious user agent', async () => {
      const paymentRequest = createMockPaymentRequest();
      const context = {
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        ipAddress: '192.168.1.1'
      };

      const result = await fraudDetectionService.analyzePaymentRisk(paymentRequest, context);

      expect(result.score).toBeGreaterThan(20);
      expect(result.reasons).toContain(expect.stringMatching(/suspicious user agent/i));
    });

    it('should detect unusual time-based patterns', async () => {
      // Mock current time to be 2 AM
      const originalDate = Date;
      const mockDate = new Date('2024-01-01T02:00:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      const paymentRequest = createMockPaymentRequest();

      const result = await fraudDetectionService.analyzePaymentRisk(paymentRequest);

      expect(result.score).toBeGreaterThan(5);
      expect(result.reasons).toContain(expect.stringMatching(/unusual hours/i));

      // Restore original Date
      global.Date = originalDate;
    });

    it('should block transaction when fraud score exceeds threshold', async () => {
      const paymentRequest = createMockPaymentRequest({
        amount: 2000000, // Very high amount
        phoneNumber: TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
        provider: PaymentProvider.ORANGE_MONEY // Operator mismatch
      });

      const context = {
        userAgent: 'bot-user-agent',
        ipAddress: '127.0.0.1'
      };

      await expect(
        fraudDetectionService.analyzePaymentRisk(paymentRequest, context)
      ).rejects.toThrow(FraudError);
    });

    it('should handle disabled fraud detection', async () => {
      process.env.FRAUD_DETECTION_ENABLED = 'false';
      const service = new FraudDetectionService();

      const paymentRequest = createMockPaymentRequest({
        amount: 2000000 // This would normally trigger fraud detection
      });

      const result = await service.analyzePaymentRisk(paymentRequest);

      expect(result.score).toBe(0);
      expect(result.riskLevel).toBe(FraudRiskLevel.LOW);
      expect(result.blocked).toBe(false);
    });

    it('should generate appropriate recommendations for different risk levels', async () => {
      const paymentRequest = createMockPaymentRequest({
        amount: 800000 // Medium risk amount
      });

      const result = await fraudDetectionService.analyzePaymentRisk(paymentRequest);

      if (result.riskLevel === FraudRiskLevel.MEDIUM) {
        expect(result.recommendations).toContain('Enhanced monitoring');
        expect(result.recommendations).toContain('Consider SMS verification');
      } else if (result.riskLevel === FraudRiskLevel.HIGH) {
        expect(result.recommendations).toContain('Manual review required');
        expect(result.recommendations).toContain('Require additional verification');
      }
    });

    it('should handle errors gracefully', async () => {
      // Mock an error in rule execution
      const service = new FraudDetectionService();
      const originalExecuteRules = (service as any).executeRules;

      (service as any).executeRules = jest.fn().mockRejectedValue(new Error('Rule execution failed'));

      const paymentRequest = createMockPaymentRequest();

      const result = await service.analyzePaymentRisk(paymentRequest);

      // Should return safe default values
      expect(result.score).toBe(50);
      expect(result.riskLevel).toBe(FraudRiskLevel.MEDIUM);
      expect(result.blocked).toBe(false);
      expect(result.reasons).toContain('Fraud detection service temporarily unavailable');

      // Restore original method
      (service as any).executeRules = originalExecuteRules;
    });
  });

  describe('blacklistPhoneNumber', () => {
    it('should blacklist a valid phone number', async () => {
      await expect(
        fraudDetectionService.blacklistPhoneNumber(
          TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN,
          'Suspicious activity detected'
        )
      ).resolves.not.toThrow();
    });

    it('should reject invalid phone number format', async () => {
      await expect(
        fraudDetectionService.blacklistPhoneNumber(
          TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.INVALID,
          'Test reason'
        )
      ).rejects.toThrow('Invalid phone number format');
    });
  });

  describe('whitelistPhoneNumber', () => {
    it('should whitelist a valid phone number', async () => {
      await expect(
        fraudDetectionService.whitelistPhoneNumber(
          TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.MTN
        )
      ).resolves.not.toThrow();
    });

    it('should reject invalid phone number format', async () => {
      await expect(
        fraudDetectionService.whitelistPhoneNumber(
          TEST_CONSTANTS.CAMEROON_PHONE_NUMBERS.INVALID
        )
      ).rejects.toThrow('Invalid phone number format');
    });
  });

  describe('getFraudStatistics', () => {
    it('should return fraud statistics for different periods', async () => {
      const dayStats = await fraudDetectionService.getFraudStatistics('day');

      expect(dayStats).toMatchObject({
        totalTransactions: expect.any(Number),
        blockedTransactions: expect.any(Number),
        fraudRate: expect.any(Number),
        riskDistribution: expect.objectContaining({
          [FraudRiskLevel.LOW]: expect.any(Number),
          [FraudRiskLevel.MEDIUM]: expect.any(Number),
          [FraudRiskLevel.HIGH]: expect.any(Number),
          [FraudRiskLevel.CRITICAL]: expect.any(Number)
        })
      });

      expect(dayStats.fraudRate).toBeGreaterThanOrEqual(0);
      expect(dayStats.fraudRate).toBeLessThanOrEqual(1);
    });

    it('should return statistics for week and month periods', async () => {
      const weekStats = await fraudDetectionService.getFraudStatistics('week');
      const monthStats = await fraudDetectionService.getFraudStatistics('month');

      expect(weekStats).toBeDefined();
      expect(monthStats).toBeDefined();
      expect(weekStats.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(monthStats.totalTransactions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('fraud rule evaluation', () => {
    it('should evaluate velocity check rule', async () => {
      const paymentRequest = createMockPaymentRequest();

      // Mock high recent activity
      const service = new FraudDetectionService();
      const originalGetRecentActivity = (service as any).getRecentActivity;

      (service as any).getRecentActivity = jest.fn().mockResolvedValue({
        transactionsLast24h: 15, // Above threshold
        amountLast24h: 500000,
        transactionsLastHour: 3,
        failedAttemptsLast24h: 5
      });

      const result = await service.analyzePaymentRisk(paymentRequest);

      expect(result.score).toBeGreaterThan(20);
      expect(result.reasons).toContain(expect.stringMatching(/transaction frequency/i));

      // Restore original method
      (service as any).getRecentActivity = originalGetRecentActivity;
    });

    it('should evaluate customer behavior rule', async () => {
      const paymentRequest = createMockPaymentRequest({
        amount: 500000 // Large amount for new customer
      });

      const service = new FraudDetectionService();
      const originalGetCustomerHistory = (service as any).getCustomerHistory;

      // Mock new customer with few transactions
      (service as any).getCustomerHistory = jest.fn().mockResolvedValue({
        totalTransactions: 1, // New customer
        totalAmount: 10000,
        failedTransactions: 0,
        averageAmount: 10000,
        frequentProviders: [PaymentProvider.MTN_MOBILE_MONEY]
      });

      const result = await service.analyzePaymentRisk(paymentRequest);

      expect(result.score).toBeGreaterThan(15);
      expect(result.reasons).toContain(expect.stringMatching(/new customer.*large transaction/i));

      // Restore original method
      (service as any).getCustomerHistory = originalGetCustomerHistory;
    });

    it('should evaluate device fingerprint rule', async () => {
      const paymentRequest = createMockPaymentRequest();
      const context = {
        userAgent: 'Mozilla/5.0 (Mobile; Device) WebKit/537.36',
        deviceFingerprint: 'test-fingerprint'
      };

      // Mock device inconsistency (mobile user agent with desktop platform)
      const service = new FraudDetectionService();
      const originalParseUserAgent = require('@/utils/helpers').parseUserAgent;

      jest.mock('@/utils/helpers', () => ({
        ...jest.requireActual('@/utils/helpers'),
        parseUserAgent: jest.fn().mockReturnValue({
          device: 'mobile',
          platform: 'desktop', // Inconsistency
          browser: 'chrome'
        })
      }));

      const result = await service.analyzePaymentRisk(paymentRequest, context);

      expect(result.score).toBeGreaterThan(10);

      // Restore original function
      jest.unmock('@/utils/helpers');
    });
  });

  describe('risk level determination', () => {
    it('should correctly map scores to risk levels', () => {
      const service = new FraudDetectionService();
      const determineRiskLevel = (service as any).determineRiskLevel;

      expect(determineRiskLevel(10)).toBe(FraudRiskLevel.LOW);
      expect(determineRiskLevel(40)).toBe(FraudRiskLevel.MEDIUM);
      expect(determineRiskLevel(65)).toBe(FraudRiskLevel.HIGH);
      expect(determineRiskLevel(85)).toBe(FraudRiskLevel.CRITICAL);
    });

    it('should generate blocking decisions correctly', () => {
      const service = new FraudDetectionService();
      const shouldBlockTransaction = (service as any).shouldBlockTransaction;

      // High score should block
      expect(shouldBlockTransaction(80, FraudRiskLevel.HIGH, [])).toBe(true);

      // Critical risk should block
      expect(shouldBlockTransaction(50, FraudRiskLevel.CRITICAL, [])).toBe(true);

      // Blacklisted phone should block
      expect(shouldBlockTransaction(30, FraudRiskLevel.MEDIUM, ['blacklisted'])).toBe(true);

      // Bot user agent should block
      expect(shouldBlockTransaction(40, FraudRiskLevel.MEDIUM, ['bot detected'])).toBe(true);

      // Low risk should not block
      expect(shouldBlockTransaction(20, FraudRiskLevel.LOW, [])).toBe(false);
    });
  });
});