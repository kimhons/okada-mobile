/**
 * Payment Gateway Service
 * Abstraction layer that handles routing to different payment providers
 */

import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  TransactionStatus,
  PaymentProvider,
  PaymentMethod,
  PaymentError,
  ValidationError,
  ProviderError
} from '@/types';
import { MTNMobileMoneyClient } from '@/providers/mtn/client';
import { OrangeMoneyClient } from '@/providers/orange/client';
import { CashPaymentProcessor } from '@/providers/cash/processor';
import { logger, logPaymentRequest, logPaymentResponse, logProviderError } from '@/utils/logger';
import {
  validateAndFormatPhoneNumber,
  isPhoneNumberCompatible,
  validateAmount,
  generateTransactionReference,
  sanitizeInput
} from '@/utils/helpers';
import { config } from '@/config';

export class PaymentGatewayService {
  private mtnClient: MTNMobileMoneyClient;
  private orangeClient: OrangeMoneyClient;
  private cashProcessor: CashPaymentProcessor;

  constructor() {
    this.mtnClient = new MTNMobileMoneyClient();
    this.orangeClient = new OrangeMoneyClient();
    this.cashProcessor = new CashPaymentProcessor();
  }

  /**
   * Process payment request through appropriate provider
   */
  public async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Sanitize input data
      const sanitizedRequest = sanitizeInput(request) as PaymentRequest;

      // Validate request
      await this.validatePaymentRequest(sanitizedRequest);

      // Log payment request
      logPaymentRequest('Payment request received', {
        orderId: sanitizedRequest.orderId,
        customerId: sanitizedRequest.customerId,
        amount: sanitizedRequest.amount,
        currency: sanitizedRequest.currency,
        provider: sanitizedRequest.provider,
        method: sanitizedRequest.method
      });

      // Route to appropriate provider
      let response: PaymentResponse;

      switch (sanitizedRequest.provider) {
        case PaymentProvider.MTN_MOBILE_MONEY:
          response = await this.mtnClient.requestToPay(sanitizedRequest);
          break;

        case PaymentProvider.ORANGE_MONEY:
          response = await this.orangeClient.initiatePayment(sanitizedRequest);
          break;

        case PaymentProvider.CASH:
          response = await this.cashProcessor.processPayment(sanitizedRequest);
          break;

        default:
          throw new ValidationError(
            `Unsupported payment provider: ${sanitizedRequest.provider}`,
            'provider'
          );
      }

      // Generate transaction reference if not provided
      if (!response.reference) {
        response.reference = generateTransactionReference(
          sanitizedRequest.provider,
          sanitizedRequest.orderId
        );
      }

      // Log successful response
      logPaymentResponse('Payment processed successfully', {
        transactionId: response.transactionId,
        status: response.status,
        provider: response.provider,
        amount: response.amount
      });

