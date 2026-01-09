/**
 * Payment Controller
 * Main API endpoints for payment processing
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  ApiResponse,
  PaymentProvider,
  TransactionStatus,
  PaymentError,
  ValidationError,
  FraudError
} from '@/types';
import { PaymentGatewayService } from '@/services/payment-gateway';
import { FraudDetectionService } from '@/services/fraud-detection';
import { TransactionManager } from '@/services/transaction-manager';
import { USSDService } from '@/services/ussd-service';
import { logger, logPaymentRequest } from '@/utils/logger';
import { generateCorrelationId } from '@/utils/helpers';

export class PaymentController {
  private paymentGateway: PaymentGatewayService;
  private fraudDetection: FraudDetectionService;
  private transactionManager: TransactionManager;
  private ussdService: USSDService;

  constructor() {
    this.paymentGateway = new PaymentGatewayService();
    this.fraudDetection = new FraudDetectionService();
    this.transactionManager = new TransactionManager();
    this.ussdService = new USSDService();
  }

  /**
   * Process payment request
   */
  public processPayment = async (req: Request, res: Response): Promise<void> => {
    const correlationId = generateCorrelationId();

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse(
          'Validation failed',
          'VALIDATION_ERROR',
          errors.array(),
          correlationId
        ));
        return;
      }

      const paymentRequest: PaymentRequest = req.body;
      const context = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceFingerprint: req.get('X-Device-Fingerprint')
      };

      logPaymentRequest('Payment request received', {
        orderId: paymentRequest.orderId,
        customerId: paymentRequest.customerId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        provider: paymentRequest.provider,
        method: paymentRequest.method
      }, { correlationId, ipAddress: context.ipAddress });

      // Fraud detection
      const fraudResult = await this.fraudDetection.analyzePaymentRisk(paymentRequest, context);

      // Create transaction
      const transaction = await this.transactionManager.createTransaction(paymentRequest);

      // Update transaction with fraud score
      await this.transactionManager.updateTransactionStatus(transaction.id, {
        fraudScore: fraudResult.score
      });

      // Process payment
      const paymentResponse = await this.paymentGateway.processPayment(paymentRequest);

      // Update transaction status
      await this.transactionManager.updateTransactionStatus(transaction.id, {
        status: paymentResponse.status,
        externalTransactionId: paymentResponse.externalTransactionId
      });

      const response: ApiResponse<PaymentResponse> = {
        success: true,
        data: paymentResponse,
        meta: {
          timestamp: new Date(),
          requestId: correlationId
        }
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, correlationId);
    }
  };

  /**
   * Get payment status
   */
  public getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    const correlationId = generateCorrelationId();

    try {
      const { transactionId } = req.params;
      const { provider } = req.query;

      if (!provider) {
        res.status(400).json(this.createErrorResponse(
          'Provider is required',
          'MISSING_PROVIDER',
          null,
          correlationId
        ));
        return;
      }

      const status = await this.paymentGateway.getPaymentStatus(
        transactionId,
        provider as PaymentProvider
      );

      const response: ApiResponse<{ status: TransactionStatus }> = {
        success: true,
        data: { status },
        meta: {
          timestamp: new Date(),
          requestId: correlationId
        }
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, correlationId);
    }
  };

  /**
   * Process refund
   */
  public processRefund = async (req: Request, res: Response): Promise<void> => {
    const correlationId = generateCorrelationId();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse(
          'Validation failed',
          'VALIDATION_ERROR',
          errors.array(),
          correlationId
        ));
        return;
      }

      const refundRequest: RefundRequest = req.body;

      const refundResponse = await this.paymentGateway.processRefund(refundRequest);

      const response: ApiResponse = {
        success: true,
        data: refundResponse,
        meta: {
          timestamp: new Date(),
          requestId: correlationId
        }
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, correlationId);
    }
  };

  /**
   * Get available payment methods
   */
  public getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
    const correlationId = generateCorrelationId();

    try {
      const { phoneNumber, amount } = req.query;

      const methods = await this.paymentGateway.getAvailablePaymentMethods(
        phoneNumber as string,
        amount ? parseFloat(amount as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: methods,
        meta: {
          timestamp: new Date(),
          requestId: correlationId
        }
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, correlationId);
    }
  };

  /**
   * Initiate USSD payment
   */
  public initiateUSSDPayment = async (req: Request, res: Response): Promise<void> => {
    const correlationId = generateCorrelationId();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(this.createErrorResponse(
          'Validation failed',
          'VALIDATION_ERROR',
          errors.array(),
          correlationId
        ));
        return;
      }

      const paymentRequest: PaymentRequest = req.body;

      const ussdResponse = await this.ussdService.initiateUSSDPayment(paymentRequest);

      const response: ApiResponse = {
        success: true,
        data: ussdResponse,
        meta: {
          timestamp: new Date(),
          requestId: correlationId
        }
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, correlationId);
    }
  };

  /**
   * Process USSD input
   */
  public processUSSDInput = async (req: Request, res: Response): Promise<void> => {
    const correlationId = generateCorrelationId();

    try {
      const { sessionId } = req.params;
      const { input } = req.body;

      const result = await this.ussdService.processUSSDInput(sessionId, input);

      const response: ApiResponse = {
        success: true,
        data: result,
        meta: {
          timestamp: new Date(),
          requestId: correlationId
        }
      };

      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, correlationId);
    }
  };

  /**
   * Health check endpoint
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    const correlationId = generateCorrelationId();

    try {
      const providersHealth = await this.paymentGateway.getProviderHealthStatus();
      const ussdHealth = this.ussdService.healthCheck();

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        providers: providersHealth,
        ussd: ussdHealth,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };

      const allHealthy = Object.values(providersHealth).every(p => p.status === 'healthy') &&
                       ussdHealth.status === 'healthy';

      const response: ApiResponse = {
        success: true,
        data: health,
        meta: {
          timestamp: new Date(),
          requestId: correlationId
        }
      };

      res.status(allHealthy ? 200 : 503).json(response);
    } catch (error) {
      this.handleError(error, res, correlationId);
    }
  };

  /**
   * Handle webhook from MTN
   */
  public handleMTNWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      // Webhook handling would be implemented here
      // This includes signature verification and transaction status updates

      logger.info('MTN webhook received', {
        headers: req.headers,
        body: req.body
      });

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('MTN webhook processing failed:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  };

  /**
   * Handle webhook from Orange Money
   */
  public handleOrangeWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      // Webhook handling would be implemented here
      // This includes signature verification and transaction status updates

      logger.info('Orange webhook received', {
        headers: req.headers,
        body: req.body
      });

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Orange webhook processing failed:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  };

  /**
   * Handle errors and send appropriate response
   */
  private handleError(error: any, res: Response, correlationId: string): void {
    logger.error('Payment controller error:', {
      error: error.message,
      stack: error.stack,
      correlationId
    });

    if (error instanceof ValidationError) {
      res.status(400).json(this.createErrorResponse(
        error.message,
        error.code,
        null,
        correlationId
      ));
    } else if (error instanceof FraudError) {
      res.status(403).json(this.createErrorResponse(
        error.message,
        error.code,
        error.details,
        correlationId
      ));
    } else if (error instanceof PaymentError) {
      res.status(error.statusCode).json(this.createErrorResponse(
        error.message,
        error.code,
        error.details,
        correlationId
      ));
    } else {
      res.status(500).json(this.createErrorResponse(
        'Internal server error',
        'INTERNAL_ERROR',
        null,
        correlationId
      ));
    }
  }

  /**
   * Create standardized error response
   */
  private createErrorResponse(
    message: string,
    code: string,
    details: any = null,
    requestId: string
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        timestamp: new Date(),
        requestId
      }
    };
  }
}