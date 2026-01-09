/**
 * Fraud Detection Service
 * AI-powered fraud detection and risk assessment for payment transactions
 */

import {
  PaymentRequest,
  FraudDetectionResult,
  FraudRiskLevel,
  FraudError,
  PaymentProvider,
  CameroonPhoneNumber
} from '@/types';
import { logger, logFraudDetection } from '@/utils/logger';
import {
  validateAndFormatPhoneNumber,
  hashData,
  parseUserAgent,
  isTestEnvironment
} from '@/utils/helpers';
import { config } from '@/config';

interface FraudRule {
  name: string;
  weight: number;
  check: (context: FraudContext) => Promise<{ triggered: boolean; score: number; reason?: string }>;
}

interface FraudContext {
  request: PaymentRequest;
  phoneInfo?: CameroonPhoneNumber;
  deviceInfo?: {
    fingerprint?: string;
    userAgent?: string;
    ipAddress?: string;
    device: string;
    platform: string;
    browser: string;
  };
  customerHistory?: {
    totalTransactions: number;
    totalAmount: number;
    failedTransactions: number;
    firstTransactionDate?: Date;
    lastTransactionDate?: Date;
    averageAmount: number;
    frequentProviders: PaymentProvider[];
  };
  recentActivity?: {
    transactionsLast24h: number;
    amountLast24h: number;
    transactionsLastHour: number;
    failedAttemptsLast24h: number;
  };
}

export class FraudDetectionService {
  private rules: FraudRule[];

  constructor() {
    this.initializeRules();
  }