      return response;
    } catch (error) {
      // Log error
      logProviderError(
        'Payment processing failed',
        {
          provider: request.provider,
          errorCode: error.code || 'UNKNOWN',
          transactionId: error.transactionId
        },
        error
      );

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Check payment status
   */
  public async getPaymentStatus(
    transactionId: string,
    provider: PaymentProvider
  ): Promise<TransactionStatus> {
    try {
      let status: TransactionStatus;

      switch (provider) {
        case PaymentProvider.MTN_MOBILE_MONEY:
          status = await this.mtnClient.getTransactionStatus(transactionId);
          break;

        case PaymentProvider.ORANGE_MONEY:
          status = await this.orangeClient.getTransactionStatus(transactionId);
          break;

        case PaymentProvider.CASH:
          status = await this.cashProcessor.getPaymentStatus(transactionId);
          break;

        default:
          throw new ValidationError(`Unsupported payment provider: ${provider}`, 'provider');
      }

      logger.info('Payment status retrieved', {
        transactionId,
        provider,
        status
      });

      return status;
    } catch (error) {
      logger.error('Failed to get payment status', {
        transactionId,
        provider,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Process refund
   */
  public async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Sanitize input data
      const sanitizedRequest = sanitizeInput(request) as RefundRequest;

      // Validate refund request
      this.validateRefundRequest(sanitizedRequest);

      // For refunds, we need to determine the original provider
      // In a real implementation, this would be retrieved from the database
      // For now, we'll determine based on transaction ID format
      const provider = this.determineProviderFromTransactionId(sanitizedRequest.transactionId);

      logger.info('Processing refund', {
        transactionId: sanitizedRequest.transactionId,
        amount: sanitizedRequest.amount,
        provider,
        reason: sanitizedRequest.reason
      });

      let response: RefundResponse;

      switch (provider) {
        case PaymentProvider.MTN_MOBILE_MONEY:
          response = await this.mtnClient.processRefund(sanitizedRequest);
          break;

        case PaymentProvider.ORANGE_MONEY:
          response = await this.orangeClient.processRefund(sanitizedRequest);
          break;

        case PaymentProvider.CASH:
          response = await this.cashProcessor.processRefund(sanitizedRequest);
          break;

        default:
          throw new ValidationError(`Unsupported payment provider: ${provider}`, 'provider');
      }

      logger.info('Refund processed successfully', {
        refundId: response.refundId,
        transactionId: response.transactionId,
        amount: response.amount,
        provider
      });

      return response;
    } catch (error) {
      logger.error('Refund processing failed', {
        transactionId: request.transactionId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get available payment methods for customer
   */
  public async getAvailablePaymentMethods(
    phoneNumber?: string,
    amount?: number
  ): Promise<Array<{
    provider: PaymentProvider;
    method: PaymentMethod;
    available: boolean;
    reason?: string;
    fees?: { fixed: number; percentage: number; total?: number };
  }>> {
    const methods: Array<{
      provider: PaymentProvider;
      method: PaymentMethod;
      available: boolean;
      reason?: string;
      fees?: { fixed: number; percentage: number; total?: number };
    }> = [];

    // Check MTN Mobile Money availability
    if (config.payment.providers[PaymentProvider.MTN_MOBILE_MONEY].enabled) {
      const mtnAvailable = phoneNumber
        ? isPhoneNumberCompatible(phoneNumber, PaymentProvider.MTN_MOBILE_MONEY)
        : true;

      let mtnReason: string | undefined;
      if (!mtnAvailable) {
        mtnReason = 'Phone number not compatible with MTN Mobile Money';
      } else if (amount) {
        const validation = validateAmount(amount, PaymentProvider.MTN_MOBILE_MONEY);
        if (!validation.valid) {
          mtnReason = validation.reason;
        }
      }

      methods.push({
        provider: PaymentProvider.MTN_MOBILE_MONEY,
        method: PaymentMethod.MOBILE_MONEY,
        available: mtnAvailable && !mtnReason,
        reason: mtnReason,
        fees: config.payment.providers[PaymentProvider.MTN_MOBILE_MONEY].fees
      });
    }

    // Check Orange Money availability
    if (config.payment.providers[PaymentProvider.ORANGE_MONEY].enabled) {
      const orangeAvailable = phoneNumber
        ? isPhoneNumberCompatible(phoneNumber, PaymentProvider.ORANGE_MONEY)
        : true;

      let orangeReason: string | undefined;
      if (!orangeAvailable) {
        orangeReason = 'Phone number not compatible with Orange Money';
      } else if (amount) {
        const validation = validateAmount(amount, PaymentProvider.ORANGE_MONEY);
        if (!validation.valid) {
          orangeReason = validation.reason;
        }
      }

      methods.push({
        provider: PaymentProvider.ORANGE_MONEY,
        method: PaymentMethod.MOBILE_MONEY,
        available: orangeAvailable && !orangeReason,
        reason: orangeReason,
        fees: config.payment.providers[PaymentProvider.ORANGE_MONEY].fees
      });
    }

    // Check cash payment availability
    if (config.payment.providers[PaymentProvider.CASH].enabled) {
      let cashReason: string | undefined;
      if (amount) {
        const validation = validateAmount(amount, PaymentProvider.CASH);
        if (!validation.valid) {
          cashReason = validation.reason;
        }
      }

      // Cash on delivery
      methods.push({
        provider: PaymentProvider.CASH,
        method: PaymentMethod.CASH_ON_DELIVERY,
        available: !cashReason,
        reason: cashReason,
        fees: config.payment.providers[PaymentProvider.CASH].fees
      });

      // Cash pickup
      methods.push({
        provider: PaymentProvider.CASH,
        method: PaymentMethod.CASH_PICKUP,
        available: !cashReason,
        reason: cashReason,
        fees: config.payment.providers[PaymentProvider.CASH].fees
      });
    }

    logger.debug('Available payment methods retrieved', {
      phoneNumber: phoneNumber ? phoneNumber.replace(/\d(?=\d{4})/g, '*') : undefined,
      amount,
      methodCount: methods.length,
      availableCount: methods.filter(m => m.available).length
    });

    return methods;
  }

  /**
   * Get provider health status
   */
  public async getProviderHealthStatus(): Promise<{
    [key in PaymentProvider]: { status: 'healthy' | 'unhealthy'; details?: any };
  }> {
    const healthStatus = {
      [PaymentProvider.MTN_MOBILE_MONEY]: await this.mtnClient.healthCheck(),
      [PaymentProvider.ORANGE_MONEY]: await this.orangeClient.healthCheck(),
      [PaymentProvider.CASH]: await this.cashProcessor.healthCheck()
    };

    logger.debug('Provider health status checked', {
      mtn: healthStatus[PaymentProvider.MTN_MOBILE_MONEY].status,
      orange: healthStatus[PaymentProvider.ORANGE_MONEY].status,
      cash: healthStatus[PaymentProvider.CASH].status
    });

    return healthStatus;
  }

  /**
   * Validate payment request
   */
  private async validatePaymentRequest(request: PaymentRequest): Promise<void> {
    // Validate required fields
    if (!request.orderId) {
      throw new ValidationError('Order ID is required', 'orderId');
    }

    if (!request.customerId) {
      throw new ValidationError('Customer ID is required', 'customerId');
    }

    if (!request.amount || request.amount <= 0) {
      throw new ValidationError('Valid amount is required', 'amount');
    }

    if (!request.currency) {
      throw new ValidationError('Currency is required', 'currency');
    }

    if (!request.provider) {
      throw new ValidationError('Payment provider is required', 'provider');
    }

    if (!request.method) {
      throw new ValidationError('Payment method is required', 'method');
    }

    if (!request.description) {
      throw new ValidationError('Payment description is required', 'description');
    }

    // Validate provider is enabled
    if (!config.payment.providers[request.provider]?.enabled) {
      throw new ValidationError(
        `Payment provider ${request.provider} is not enabled`,
        'provider'
      );
    }

    // Validate amount limits
    const amountValidation = validateAmount(request.amount, request.provider);
    if (!amountValidation.valid) {
      throw new ValidationError(amountValidation.reason!, 'amount');
    }

    // Validate phone number for mobile money
    if (
      [PaymentProvider.MTN_MOBILE_MONEY, PaymentProvider.ORANGE_MONEY].includes(request.provider)
    ) {
      if (!request.phoneNumber) {
        throw new ValidationError('Phone number is required for mobile money payments', 'phoneNumber');
      }

      const phoneValidation = validateAndFormatPhoneNumber(request.phoneNumber);
      if (!phoneValidation) {
        throw new ValidationError('Invalid Cameroon phone number format', 'phoneNumber');
      }

      const compatibilityCheck = isPhoneNumberCompatible(request.phoneNumber, request.provider);
      if (!compatibilityCheck) {
        throw new ValidationError(
          `Phone number is not compatible with ${request.provider}`,
          'phoneNumber'
        );
      }
    }

    // Validate method compatibility with provider
    const validCombinations = {
      [PaymentProvider.MTN_MOBILE_MONEY]: [PaymentMethod.MOBILE_MONEY],
      [PaymentProvider.ORANGE_MONEY]: [PaymentMethod.MOBILE_MONEY],
      [PaymentProvider.CASH]: [PaymentMethod.CASH_ON_DELIVERY, PaymentMethod.CASH_PICKUP]
    };

    if (!validCombinations[request.provider].includes(request.method)) {
      throw new ValidationError(
        `Payment method ${request.method} is not compatible with provider ${request.provider}`,
        'method'
      );
    }
  }

  /**
   * Validate refund request
   */
  private validateRefundRequest(request: RefundRequest): void {
    if (!request.transactionId) {
      throw new ValidationError('Transaction ID is required', 'transactionId');
    }

    if (!request.reason) {
      throw new ValidationError('Refund reason is required', 'reason');
    }

    if (request.amount && request.amount <= 0) {
      throw new ValidationError('Refund amount must be positive', 'amount');
    }
  }

  /**
   * Determine provider from transaction ID format
   * In a real implementation, this would query the database
   */
  private determineProviderFromTransactionId(transactionId: string): PaymentProvider {
    // This is a simplified implementation
    // In reality, you would look up the transaction in your database
    if (transactionId.includes('MTN')) {
      return PaymentProvider.MTN_MOBILE_MONEY;
    } else if (transactionId.includes('ORG')) {
      return PaymentProvider.ORANGE_MONEY;
    } else if (transactionId.includes('CSH') || transactionId.includes('COD')) {
      return PaymentProvider.CASH;
    }

    // Default to MTN if we can't determine
    return PaymentProvider.MTN_MOBILE_MONEY;
  }
}