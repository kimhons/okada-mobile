/**
 * Transaction Manager Service
 * Manages transaction lifecycle with state machine pattern
 */

import { EventEmitter } from 'events';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  PaymentProvider,
  PaymentError,
  ValidationError
} from '@/types';
import { logger, logAudit } from '@/utils/logger';
import { generateTransactionReference, calculatePaymentFees, calculateMerchantCommission } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';

interface TransactionState {
  status: TransactionStatus;
  allowedTransitions: TransactionStatus[];
  actions: {
    onEnter?: (transaction: Transaction) => Promise<void>;
    onExit?: (transaction: Transaction) => Promise<void>;
  };
}

interface TransactionUpdate {
  status?: TransactionStatus;
  externalTransactionId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  fraudScore?: number;
  retryCount?: number;
  webhookAttempts?: number;
}

export class TransactionManager extends EventEmitter {
  private states: Map<TransactionStatus, TransactionState>;

  constructor() {
    super();
    this.initializeStateMachine();
  }

  /**
   * Create a new transaction
   */
  public async createTransaction(request: PaymentRequest): Promise<Transaction> {
    const transactionId = uuidv4();
    const { fees, taxes, netAmount } = calculatePaymentFees(request.amount, request.provider);
    const commission = calculateMerchantCommission(request.amount);

    const transaction: Transaction = {
      id: transactionId,
      orderId: request.orderId,
      customerId: request.customerId,
      merchantId: request.merchantId,
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
      amount: request.amount,
      currency: request.currency,
      provider: request.provider,
      method: request.method,
      reference: generateTransactionReference(request.provider, request.orderId),
      description: request.description,
      phoneNumber: request.phoneNumber,
      fees,
      taxes,
      commission,
      netAmount,
      metadata: request.metadata || {},
      retryCount: 0,
      maxRetries: 3,
      webhookAttempts: 0,
      callbackUrl: request.callbackUrl,
      expiresAt: request.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Execute state enter action
    await this.executeStateAction(transaction, 'onEnter');

    // Emit transaction created event
    this.emit('transactionCreated', transaction);

    logger.info('Transaction created', {
      transactionId: transaction.id,
      orderId: transaction.orderId,
      customerId: transaction.customerId,
      amount: transaction.amount,
      provider: transaction.provider
    });

    // Audit log
    logAudit('Transaction created', {
      action: 'CREATE_TRANSACTION',
      resource: 'transaction',
      resourceId: transaction.id
    }, {
      orderId: transaction.orderId,
      amount: transaction.amount,
      provider: transaction.provider
    });

    return transaction;
  }

  /**
   * Update transaction status
   */
  public async updateTransactionStatus(
    transactionId: string,
    update: TransactionUpdate
  ): Promise<Transaction> {
    // In a real implementation, this would first fetch the transaction from database
    const transaction = await this.getTransaction(transactionId);

    if (!transaction) {
      throw new ValidationError('Transaction not found', 'transactionId');
    }

    const currentState = this.states.get(transaction.status);
    if (!currentState) {
      throw new PaymentError('Invalid current transaction status', 'INVALID_STATUS');
    }

    // Check if status transition is allowed
    if (update.status && !currentState.allowedTransitions.includes(update.status)) {
      throw new PaymentError(
        `Invalid status transition from ${transaction.status} to ${update.status}`,
        'INVALID_TRANSITION'
      );
    }

    // Execute current state exit action
    if (update.status && update.status !== transaction.status) {
      await this.executeStateAction(transaction, 'onExit');
    }

    // Update transaction
    const updatedTransaction: Transaction = {
      ...transaction,
      ...update,
      updatedAt: new Date()
    };

    // Set completion timestamps
    if (update.status) {
      switch (update.status) {
        case TransactionStatus.CONFIRMED:
          updatedTransaction.confirmedAt = new Date();
          break;
        case TransactionStatus.COMPLETED:
          updatedTransaction.completedAt = new Date();
          break;
        case TransactionStatus.FAILED:
          updatedTransaction.failedAt = new Date();
          break;
        case TransactionStatus.CANCELLED:
          updatedTransaction.cancelledAt = new Date();
          break;
        case TransactionStatus.REFUNDED:
          updatedTransaction.refundedAt = new Date();
          break;
      }
    }

    // Execute new state enter action
    if (update.status && update.status !== transaction.status) {
      await this.executeStateAction(updatedTransaction, 'onEnter');
    }

    // Emit status change event
    if (update.status && update.status !== transaction.status) {
      this.emit('statusChanged', {
        transaction: updatedTransaction,
        previousStatus: transaction.status,
        newStatus: update.status
      });
    }

    // In a real implementation, this would save to database
    logger.info('Transaction updated', {
      transactionId: updatedTransaction.id,
      previousStatus: transaction.status,
      newStatus: updatedTransaction.status,
      update
    });

    // Audit log
    logAudit('Transaction updated', {
      action: 'UPDATE_TRANSACTION',
      resource: 'transaction',
      resourceId: updatedTransaction.id
    }, {
      previousStatus: transaction.status,
      newStatus: updatedTransaction.status,
      update
    });

    return updatedTransaction;
  }

  /**
   * Mark transaction as failed
   */
  public async markAsFailed(
    transactionId: string,
    reason: string,
    retryable: boolean = false
  ): Promise<Transaction> {
    const transaction = await this.getTransaction(transactionId);

    if (!transaction) {
      throw new ValidationError('Transaction not found', 'transactionId');
    }

    // Check if we should retry
    if (retryable && transaction.retryCount < transaction.maxRetries) {
      return await this.updateTransactionStatus(transactionId, {
        retryCount: transaction.retryCount + 1,
        failureReason: reason,
        lastRetryAt: new Date()
      });
    }

    // Mark as failed
    return await this.updateTransactionStatus(transactionId, {
      status: TransactionStatus.FAILED,
      failureReason: reason
    });
  }

  /**
   * Process transaction confirmation
   */
  public async confirmTransaction(
    transactionId: string,
    externalTransactionId?: string,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    return await this.updateTransactionStatus(transactionId, {
      status: TransactionStatus.CONFIRMED,
      externalTransactionId,
      metadata: { ...metadata }
    });
  }

  /**
   * Complete transaction
   */
  public async completeTransaction(
    transactionId: string,
    externalTransactionId?: string
  ): Promise<Transaction> {
    return await this.updateTransactionStatus(transactionId, {
      status: TransactionStatus.COMPLETED,
      externalTransactionId
    });
  }

  /**
   * Cancel transaction
   */
  public async cancelTransaction(
    transactionId: string,
    reason: string
  ): Promise<Transaction> {
    return await this.updateTransactionStatus(transactionId, {
      status: TransactionStatus.CANCELLED,
      failureReason: reason
    });
  }

  /**
   * Process refund
   */
  public async processRefund(
    transactionId: string,
    refundAmount?: number,
    reason?: string
  ): Promise<Transaction> {
    const transaction = await this.getTransaction(transactionId);

    if (!transaction) {
      throw new ValidationError('Transaction not found', 'transactionId');
    }

    // Validate transaction can be refunded
    if (![TransactionStatus.COMPLETED, TransactionStatus.CONFIRMED].includes(transaction.status)) {
      throw new PaymentError(
        'Transaction cannot be refunded in current status',
        'INVALID_STATUS_FOR_REFUND'
      );
    }

    const actualRefundAmount = refundAmount || transaction.amount;

    // Check if partial or full refund
    if (actualRefundAmount === transaction.amount) {
      return await this.updateTransactionStatus(transactionId, {
        status: TransactionStatus.REFUNDED,
        failureReason: reason,
        metadata: {
          ...transaction.metadata,
          refundAmount: actualRefundAmount,
          refundReason: reason
        }
      });
    } else {
      return await this.updateTransactionStatus(transactionId, {
        status: TransactionStatus.PARTIALLY_REFUNDED,
        failureReason: reason,
        metadata: {
          ...transaction.metadata,
          refundAmount: actualRefundAmount,
          refundReason: reason
        }
      });
    }
  }

  /**
   * Expire transaction
   */
  public async expireTransaction(transactionId: string): Promise<Transaction> {
    return await this.updateTransactionStatus(transactionId, {
      status: TransactionStatus.EXPIRED
    });
  }

  /**
   * Get transaction by ID
   */
  public async getTransaction(transactionId: string): Promise<Transaction | null> {
    // In a real implementation, this would query the database
    // For now, return null
    return null;
  }

  /**
   * Get transactions by criteria
   */
  public async getTransactions(criteria: {
    customerId?: string;
    merchantId?: string;
    orderId?: string;
    status?: TransactionStatus[];
    provider?: PaymentProvider[];
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    // In a real implementation, this would query the database
    return { transactions: [], total: 0 };
  }

  /**
   * Check for expired transactions and update them
   */
  public async processExpiredTransactions(): Promise<number> {
    // In a real implementation, this would query for expired transactions
    const expiredCount = 0;

    logger.info('Processed expired transactions', { count: expiredCount });

    return expiredCount;
  }

  /**
   * Get transaction statistics
   */
  public async getTransactionStatistics(period: 'day' | 'week' | 'month' = 'day'): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalAmount: number;
    averageAmount: number;
    statusBreakdown: Record<TransactionStatus, number>;
    providerBreakdown: Record<PaymentProvider, number>;
  }> {
    // In a real implementation, this would query the database
    return {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      totalAmount: 0,
      averageAmount: 0,
      statusBreakdown: {} as Record<TransactionStatus, number>,
      providerBreakdown: {} as Record<PaymentProvider, number>
    };
  }

  /**
   * Initialize transaction state machine
   */
  private initializeStateMachine(): void {
    this.states = new Map([
      [TransactionStatus.PENDING, {
        status: TransactionStatus.PENDING,
        allowedTransitions: [
          TransactionStatus.PROCESSING,
          TransactionStatus.AWAITING_CONFIRMATION,
          TransactionStatus.FAILED,
          TransactionStatus.CANCELLED,
          TransactionStatus.EXPIRED
        ],
        actions: {
          onEnter: async (transaction) => {
            logger.debug('Transaction entered pending state', { transactionId: transaction.id });
          }
        }
      }],

      [TransactionStatus.PROCESSING, {
        status: TransactionStatus.PROCESSING,
        allowedTransitions: [
          TransactionStatus.AWAITING_CONFIRMATION,
          TransactionStatus.CONFIRMED,
          TransactionStatus.FAILED,
          TransactionStatus.CANCELLED,
          TransactionStatus.EXPIRED
        ],
        actions: {
          onEnter: async (transaction) => {
            logger.debug('Transaction entered processing state', { transactionId: transaction.id });
            // Could trigger webhook notifications here
          }
        }
      }],

      [TransactionStatus.AWAITING_CONFIRMATION, {
        status: TransactionStatus.AWAITING_CONFIRMATION,
        allowedTransitions: [
          TransactionStatus.CONFIRMED,
          TransactionStatus.FAILED,
          TransactionStatus.CANCELLED,
          TransactionStatus.EXPIRED
        ],
        actions: {
          onEnter: async (transaction) => {
            logger.debug('Transaction awaiting confirmation', { transactionId: transaction.id });
            // Could send confirmation request notifications
          }
        }
      }],

      [TransactionStatus.CONFIRMED, {
        status: TransactionStatus.CONFIRMED,
        allowedTransitions: [
          TransactionStatus.COMPLETED,
          TransactionStatus.FAILED,
          TransactionStatus.REFUNDED,
          TransactionStatus.PARTIALLY_REFUNDED
        ],
        actions: {
          onEnter: async (transaction) => {
            logger.info('Transaction confirmed', { transactionId: transaction.id });
            // Could trigger fulfillment processes
          }
        }
      }],

      [TransactionStatus.COMPLETED, {
        status: TransactionStatus.COMPLETED,
        allowedTransitions: [
          TransactionStatus.REFUNDED,
          TransactionStatus.PARTIALLY_REFUNDED,
          TransactionStatus.DISPUTED
        ],
        actions: {
          onEnter: async (transaction) => {
            logger.info('Transaction completed', { transactionId: transaction.id });
            // Could trigger settlement processes
          }
        }
      }],

      [TransactionStatus.FAILED, {
        status: TransactionStatus.FAILED,
        allowedTransitions: [],
        actions: {
          onEnter: async (transaction) => {
            logger.warn('Transaction failed', {
              transactionId: transaction.id,
              reason: transaction.failureReason
            });
            // Could trigger failure notifications
          }
        }
      }],

      [TransactionStatus.CANCELLED, {
        status: TransactionStatus.CANCELLED,
        allowedTransitions: [],
        actions: {
          onEnter: async (transaction) => {
            logger.info('Transaction cancelled', { transactionId: transaction.id });
            // Could trigger cancellation notifications
          }
        }
      }],

      [TransactionStatus.REFUNDED, {
        status: TransactionStatus.REFUNDED,
        allowedTransitions: [TransactionStatus.DISPUTED],
        actions: {
          onEnter: async (transaction) => {
            logger.info('Transaction refunded', { transactionId: transaction.id });
            // Could trigger refund notifications
          }
        }
      }],

      [TransactionStatus.PARTIALLY_REFUNDED, {
        status: TransactionStatus.PARTIALLY_REFUNDED,
        allowedTransitions: [
          TransactionStatus.REFUNDED,
          TransactionStatus.DISPUTED
        ],
        actions: {
          onEnter: async (transaction) => {
            logger.info('Transaction partially refunded', { transactionId: transaction.id });
            // Could trigger partial refund notifications
          }
        }
      }],

      [TransactionStatus.DISPUTED, {
        status: TransactionStatus.DISPUTED,
        allowedTransitions: [
          TransactionStatus.COMPLETED,
          TransactionStatus.REFUNDED
        ],
        actions: {
          onEnter: async (transaction) => {
            logger.warn('Transaction disputed', { transactionId: transaction.id });
            // Could trigger dispute resolution processes
          }
        }
      }],

      [TransactionStatus.EXPIRED, {
        status: TransactionStatus.EXPIRED,
        allowedTransitions: [],
        actions: {
          onEnter: async (transaction) => {
            logger.warn('Transaction expired', { transactionId: transaction.id });
            // Could trigger expiration notifications
          }
        }
      }]
    ]);
  }

  /**
   * Execute state action
   */
  private async executeStateAction(
    transaction: Transaction,
    actionType: 'onEnter' | 'onExit'
  ): Promise<void> {
    try {
      const state = this.states.get(transaction.status);
      const action = state?.actions[actionType];

      if (action) {
        await action(transaction);
      }
    } catch (error) {
      logger.error(`Failed to execute ${actionType} action for transaction`, {
        transactionId: transaction.id,
        status: transaction.status,
        error: error.message
      });
      // Don't throw error to avoid blocking transaction updates
    }
  }

  /**
   * Validate transaction state transition
   */
  public isValidTransition(
    currentStatus: TransactionStatus,
    newStatus: TransactionStatus
  ): boolean {
    const currentState = this.states.get(currentStatus);
    return currentState ? currentState.allowedTransitions.includes(newStatus) : false;
  }

  /**
   * Get available transitions for a status
   */
  public getAvailableTransitions(status: TransactionStatus): TransactionStatus[] {
    const state = this.states.get(status);
    return state ? state.allowedTransitions : [];
  }
}