  /**
   * Analyze payment request for fraud risk
   */
  public async analyzePaymentRisk(
    request: PaymentRequest,
    context: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
    } = {}
  ): Promise<FraudDetectionResult> {
    try {
      if (!config.fraudDetection.enabled) {
        return {
          score: 0,
          riskLevel: FraudRiskLevel.LOW,
          reasons: [],
          recommendations: [],
          blocked: false
        };
      }

      // Build fraud context
      const fraudContext = await this.buildFraudContext(request, context);

      // Run fraud rules
      const ruleResults = await this.executeRules(fraudContext);

      // Calculate overall risk score
      const totalScore = ruleResults.reduce((sum, result) => sum + result.score, 0);
      const normalizedScore = Math.min(100, Math.max(0, totalScore));

      // Determine risk level
      const riskLevel = this.determineRiskLevel(normalizedScore);

      // Extract reasons and recommendations
      const reasons = ruleResults
        .filter(r => r.triggered && r.reason)
        .map(r => r.reason!);

      const recommendations = this.generateRecommendations(riskLevel, reasons);

      // Determine if transaction should be blocked
      const blocked = this.shouldBlockTransaction(normalizedScore, riskLevel, reasons);

      const result: FraudDetectionResult = {
        score: normalizedScore,
        riskLevel,
        reasons,
        recommendations,
        blocked
      };

      // Log fraud detection result
      logFraudDetection('Fraud risk assessment completed', {
        transactionId: '', // Would be set by caller
        riskScore: normalizedScore,
        riskLevel,
        reasons
      });

      // Throw fraud error if transaction should be blocked
      if (blocked) {
        throw new FraudError(
          'Transaction blocked due to high fraud risk',
          riskLevel,
          result
        );
      }

      return result;
    } catch (error) {
      if (error instanceof FraudError) {
        throw error;
      }

      logger.error('Fraud detection analysis failed:', {
        error: error.message,
        orderId: request.orderId,
        customerId: request.customerId
      });

      // In case of error, default to allowing transaction with medium risk
      return {
        score: 50,
        riskLevel: FraudRiskLevel.MEDIUM,
        reasons: ['Fraud detection service temporarily unavailable'],
        recommendations: ['Manual review recommended'],
        blocked: false
      };
    }
  }

  /**
   * Initialize fraud detection rules
   */
  private initializeRules(): void {
    this.rules = [
      {
        name: 'High Amount Transaction',
        weight: 25,
        check: async (context) => {
          const amount = context.request.amount;
          const threshold = config.fraudDetection.maxSingleTransactionAmount;

          if (amount > threshold) {
            return {
              triggered: true,
              score: 30,
              reason: `Transaction amount (${amount}) exceeds single transaction threshold`
            };
          }

          // Score based on amount relative to threshold
          const score = Math.min(20, (amount / threshold) * 20);
          return { triggered: score > 10, score };
        }
      },

      {
        name: 'Velocity Check',
        weight: 20,
        check: async (context) => {
          const recent = context.recentActivity;
          if (!recent) return { triggered: false, score: 0 };

          const velocityThreshold = config.fraudDetection.suspiciousVelocityThreshold;
          let score = 0;
          let reasons: string[] = [];

          // Check transaction frequency
          if (recent.transactionsLast24h > velocityThreshold) {
            score += 25;
            reasons.push(`High transaction frequency: ${recent.transactionsLast24h} in 24h`);
          }

          if (recent.transactionsLastHour > 5) {
            score += 20;
            reasons.push(`Very high frequency: ${recent.transactionsLastHour} in 1h`);
          }

          // Check failed attempts
          if (recent.failedAttemptsLast24h > 3) {
            score += 15;
            reasons.push(`Multiple failed attempts: ${recent.failedAttemptsLast24h} in 24h`);
          }

          return {
            triggered: score > 0,
            score,
            reason: reasons.join('; ')
          };
        }
      },

      {
        name: 'Phone Number Analysis',
        weight: 15,
        check: async (context) => {
          const phoneInfo = context.phoneInfo;
          if (!phoneInfo) return { triggered: false, score: 0 };

          let score = 0;
          let reasons: string[] = [];

          // Check if phone number is in blacklist
          const blacklistedPhones = config.fraudDetection.blacklistedPhones;
          if (blacklistedPhones.includes(phoneInfo.formatted)) {
            score += 50;
            reasons.push('Phone number is blacklisted');
          }

          // Check provider compatibility
          const request = context.request;
          if (
            (request.provider === PaymentProvider.MTN_MOBILE_MONEY && phoneInfo.operator !== 'MTN') ||
            (request.provider === PaymentProvider.ORANGE_MONEY && phoneInfo.operator !== 'ORANGE')
          ) {
            score += 30;
            reasons.push('Phone number operator mismatch with payment provider');
          }

          return {
            triggered: score > 0,
            score,
            reason: reasons.join('; ')
          };
        }
      },

      {
        name: 'Device Fingerprint Analysis',
        weight: 10,
        check: async (context) => {
          const deviceInfo = context.deviceInfo;
          if (!deviceInfo) return { triggered: false, score: 0 };

          let score = 0;
          let reasons: string[] = [];

          // Check for suspicious user agents
          const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
          const userAgent = deviceInfo.userAgent?.toLowerCase() || '';

          if (suspiciousAgents.some(agent => userAgent.includes(agent))) {
            score += 25;
            reasons.push('Suspicious user agent detected');
          }

          // Check device consistency
          if (deviceInfo.device === 'mobile' && deviceInfo.platform === 'desktop') {
            score += 15;
            reasons.push('Device type inconsistency detected');
          }

          return {
            triggered: score > 0,
            score,
            reason: reasons.join('; ')
          };
        }
      },

      {
        name: 'Customer Behavior Analysis',
        weight: 15,
        check: async (context) => {
          const history = context.customerHistory;
          if (!history) return { triggered: false, score: 0 };

          let score = 0;
          let reasons: string[] = [];

          // New customer with large transaction
          if (history.totalTransactions < 3 && context.request.amount > 100000) {
            score += 20;
            reasons.push('New customer attempting large transaction');
          }

          // High failure rate
          const failureRate = history.failedTransactions / Math.max(history.totalTransactions, 1);
          if (failureRate > 0.3) {
            score += 15;
            reasons.push(`High transaction failure rate: ${(failureRate * 100).toFixed(1)}%`);
          }

          // Unusual amount deviation
          if (history.averageAmount > 0) {
            const deviation = Math.abs(context.request.amount - history.averageAmount) / history.averageAmount;
            if (deviation > 3) {
              score += 10;
              reasons.push(`Transaction amount significantly deviates from customer average`);
            }
          }

          return {
            triggered: score > 0,
            score,
            reason: reasons.join('; ')
          };
        }
      },

      {
        name: 'IP Address Analysis',
        weight: 10,
        check: async (context) => {
          const ipAddress = context.deviceInfo?.ipAddress;
          if (!ipAddress) return { triggered: false, score: 0 };

          let score = 0;
          let reasons: string[] = [];

          // Check IP whitelist
          const whitelist = config.fraudDetection.ipWhitelist;
          if (whitelist.length > 0 && !whitelist.includes(ipAddress)) {
            score += 10;
            reasons.push('IP address not in whitelist');
          }

          // Check for known malicious IPs (would be maintained in database)
          // For now, we'll check for localhost in production
          if (config.isProduction() && (ipAddress === '127.0.0.1' || ipAddress === '::1')) {
            score += 30;
            reasons.push('Suspicious IP address detected');
          }

          return {
            triggered: score > 0,
            score,
            reason: reasons.join('; ')
          };
        }
      },

      {
        name: 'Time-based Analysis',
        weight: 5,
        check: async (context) => {
          const now = new Date();
          const hour = now.getHours();
          let score = 0;
          let reasons: string[] = [];

          // Transactions during unusual hours (midnight to 5 AM)
          if (hour >= 0 && hour < 5) {
            score += 10;
            reasons.push('Transaction during unusual hours');
          }

          // Weekend large transactions
          const dayOfWeek = now.getDay();
          if ((dayOfWeek === 0 || dayOfWeek === 6) && context.request.amount > 500000) {
            score += 5;
            reasons.push('Large weekend transaction');
          }

          return {
            triggered: score > 0,
            score,
            reason: reasons.join('; ')
          };
        }
      }
    ];
  }

  /**
   * Build fraud context from request and additional data
   */
  private async buildFraudContext(
    request: PaymentRequest,
    context: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
    }
  ): Promise<FraudContext> {
    const fraudContext: FraudContext = { request };

    // Parse phone number if provided
    if (request.phoneNumber) {
      fraudContext.phoneInfo = validateAndFormatPhoneNumber(request.phoneNumber) || undefined;
    }

    // Parse device information
    if (context.userAgent || context.ipAddress || context.deviceFingerprint) {
      const userAgentInfo = context.userAgent ? parseUserAgent(context.userAgent) : {
        device: 'unknown',
        platform: 'unknown',
        browser: 'unknown'
      };

      fraudContext.deviceInfo = {
        ...userAgentInfo,
        fingerprint: context.deviceFingerprint,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress
      };
    }

    // In a real implementation, these would be retrieved from database
    fraudContext.customerHistory = await this.getCustomerHistory(request.customerId);
    fraudContext.recentActivity = await this.getRecentActivity(request.customerId);

    return fraudContext;
  }

  /**
   * Execute all fraud rules
   */
  private async executeRules(context: FraudContext): Promise<Array<{
    name: string;
    triggered: boolean;
    score: number;
    reason?: string;
  }>> {
    const results = [];

    for (const rule of this.rules) {
      try {
        const result = await rule.check(context);
        results.push({
          name: rule.name,
          triggered: result.triggered,
          score: result.score,
          reason: result.reason
        });
      } catch (error) {
        logger.error(`Fraud rule '${rule.name}' failed:`, error);
        // Continue with other rules
      }
    }

    return results;
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): FraudRiskLevel {
    if (score >= 80) return FraudRiskLevel.CRITICAL;
    if (score >= 60) return FraudRiskLevel.HIGH;
    if (score >= 30) return FraudRiskLevel.MEDIUM;
    return FraudRiskLevel.LOW;
  }

  /**
   * Generate recommendations based on risk assessment
   */
  private generateRecommendations(riskLevel: FraudRiskLevel, reasons: string[]): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case FraudRiskLevel.CRITICAL:
        recommendations.push('Block transaction immediately');
        recommendations.push('Investigate customer account');
        recommendations.push('Contact customer for verification');
        break;

      case FraudRiskLevel.HIGH:
        recommendations.push('Require additional verification');
        recommendations.push('Manual review required');
        recommendations.push('Consider temporary account restrictions');
        break;

      case FraudRiskLevel.MEDIUM:
        recommendations.push('Enhanced monitoring');
        recommendations.push('Consider SMS verification');
        recommendations.push('Review customer history');
        break;

      case FraudRiskLevel.LOW:
        recommendations.push('Standard processing');
        recommendations.push('Continue monitoring');
        break;
    }

    // Add specific recommendations based on reasons
    if (reasons.some(r => r.includes('blacklisted'))) {
      recommendations.push('Verify customer identity immediately');
    }

    if (reasons.some(r => r.includes('velocity'))) {
      recommendations.push('Implement cooling-off period');
    }

    if (reasons.some(r => r.includes('amount'))) {
      recommendations.push('Verify transaction legitimacy');
    }

    return recommendations;
  }

  /**
   * Determine if transaction should be blocked
   */
  private shouldBlockTransaction(
    score: number,
    riskLevel: FraudRiskLevel,
    reasons: string[]
  ): boolean {
    // Block if score exceeds threshold
    if (score >= config.fraudDetection.riskScoreThreshold) {
      return true;
    }

    // Block if critical risk level
    if (riskLevel === FraudRiskLevel.CRITICAL) {
      return true;
    }

    // Block if phone number is blacklisted
    if (reasons.some(r => r.includes('blacklisted'))) {
      return true;
    }

    // Block if suspicious user agent
    if (reasons.some(r => r.includes('bot') || r.includes('crawler'))) {
      return true;
    }

    return false;
  }

  /**
   * Get customer transaction history (mock implementation)
   */
  private async getCustomerHistory(customerId: string): Promise<FraudContext['customerHistory']> {
    // In a real implementation, this would query the database
    // For now, return mock data for testing
    if (isTestEnvironment()) {
      return {
        totalTransactions: 5,
        totalAmount: 500000,
        failedTransactions: 1,
        firstTransactionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastTransactionDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        averageAmount: 100000,
        frequentProviders: [PaymentProvider.MTN_MOBILE_MONEY]
      };
    }

    return undefined;
  }

  /**
   * Get recent customer activity (mock implementation)
   */
  private async getRecentActivity(customerId: string): Promise<FraudContext['recentActivity']> {
    // In a real implementation, this would query the database
    // For now, return mock data for testing
    if (isTestEnvironment()) {
      return {
        transactionsLast24h: 2,
        amountLast24h: 200000,
        transactionsLastHour: 1,
        failedAttemptsLast24h: 0
      };
    }

    return undefined;
  }

  /**
   * Add phone number to blacklist
   */
  public async blacklistPhoneNumber(phoneNumber: string, reason: string): Promise<void> {
    const formatted = validateAndFormatPhoneNumber(phoneNumber);
    if (!formatted) {
      throw new Error('Invalid phone number format');
    }

    // In a real implementation, this would update the database
    logger.info('Phone number blacklisted', {
      phoneNumber: formatted.formatted,
      reason
    });
  }

  /**
   * Remove phone number from blacklist
   */
  public async whitelistPhoneNumber(phoneNumber: string): Promise<void> {
    const formatted = validateAndFormatPhoneNumber(phoneNumber);
    if (!formatted) {
      throw new Error('Invalid phone number format');
    }

    // In a real implementation, this would update the database
    logger.info('Phone number whitelisted', {
      phoneNumber: formatted.formatted
    });
  }

  /**
   * Get fraud statistics
   */
  public async getFraudStatistics(period: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalTransactions: number;
    blockedTransactions: number;
    fraudRate: number;
    riskDistribution: { [key in FraudRiskLevel]: number };
  }> {
    // In a real implementation, this would query the database
    return {
      totalTransactions: 1000,
      blockedTransactions: 15,
      fraudRate: 0.015,
      riskDistribution: {
        [FraudRiskLevel.LOW]: 850,
        [FraudRiskLevel.MEDIUM]: 120,
        [FraudRiskLevel.HIGH]: 25,
        [FraudRiskLevel.CRITICAL]: 5
      }
    };
  }
}