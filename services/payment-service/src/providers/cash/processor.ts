/**
 * Cash Payment Processor
 * Handles cash payment workflows including COD and pickup codes
 */

import { v4 as uuidv4 } from 'uuid';
import {
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  TransactionStatus,
  PaymentProvider,
  PaymentMethod,
  CashPaymentCode,
  ProviderError
} from '@/types';
import { logger } from '@/utils/logger';
import { generatePaymentCode, formatCurrency, calculatePaymentFees } from '@/utils/helpers';

export class CashPaymentProcessor {
  constructor() {}

  /**
   * Process cash payment request
   */
  public async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = uuidv4();
      const { fees, taxes, netAmount } = calculatePaymentFees(request.amount, PaymentProvider.CASH);

      let paymentCode: string | undefined;
      let message: string;

      if (request.method === PaymentMethod.CASH_PICKUP) {
        // Generate payment code for cash pickup
        paymentCode = generatePaymentCode();
        message = `Cash pickup code generated: ${paymentCode}. Present this code at any authorized Okada location to complete payment.`;
      } else {
        // Cash on delivery
        message = 'Cash on delivery payment scheduled. Please have exact amount ready for delivery.';
      }

      const paymentResponse: PaymentResponse = {
        transactionId,
        status: TransactionStatus.PENDING,
        amount: request.amount,
        currency: request.currency,
        provider: PaymentProvider.CASH,
        method: request.method,
        fees,
        taxes,
        netAmount,
        reference: paymentCode || `COD-${transactionId}`,
        message,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (request.method === PaymentMethod.CASH_PICKUP) {
        // Store payment code details
        const codeDetails: CashPaymentCode = {
          id: uuidv4(),
          code: paymentCode!,
          transactionId,
          amount: request.amount,
          currency: request.currency,
          customerId: request.customerId,
          merchantId: request.merchantId,
          status: 'active',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          createdAt: new Date(),
          metadata: request.metadata
        };

        // In a real implementation, this would be stored in database
        logger.info('Cash pickup code generated:', {
          transactionId,
          code: paymentCode,
          customerId: request.customerId,
          amount: request.amount
        });
      }

      logger.info('Cash payment processed:', {
        transactionId,
        method: request.method,
        amount: request.amount,
        customerId: request.customerId
      });

      return paymentResponse;
    } catch (error) {
      logger.error('Cash payment processing failed:', {
        error: error.message,
        orderId: request.orderId,
        customerId: request.customerId
      });

      throw new ProviderError(
        'Failed to process cash payment',
        PaymentProvider.CASH,
        'PROCESSING_FAILED',
        error
      );
    }
  }

  /**
   * Verify payment code
   */
  public async verifyPaymentCode(code: string): Promise<CashPaymentCode | null> {
    try {
      // In a real implementation, this would query the database
      // For now, we'll simulate the verification
      logger.info('Verifying cash payment code:', { code });

      // This would be a database query in real implementation
      return null;
    } catch (error) {
      logger.error('Failed to verify payment code:', {
        code,
        error: error.message
      });

      throw new ProviderError(
        'Failed to verify payment code',
        PaymentProvider.CASH,
        'VERIFICATION_FAILED',
        error
      );
    }
  }

  /**
   * Confirm cash payment
   */
  public async confirmPayment(
    transactionId: string,
    paymentCode?: string,
    amountReceived?: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Confirming cash payment:', {
        transactionId,
        paymentCode,
        amountReceived
      });

      // In real implementation, this would:
      // 1. Verify the payment code if provided
      // 2. Update transaction status to confirmed
      // 3. Update payment code status to used
      // 4. Send confirmation notifications

      return {
        success: true,
        message: 'Cash payment confirmed successfully'
      };
    } catch (error) {
      logger.error('Failed to confirm cash payment:', {
        transactionId,
        error: error.message
      });

      throw new ProviderError(
        'Failed to confirm cash payment',
        PaymentProvider.CASH,
        'CONFIRMATION_FAILED',
        error
      );
    }
  }

  /**
   * Process cash refund
   */
  public async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const refundId = uuidv4();

      // For cash payments, refunds are typically handled manually
      // This creates a refund record that needs to be processed by operations team

      const refundResponse: RefundResponse = {
        refundId,
        transactionId: request.transactionId,
        status: TransactionStatus.PENDING,
        amount: request.amount || 0, // Would get from original transaction
        currency: 'XAF' as any, // Would get from original transaction
        provider: PaymentProvider.CASH,
        reference: `CASH-REFUND-${refundId}`,
        reason: request.reason,
        createdAt: new Date()
      };

      logger.info('Cash refund request created:', {
        refundId,
        transactionId: request.transactionId,
        amount: request.amount,
        reason: request.reason
      });

      return refundResponse;
    } catch (error) {
      logger.error('Cash refund processing failed:', {
        transactionId: request.transactionId,
        error: error.message
      });

      throw new ProviderError(
        'Failed to process cash refund',
        PaymentProvider.CASH,
        'REFUND_FAILED',
        error
      );
    }
  }

  /**
   * Get payment status (for cash payments)
   */
  public async getPaymentStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      // In real implementation, this would query the database
      // For now, return pending as cash payments need manual confirmation
      return TransactionStatus.PENDING;
    } catch (error) {
      logger.error('Failed to get cash payment status:', {
        transactionId,
        error: error.message
      });

      throw new ProviderError(
        'Failed to get payment status',
        PaymentProvider.CASH,
        'STATUS_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Cancel payment code
   */
  public async cancelPaymentCode(code: string, reason: string): Promise<boolean> {
    try {
      logger.info('Cancelling payment code:', { code, reason });

      // In real implementation, this would:
      // 1. Update payment code status to cancelled
      // 2. Update associated transaction status
      // 3. Send cancellation notifications

      return true;
    } catch (error) {
      logger.error('Failed to cancel payment code:', {
        code,
        error: error.message
      });

      throw new ProviderError(
        'Failed to cancel payment code',
        PaymentProvider.CASH,
        'CANCELLATION_FAILED',
        error
      );
    }
  }

  /**
   * Generate payment instructions for cash payment
   */
  public generatePaymentInstructions(
    method: PaymentMethod,
    amount: number,
    paymentCode?: string
  ): string {
    const formattedAmount = formatCurrency(amount);

    if (method === PaymentMethod.CASH_PICKUP) {
      return `
Cash Pickup Payment Instructions:
1. Present payment code: ${paymentCode}
2. Amount to pay: ${formattedAmount}
3. Visit any authorized Okada location
4. Payment must be completed within 7 days
5. Bring valid ID for verification

Authorized locations:
- Okada Service Centers
- Partner retail locations
- Mobile money agent locations

For assistance, contact customer service.
      `.trim();
    } else {
      return `
Cash on Delivery Instructions:
1. Amount to pay: ${formattedAmount}
2. Payment due upon delivery
3. Please have exact amount ready
4. Cash only, no credit/debit cards
5. Receipt will be provided

Delivery agent will:
- Verify your identity
- Confirm order details
- Collect payment
- Provide official receipt
      `.trim();
    }
  }

  /**
   * Health check for cash payment processor
   */
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
    try {
      // For cash payments, we just check that the processor is functioning
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