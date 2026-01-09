/**
 * MTN Mobile Money API Client
 * Production-ready integration with MTN Mobile Money API for Cameroon
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
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
  MTNPaymentRequest,
  MTNPaymentResponse
} from '@/types';
import { logger } from '@/utils/logger';
import { sleep, retryOperation } from '@/utils/helpers';

interface MTNTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MTNBalanceResponse {
  availableBalance: string;
  currency: string;
}

interface MTNTransactionResponse {
  financialTransactionId: string;
  externalId: string;
  amount: string;
  currency: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  status: string;
  reason?: {
    code: string;
    message: string;
  };
}

export class MTNMobileMoneyClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private readonly baseUrl: string;
  private readonly environment: 'sandbox' | 'production';

  constructor() {
    this.baseUrl = config.mtn.baseUrl;
    this.environment = config.mtn.environment;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.mtn.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Target-Environment': this.environment
      }
    });

    // Request interceptor for authentication
    this.client.interceptors.request.use(
      async (requestConfig) => {
        // Add authentication token if available
        if (this.accessToken && this.isTokenValid()) {
          requestConfig.headers!['Authorization'] = `Bearer ${this.accessToken}`;
        }

        // Add request ID for tracking
        requestConfig.headers!['X-Reference-Id'] = uuidv4();

        logger.debug('MTN API Request:', {
          method: requestConfig.method,
          url: requestConfig.url,
          headers: { ...requestConfig.headers, Authorization: '[REDACTED]' }
        });

        return requestConfig;
      },
      (error) => {
        logger.error('MTN API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug('MTN API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
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
   * Authenticate with MTN API and obtain access token
   */
  public async authenticate(): Promise<void> {
    try {
      const response = await this.client.post<MTNTokenResponse>(
        '/collection/token/',
        {},
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${config.mtn.apiUserId}:${config.mtn.apiKey}`).toString('base64')}`,
            'Ocp-Apim-Subscription-Key': config.mtn.collectionSubscriptionKey
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in * 1000));

      logger.info('MTN API authentication successful', {
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in
      });
    } catch (error) {
      logger.error('MTN API authentication failed:', error);
      throw new ProviderError(
        'Failed to authenticate with MTN API',
        PaymentProvider.MTN_MOBILE_MONEY,
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
   * Request payment from customer
   */
  public async requestToPay(request: PaymentRequest): Promise<PaymentResponse> {
    await this.ensureAuthenticated();

    const referenceId = uuidv4();
    const mtnRequest: MTNPaymentRequest = {
      amount: request.amount.toString(),
      currency: request.currency,
      externalId: request.orderId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: this.formatPhoneNumber(request.phoneNumber!)
      },
      payerMessage: `Payment for order ${request.orderId}`,
      payeeNote: request.description,
      callbackUrl: config.mtn.callbackUrl
    };

    try {
      const response = await retryOperation(
        async () => {
          return await this.client.post('/collection/v1_0/requesttopay', mtnRequest, {
            headers: {
              'X-Reference-Id': referenceId,
              'Ocp-Apim-Subscription-Key': config.mtn.collectionSubscriptionKey
            }
          });
        },
        config.mtn.retryAttempts,
        config.mtn.retryDelay
      );

      // MTN returns 202 Accepted for successful request
      if (response.status !== 202) {
        throw new ProviderError(
          'Unexpected response status from MTN API',
          PaymentProvider.MTN_MOBILE_MONEY,
          'UNEXPECTED_STATUS',
          { status: response.status }
        );
      }

      const paymentResponse: PaymentResponse = {
        transactionId: referenceId,
        externalTransactionId: referenceId,
        status: TransactionStatus.PENDING,
        amount: request.amount,
        currency: request.currency,
        provider: PaymentProvider.MTN_MOBILE_MONEY,
        method: request.method,
        ussdCode: '*126#',
        reference: referenceId,
        message: 'Payment request initiated. Please check your phone for MTN Mobile Money prompt.',
        expiresAt: new Date(Date.now() + 300000), // 5 minutes
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info('MTN payment request successful:', {
        transactionId: referenceId,
        orderId: request.orderId,
        amount: request.amount,
        phoneNumber: this.maskPhoneNumber(request.phoneNumber!)
      });

      return paymentResponse;
    } catch (error) {
      logger.error('MTN payment request failed:', {
        error: error.message,
        orderId: request.orderId,
        phoneNumber: this.maskPhoneNumber(request.phoneNumber!)
      });

      if (error instanceof ProviderError) {
        throw error;
      }

      throw new ProviderError(
        'Failed to process MTN payment request',
        PaymentProvider.MTN_MOBILE_MONEY,
        'REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Check payment status
   */
  public async getTransactionStatus(referenceId: string): Promise<TransactionStatus> {
    await this.ensureAuthenticated();

    try {
      const response = await this.client.get<MTNTransactionResponse>(
        `/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': config.mtn.collectionSubscriptionKey
          }
        }
      );

      return this.mapMTNStatusToTransactionStatus(response.data.status);
    } catch (error) {
      logger.error('Failed to get MTN transaction status:', {
        referenceId,
        error: error.message
      });

      if (error.response?.status === 404) {
        return TransactionStatus.FAILED;
      }

      throw new ProviderError(
        'Failed to retrieve transaction status from MTN',
        PaymentProvider.MTN_MOBILE_MONEY,
        'STATUS_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Get transaction details
   */
  public async getTransactionDetails(referenceId: string): Promise<MTNTransactionResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.client.get<MTNTransactionResponse>(
        `/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': config.mtn.collectionSubscriptionKey
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get MTN transaction details:', {
        referenceId,
        error: error.message
      });

      throw new ProviderError(
        'Failed to retrieve transaction details from MTN',
        PaymentProvider.MTN_MOBILE_MONEY,
        'DETAILS_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Check account balance
   */
  public async getAccountBalance(): Promise<MTNBalanceResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.client.get<MTNBalanceResponse>(
        '/collection/v1_0/account/balance',
        {
          headers: {
            'Ocp-Apim-Subscription-Key': config.mtn.collectionSubscriptionKey
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get MTN account balance:', error);
      throw new ProviderError(
        'Failed to retrieve account balance from MTN',
        PaymentProvider.MTN_MOBILE_MONEY,
        'BALANCE_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Process refund (Transfer money back to customer)
   */
  public async processRefund(request: RefundRequest): Promise<RefundResponse> {
    await this.ensureAuthenticated();

    // First get original transaction details
    const originalTransaction = await this.getTransactionDetails(request.transactionId);

    const transferId = uuidv4();
    const transferRequest = {
      amount: request.amount?.toString() || originalTransaction.amount,
      currency: originalTransaction.currency,
      externalId: `refund-${request.transactionId}`,
      payee: {
        partyIdType: originalTransaction.payer.partyIdType,
        partyId: originalTransaction.payer.partyId
      },
      payerMessage: `Refund for transaction ${request.transactionId}`,
      payeeNote: request.reason
    };

    try {
      const response = await this.client.post('/disbursement/v1_0/transfer', transferRequest, {
        headers: {
          'X-Reference-Id': transferId,
          'Ocp-Apim-Subscription-Key': config.mtn.disbursementSubscriptionKey
        }
      });

      if (response.status !== 202) {
        throw new ProviderError(
          'Unexpected response status from MTN refund API',
          PaymentProvider.MTN_MOBILE_MONEY,
          'UNEXPECTED_STATUS',
          { status: response.status }
        );
      }

      const refundResponse: RefundResponse = {
        refundId: transferId,
        transactionId: request.transactionId,
        status: TransactionStatus.PENDING,
        amount: parseFloat(transferRequest.amount),
        currency: transferRequest.currency as CurrencyCode,
        provider: PaymentProvider.MTN_MOBILE_MONEY,
        reference: transferId,
        reason: request.reason,
        createdAt: new Date()
      };

      logger.info('MTN refund request successful:', {
        refundId: transferId,
        originalTransactionId: request.transactionId,
        amount: transferRequest.amount
      });

      return refundResponse;
    } catch (error) {
      logger.error('MTN refund request failed:', {
        error: error.message,
        transactionId: request.transactionId
      });

      throw new ProviderError(
        'Failed to process MTN refund',
        PaymentProvider.MTN_MOBILE_MONEY,
        'REFUND_FAILED',
        error
      );
    }
  }

  /**
   * Validate MTN webhook signature
   */
  public validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', config.mtn.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      logger.error('MTN webhook signature validation failed:', error);
      return false;
    }
  }

  /**
   * Map MTN status to our transaction status
   */
  private mapMTNStatusToTransactionStatus(mtnStatus: string): TransactionStatus {
    switch (mtnStatus.toUpperCase()) {
      case 'PENDING':
        return TransactionStatus.PENDING;
      case 'SUCCESSFUL':
        return TransactionStatus.COMPLETED;
      case 'FAILED':
        return TransactionStatus.FAILED;
      case 'TIMEOUT':
        return TransactionStatus.EXPIRED;
      case 'ONGOING':
        return TransactionStatus.PROCESSING;
      default:
        logger.warn('Unknown MTN status:', mtnStatus);
        return TransactionStatus.PENDING;
    }
  }

  /**
   * Format phone number for MTN API (remove country code if present)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If starts with 237 (Cameroon country code), remove it
    if (cleaned.startsWith('237')) {
      return cleaned.substring(3);
    }

    // If starts with +237, it should already be cleaned by the regex above
    return cleaned;
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
      throw new TimeoutError('MTN API request timed out', error);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new NetworkError('Failed to connect to MTN API', error);
    }

    if (error.response) {
      const { status, data } = error.response;

      logger.error('MTN API Error Response:', {
        status,
        data,
        url: error.config?.url
      });

      switch (status) {
        case 400:
          throw new ProviderError(
            data?.message || 'Invalid request to MTN API',
            PaymentProvider.MTN_MOBILE_MONEY,
            'INVALID_REQUEST',
            data
          );
        case 401:
          throw new ProviderError(
            'Authentication failed with MTN API',
            PaymentProvider.MTN_MOBILE_MONEY,
            'AUTH_FAILED',
            data
          );
        case 403:
          throw new ProviderError(
            'Access forbidden by MTN API',
            PaymentProvider.MTN_MOBILE_MONEY,
            'ACCESS_FORBIDDEN',
            data
          );
        case 404:
          throw new ProviderError(
            'Resource not found in MTN API',
            PaymentProvider.MTN_MOBILE_MONEY,
            'NOT_FOUND',
            data
          );
        case 409:
          throw new ProviderError(
            'Duplicate transaction in MTN API',
            PaymentProvider.MTN_MOBILE_MONEY,
            'DUPLICATE_TRANSACTION',
            data
          );
        case 500:
          throw new ProviderError(
            'MTN API internal server error',
            PaymentProvider.MTN_MOBILE_MONEY,
            'SERVER_ERROR',
            data
          );
        default:
          throw new ProviderError(
            `MTN API error: ${status}`,
            PaymentProvider.MTN_MOBILE_MONEY,
            'API_ERROR',
            data
          );
      }
    }

    logger.error('Unknown MTN API error:', error);
    throw new ProviderError(
      'Unknown error occurred with MTN API',
      PaymentProvider.MTN_MOBILE_MONEY,
      'UNKNOWN_ERROR',
      error
    );
  }

  /**
   * Health check for MTN API
   */
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
    try {
      await this.ensureAuthenticated();
      await this.getAccountBalance();

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
}