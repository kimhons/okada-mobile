/**
 * Orange Money API Client
 * Production-ready integration with Orange Money API for Cameroon
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import qs from 'qs';
import { config } from '@/config';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  TransactionStatus,
  PaymentProvider,
  CurrencyCode,
  ProviderError,
  NetworkError,
  TimeoutError,
  OrangePaymentRequest,
  OrangePaymentResponse
} from '@/types';
import { logger } from '@/utils/logger';
import { retryOperation } from '@/utils/helpers';

interface OrangeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface OrangeTransactionResponse {
  order_id: string;
  pay_token: string;
  txnid: string;
  amount: number;
  currency: string;
  status: string;
  message?: string;
  transaction_id?: string;
  create_time: string;
  end_time?: string;
}

interface OrangeRefundResponse {
  refund_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  message?: string;
  create_time: string;
}

export class OrangeMoneyClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private readonly baseUrl: string;
  private readonly environment: 'sandbox' | 'production';

  constructor() {
    this.baseUrl = config.orange.baseUrl;
    this.environment = config.orange.environment;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.orange.timeout,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Okada-Platform/1.0'
      }
    });

    // Request interceptor for authentication and logging
    this.client.interceptors.request.use(
      async (requestConfig) => {
        // Add authorization header for authenticated endpoints
        if (this.accessToken && this.isTokenValid() && requestConfig.url !== '/token') {
          requestConfig.headers!['Authorization'] = `Bearer ${this.accessToken}`;
        }

        logger.debug('Orange API Request:', {
          method: requestConfig.method,
          url: requestConfig.url,
          headers: { ...requestConfig.headers, Authorization: '[REDACTED]' }
        });

        return requestConfig;
      },
      (error) => {
        logger.error('Orange API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug('Orange API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: typeof response.data === 'string' ? '[HTML Response]' : response.data
        });
        return response;
      },
      (error) => {
        this.handleAPIError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with Orange Money API and obtain access token
   */
  public async authenticate(): Promise<void> {
    try {
      const authData = qs.stringify({
        grant_type: 'client_credentials'
      });

      const authHeader = Buffer.from(
        `${config.orange.clientId}:${config.orange.clientSecret}`
      ).toString('base64');

      const response = await this.client.post<OrangeTokenResponse>(
        '/token',
        authData,
        {
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in * 1000));

      logger.info('Orange Money API authentication successful', {
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in
      });
    } catch (error) {
      logger.error('Orange Money API authentication failed:', error);
      throw new ProviderError(
        'Failed to authenticate with Orange Money API',
        PaymentProvider.ORANGE_MONEY,
        'AUTH_FAILED',
        error
      );
    }
  }

  /**
   * Check if current token is valid
   */
  private isTokenValid(): boolean {
    if (!this.tokenExpiresAt) return false;
    return new Date() < new Date(this.tokenExpiresAt.getTime() - 60000); // 1 minute buffer
  }

  /**
   * Ensure valid authentication token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.isTokenValid()) {
      await this.authenticate();
    }
  }

  /**
   * Initiate payment with Orange Money
   */
  public async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    await this.ensureAuthenticated();

    const orangeRequest: OrangePaymentRequest = {
      merchant_key: config.orange.merchantKey,
      currency: request.currency,
      order_id: request.orderId,
      amount: request.amount,
      return_url: config.orange.callbackUrl,
      cancel_url: config.orange.cancelUrl,
      notif_url: config.orange.notificationUrl,
      lang: 'fr', // French for Cameroon
      reference: `OKD-${request.orderId}-${Date.now()}`
    };

    try {
      const formData = qs.stringify(orangeRequest);

      const response = await retryOperation(
        async () => {
          return await this.client.post<OrangePaymentResponse>(
            '/webpayment',
            formData,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          );
        },
        config.orange.retryAttempts,
        config.orange.retryDelay
      );

      if (!response.data.payment_url || !response.data.pay_token) {
        throw new ProviderError(
          'Invalid response from Orange Money API',
          PaymentProvider.ORANGE_MONEY,
          'INVALID_RESPONSE',
          response.data
        );
      }

      const paymentResponse: PaymentResponse = {
        transactionId: response.data.pay_token,
        externalTransactionId: response.data.payment_token,
        status: TransactionStatus.PENDING,
        amount: request.amount,
        currency: request.currency,
        provider: PaymentProvider.ORANGE_MONEY,
        method: request.method,
        paymentUrl: response.data.payment_url,
        ussdCode: '*150#',
        reference: orangeRequest.reference,
        message: 'Payment initiated. Please complete payment using the provided URL or USSD code.',
        expiresAt: new Date(Date.now() + 900000), // 15 minutes
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info('Orange Money payment initiation successful:', {
        payToken: response.data.pay_token,
        orderId: request.orderId,
        amount: request.amount,
        phoneNumber: request.phoneNumber ? this.maskPhoneNumber(request.phoneNumber) : 'N/A'
      });

      return paymentResponse;
    } catch (error) {
      logger.error('Orange Money payment initiation failed:', {
        error: error.message,
        orderId: request.orderId,
        phoneNumber: request.phoneNumber ? this.maskPhoneNumber(request.phoneNumber) : 'N/A'
      });

      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        'Failed to initiate Orange Money payment',
        PaymentProvider.ORANGE_MONEY,
        'INITIATION_FAILED',
        error
      );
    }
  }

  /**
   * Check payment status
   */
  public async getTransactionStatus(payToken: string): Promise<TransactionStatus> {
    await this.ensureAuthenticated();

    try {
      const response = await this.client.get<OrangeTransactionResponse>(
        `/payment/${payToken}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return this.mapOrangeStatusToTransactionStatus(response.data.status);
    } catch (error) {
      logger.error('Failed to get Orange Money transaction status:', {
        payToken,
        error: error.message
      });

      if (error.response?.status === 404) {
        return TransactionStatus.FAILED;
      }

      throw new ProviderError(
        'Failed to retrieve transaction status from Orange Money',
        PaymentProvider.ORANGE_MONEY,
        'STATUS_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Get transaction details
   */
  public async getTransactionDetails(payToken: string): Promise<OrangeTransactionResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.client.get<OrangeTransactionResponse>(
        `/payment/${payToken}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get Orange Money transaction details:', {
        payToken,
        error: error.message
      });

      throw new ProviderError(
        'Failed to retrieve transaction details from Orange Money',
        PaymentProvider.ORANGE_MONEY,
        'DETAILS_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Process refund
   */
  public async processRefund(request: RefundRequest): Promise<RefundResponse> {
    await this.ensureAuthenticated();

    // First get original transaction details
    const originalTransaction = await this.getTransactionDetails(request.transactionId);

    const refundData = qs.stringify({
      merchant_key: config.orange.merchantKey,
      order_id: originalTransaction.order_id,
      amount: request.amount || originalTransaction.amount,
      currency: originalTransaction.currency,
      reason: request.reason,
      refund_reference: `refund-${request.transactionId}-${Date.now()}`
    });

    try {
      const response = await this.client.post<OrangeRefundResponse>(
        '/refund',
        refundData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const refundResponse: RefundResponse = {
        refundId: response.data.refund_id,
        transactionId: request.transactionId,
        status: this.mapOrangeStatusToTransactionStatus(response.data.status),
        amount: response.data.amount,
        currency: response.data.currency as CurrencyCode,
        provider: PaymentProvider.ORANGE_MONEY,
        reference: response.data.refund_id,
        reason: request.reason,
        createdAt: new Date(response.data.create_time)
      };

      logger.info('Orange Money refund request successful:', {
        refundId: response.data.refund_id,
        originalTransactionId: request.transactionId,
        amount: response.data.amount
      });

      return refundResponse;
    } catch (error) {
      logger.error('Orange Money refund request failed:', {
        error: error.message,
        transactionId: request.transactionId
      });

      throw new ProviderError(
        'Failed to process Orange Money refund',
        PaymentProvider.ORANGE_MONEY,
        'REFUND_FAILED',
        error
      );
    }
  }

  /**
   * Validate Orange Money webhook signature
   */
  public validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', config.orange.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      logger.error('Orange Money webhook signature validation failed:', error);
      return false;
    }
  }

  /**
   * Cancel pending payment
   */
  public async cancelPayment(payToken: string): Promise<boolean> {
    await this.ensureAuthenticated();

    try {
      const cancelData = qs.stringify({
        merchant_key: config.orange.merchantKey,
        pay_token: payToken
      });

      const response = await this.client.post(
        '/cancel',
        cancelData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      logger.error('Failed to cancel Orange Money payment:', {
        payToken,
        error: error.message
      });

      throw new ProviderError(
        'Failed to cancel Orange Money payment',
        PaymentProvider.ORANGE_MONEY,
        'CANCELLATION_FAILED',
        error
      );
    }
  }

  /**
   * Map Orange Money status to our transaction status
   */
  private mapOrangeStatusToTransactionStatus(orangeStatus: string): TransactionStatus {
    switch (orangeStatus.toUpperCase()) {
      case 'PENDING':
      case 'INITIATED':
        return TransactionStatus.PENDING;
      case 'SUCCESS':
      case 'SUCCESSFUL':
      case 'COMPLETED':
        return TransactionStatus.COMPLETED;
      case 'FAILED':
      case 'FAILURE':
        return TransactionStatus.FAILED;
      case 'CANCELLED':
      case 'CANCELED':
        return TransactionStatus.CANCELLED;
      case 'EXPIRED':
      case 'TIMEOUT':
        return TransactionStatus.EXPIRED;
      case 'PROCESSING':
        return TransactionStatus.PROCESSING;
      default:
        logger.warn('Unknown Orange Money status:', orangeStatus);
        return TransactionStatus.PENDING;
    }
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 4) return phoneNumber;
    const visiblePart = phoneNumber.slice(-4);
    const maskedPart = '*'.repeat(phoneNumber.length - 4);
    return maskedPart + visiblePart;
  }

  /**
   * Handle API errors and convert to appropriate error types
   */
  private handleAPIError(error: any): void {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new TimeoutError('Orange Money API request timed out', error);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new NetworkError('Failed to connect to Orange Money API', error);
    }

    if (error.response) {
      const { status, data } = error.response;

      logger.error('Orange Money API Error Response:', {
        status,
        data,
        url: error.config?.url
      });

      switch (status) {
        case 400:
          throw new ProviderError(
            data?.message || 'Invalid request to Orange Money API',
            PaymentProvider.ORANGE_MONEY,
            'INVALID_REQUEST',
            data
          );
        case 401:
          throw new ProviderError(
            'Authentication failed with Orange Money API',
            PaymentProvider.ORANGE_MONEY,
            'AUTH_FAILED',
            data
          );
        case 403:
          throw new ProviderError(
            'Access forbidden by Orange Money API',
            PaymentProvider.ORANGE_MONEY,
            'ACCESS_FORBIDDEN',
            data
          );
        case 404:
          throw new ProviderError(
            'Resource not found in Orange Money API',
            PaymentProvider.ORANGE_MONEY,
            'NOT_FOUND',
            data
          );
        case 409:
          throw new ProviderError(
            'Duplicate transaction in Orange Money API',
            PaymentProvider.ORANGE_MONEY,
            'DUPLICATE_TRANSACTION',
            data
          );
        case 422:
          throw new ProviderError(
            'Unprocessable entity in Orange Money API',
            PaymentProvider.ORANGE_MONEY,
            'UNPROCESSABLE_ENTITY',
            data
          );
        case 500:
          throw new ProviderError(
            'Orange Money API internal server error',
            PaymentProvider.ORANGE_MONEY,
            'SERVER_ERROR',
            data
          );
        default:
          throw new ProviderError(
            `Orange Money API error: ${status}`,
            PaymentProvider.ORANGE_MONEY,
            'API_ERROR',
            data
          );
      }
    }

    logger.error('Unknown Orange Money API error:', error);
    throw new ProviderError(
      'Unknown error occurred with Orange Money API',
      PaymentProvider.ORANGE_MONEY,
      'UNKNOWN_ERROR',
      error
    );
  }

  /**
   * Health check for Orange Money API
   */
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
    try {
      await this.ensureAuthenticated();

      // Test with a simple authentication check
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get supported payment methods
   */
  public async getPaymentMethods(): Promise<any[]> {
    await this.ensureAuthenticated();

    try {
      const response = await this.client.get('/payment-methods', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get Orange Money payment methods:', error);
      throw new ProviderError(
        'Failed to retrieve payment methods from Orange Money',
        PaymentProvider.ORANGE_MONEY,
        'PAYMENT_METHODS_FAILED',
        error
      );
    }
  }

  /**
   * Generate USSD payment instructions
   */
  public generateUSSDInstructions(amount: number, reference: string): string {
    return `
To pay via Orange Money USSD:
1. Dial *150# from your Orange phone
2. Select option for Merchant Payment
3. Enter merchant code: ${config.orange.merchantKey}
4. Enter amount: ${amount} XAF
5. Enter reference: ${reference}
6. Confirm payment with your Orange Money PIN

Or use the Orange Money app to scan the payment code.
    `.trim();
  }
}