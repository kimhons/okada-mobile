/**
 * USSD Service
 * Handles USSD fallback payments for MTN and Orange Money
 */

import { EventEmitter } from 'events';
import {
  PaymentRequest,
  PaymentResponse,
  USSDSession,
  PaymentProvider,
  TransactionStatus,
  CurrencyCode,
  PaymentError,
  ValidationError,
  CameroonPhoneNumber
} from '@/types';
import { logger, logUSSD } from '@/utils/logger';
import {
  validateAndFormatPhoneNumber,
  generateTransactionReference,
  formatCurrency,
  generateSecureRandomString,
  validateUSSDSession
} from '@/utils/helpers';
import { config } from '@/config';
import { v4 as uuidv4 } from 'uuid';

interface USSDStep {
  id: string;
  message: string;
  expectedInput?: string;
  nextStep?: string;
  action?: (session: USSDSession, input: string) => Promise<USSDStepResult>;
}

interface USSDStepResult {
  nextStep?: string;
  message: string;
  endSession?: boolean;
  data?: Record<string, any>;
}

interface USSDMenu {
  [key: string]: USSDStep;
}

export class USSDService extends EventEmitter {
  private sessions: Map<string, USSDSession>;
  private mtnMenu: USSDMenu;
  private orangeMenu: USSDMenu;
  private sessionTimeout: number = 3 * 60 * 1000; // 3 minutes

  constructor() {
    super();
    this.sessions = new Map();
    this.initializeMenus();
    this.startSessionCleanup();
  }

  /**
   * Initiate USSD payment session
   */
  public async initiateUSSDPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate phone number
      const phoneInfo = validateAndFormatPhoneNumber(request.phoneNumber!);
      if (!phoneInfo) {
        throw new ValidationError('Invalid phone number format', 'phoneNumber');
      }

      // Check provider compatibility
      if (
        (request.provider === PaymentProvider.MTN_MOBILE_MONEY && phoneInfo.operator !== 'MTN') ||
        (request.provider === PaymentProvider.ORANGE_MONEY && phoneInfo.operator !== 'ORANGE')
      ) {
        throw new ValidationError(
          `Phone number operator ${phoneInfo.operator} not compatible with ${request.provider}`,
          'phoneNumber'
        );
      }

      // Create USSD session
      const sessionId = this.generateSessionId();
      const transactionId = uuidv4();

      const session: USSDSession = {
        sessionId,
        phoneNumber: phoneInfo.formatted,
        provider: request.provider,
        transactionId,
        currentStep: 'welcome',
        data: {
          orderId: request.orderId,
          customerId: request.customerId,
          amount: request.amount,
          currency: request.currency,
          description: request.description,
          merchantId: request.merchantId,
          metadata: request.metadata
        },
        expiresAt: new Date(Date.now() + this.sessionTimeout),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store session
      this.sessions.set(sessionId, session);

      // Generate payment response
      const ussdCode = config.cameroon.ussd[request.provider].code;
      const instructions = this.generateUSSDInstructions(request.provider, request.amount, sessionId);

      const paymentResponse: PaymentResponse = {
        transactionId,
        externalTransactionId: sessionId,
        status: TransactionStatus.PENDING,
        amount: request.amount,
        currency: request.currency,
        provider: request.provider,
        method: request.method,
        ussdCode,
        reference: generateTransactionReference(request.provider, request.orderId),
        message: instructions,
        expiresAt: session.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logUSSD('USSD payment session initiated', {
        sessionId,
        phoneNumber: phoneInfo.formatted,
        provider: request.provider,
        step: 'welcome'
      });

      return paymentResponse;
    } catch (error) {
      logger.error('Failed to initiate USSD payment:', {
        error: error.message,
        orderId: request.orderId,
        provider: request.provider
      });

      throw error;
    }
  }

  /**
   * Process USSD input
   */
  public async processUSSDInput(
    sessionId: string,
    input: string
  ): Promise<{ message: string; endSession: boolean }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return {
          message: 'Session expired or invalid. Please start a new payment.',
          endSession: true
        };
      }

      // Check session expiry
      if (new Date() > session.expiresAt) {
        this.sessions.delete(sessionId);
        return {
          message: 'Session expired. Please start a new payment.',
          endSession: true
        };
      }

      // Get current step
      const menu = session.provider === PaymentProvider.MTN_MOBILE_MONEY ? this.mtnMenu : this.orangeMenu;
      const currentStep = menu[session.currentStep];

      if (!currentStep) {
        return {
          message: 'Invalid session state. Please start a new payment.',
          endSession: true
        };
      }

      // Process input
      let result: USSDStepResult;

      if (currentStep.action) {
        result = await currentStep.action(session, input);
      } else {
        // Simple navigation
        result = {
          nextStep: currentStep.nextStep,
          message: currentStep.message
        };
      }

      // Update session
      if (result.nextStep) {
        session.currentStep = result.nextStep;
      }

      if (result.data) {
        session.data = { ...session.data, ...result.data };
      }

      session.updatedAt = new Date();

      // End session if needed
      if (result.endSession) {
        this.sessions.delete(sessionId);
      }

      logUSSD('USSD input processed', {
        sessionId,
        phoneNumber: session.phoneNumber,
        provider: session.provider,
        step: session.currentStep
      });

      return {
        message: result.message,
        endSession: result.endSession || false
      };
    } catch (error) {
      logger.error('Failed to process USSD input:', {
        sessionId,
        input,
        error: error.message
      });

      return {
        message: 'An error occurred. Please try again or contact support.',
        endSession: true
      };
    }
  }

  /**
   * Get USSD session
   */
  public getSession(sessionId: string): USSDSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Cancel USSD session
   */
  public cancelSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);

      logUSSD('USSD session cancelled', {
        sessionId,
        phoneNumber: session.phoneNumber,
        provider: session.provider,
        step: session.currentStep
      });

      return true;
    }
    return false;
  }

  /**
   * Generate USSD instructions
   */
  private generateUSSDInstructions(
    provider: PaymentProvider,
    amount: number,
    sessionId: string
  ): string {
    const ussdCode = config.cameroon.ussd[provider].code;
    const formattedAmount = formatCurrency(amount);
    const providerName = provider === PaymentProvider.MTN_MOBILE_MONEY ? 'MTN Mobile Money' : 'Orange Money';

    return `
${providerName} USSD Payment Instructions:

1. Dial ${ussdCode} from your ${provider === PaymentProvider.MTN_MOBILE_MONEY ? 'MTN' : 'Orange'} phone
2. Select "Merchant Payment" or "Pay Bills"
3. Enter merchant code when prompted
4. Enter amount: ${formattedAmount}
5. Enter payment reference: ${sessionId}
6. Confirm with your ${providerName} PIN

Alternatively, you can:
- Use the ${providerName} mobile app
- Visit an authorized agent location
- Call customer service for assistance

Session expires in 3 minutes.
For support, contact +237 XXX XXX XXX
    `.trim();
  }

  /**
   * Initialize USSD menus
   */
  private initializeMenus(): void {
    // MTN Mobile Money menu
    this.mtnMenu = {
      welcome: {
        id: 'welcome',
        message: 'Welcome to MTN Mobile Money Payment\n1. Continue Payment\n2. Help\n3. Cancel',
        nextStep: 'main_menu'
      },
      main_menu: {
        id: 'main_menu',
        message: '',
        action: async (session, input) => {
          switch (input) {
            case '1':
              return {
                nextStep: 'confirm_amount',
                message: `Confirm payment amount: ${formatCurrency(session.data.amount)}\n1. Confirm\n2. Cancel`
              };
            case '2':
              return {
                nextStep: 'help',
                message: 'For assistance:\n- Call 8080\n- Visit nearest MTN office\n- SMS HELP to 8080'
              };
            case '3':
              return {
                message: 'Payment cancelled.',
                endSession: true
              };
            default:
              return {
                message: 'Invalid option. Please try again.\n1. Continue Payment\n2. Help\n3. Cancel'
              };
          }
        }
      },
      confirm_amount: {
        id: 'confirm_amount',
        message: '',
        action: async (session, input) => {
          switch (input) {
            case '1':
              return {
                nextStep: 'enter_pin',
                message: 'Enter your MTN Mobile Money PIN:'
              };
            case '2':
              return {
                message: 'Payment cancelled.',
                endSession: true
              };
            default:
              return {
                message: `Invalid option. Confirm payment amount: ${formatCurrency(session.data.amount)}\n1. Confirm\n2. Cancel`
              };
          }
        }
      },
      enter_pin: {
        id: 'enter_pin',
        message: '',
        action: async (session, input) => {
          // In a real implementation, this would validate the PIN with MTN
          if (input.length === 4 && /^\d+$/.test(input)) {
            // Simulate payment processing
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
              // Emit payment success event
              this.emit('paymentCompleted', {
                sessionId: session.sessionId,
                transactionId: session.transactionId,
                status: TransactionStatus.COMPLETED,
                provider: session.provider
              });

              return {
                message: `Payment successful!\nAmount: ${formatCurrency(session.data.amount)}\nReference: ${session.transactionId}\nThank you for using MTN Mobile Money.`,
                endSession: true
              };
            } else {
              return {
                message: 'Payment failed. Please check your balance and try again.',
                endSession: true
              };
            }
          } else {
            return {
              message: 'Invalid PIN format. Please enter 4-digit PIN:'
            };
          }
        }
      },
      help: {
        id: 'help',
        message: 'MTN Mobile Money Help:\n- Balance inquiry: *126*1#\n- Customer care: 8080\n- Nearest agent: *126*4#\n\n0. Back to main menu',
        action: async (session, input) => {
          if (input === '0') {
            return {
              nextStep: 'main_menu',
              message: 'Welcome to MTN Mobile Money Payment\n1. Continue Payment\n2. Help\n3. Cancel'
            };
          }
          return {
            message: 'MTN Mobile Money Help:\n- Balance inquiry: *126*1#\n- Customer care: 8080\n- Nearest agent: *126*4#\n\n0. Back to main menu'
          };
        }
      }
    };

    // Orange Money menu
    this.orangeMenu = {
      welcome: {
        id: 'welcome',
        message: 'Bienvenue sur Orange Money\n1. Continuer le paiement\n2. Aide\n3. Annuler',
        nextStep: 'main_menu'
      },
      main_menu: {
        id: 'main_menu',
        message: '',
        action: async (session, input) => {
          switch (input) {
            case '1':
              return {
                nextStep: 'confirm_amount',
                message: `Confirmer le montant: ${formatCurrency(session.data.amount)}\n1. Confirmer\n2. Annuler`
              };
            case '2':
              return {
                nextStep: 'help',
                message: 'Pour assistance:\n- Appelez #144#\n- Visitez une agence Orange\n- SMS AIDE au 8100'
              };
            case '3':
              return {
                message: 'Paiement annulé.',
                endSession: true
              };
            default:
              return {
                message: 'Option invalide. Réessayez.\n1. Continuer le paiement\n2. Aide\n3. Annuler'
              };
          }
        }
      },
      confirm_amount: {
        id: 'confirm_amount',
        message: '',
        action: async (session, input) => {
          switch (input) {
            case '1':
              return {
                nextStep: 'enter_pin',
                message: 'Entrez votre code PIN Orange Money:'
              };
            case '2':
              return {
                message: 'Paiement annulé.',
                endSession: true
              };
            default:
              return {
                message: `Option invalide. Confirmer le montant: ${formatCurrency(session.data.amount)}\n1. Confirmer\n2. Annuler`
              };
          }
        }
      },
      enter_pin: {
        id: 'enter_pin',
        message: '',
        action: async (session, input) => {
          // In a real implementation, this would validate the PIN with Orange
          if (input.length === 4 && /^\d+$/.test(input)) {
            // Simulate payment processing
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
              // Emit payment success event
              this.emit('paymentCompleted', {
                sessionId: session.sessionId,
                transactionId: session.transactionId,
                status: TransactionStatus.COMPLETED,
                provider: session.provider
              });

              return {
                message: `Paiement réussi!\nMontant: ${formatCurrency(session.data.amount)}\nRéférence: ${session.transactionId}\nMerci d'utiliser Orange Money.`,
                endSession: true
              };
            } else {
              return {
                message: 'Échec du paiement. Vérifiez votre solde et réessayez.',
                endSession: true
              };
            }
          } else {
            return {
              message: 'Format PIN invalide. Entrez un PIN à 4 chiffres:'
            };
          }
        }
      },
      help: {
        id: 'help',
        message: 'Aide Orange Money:\n- Solde: #144*4#\n- Service client: #144#\n- Agent proche: #144*5#\n\n0. Retour au menu principal',
        action: async (session, input) => {
          if (input === '0') {
            return {
              nextStep: 'main_menu',
              message: 'Bienvenue sur Orange Money\n1. Continuer le paiement\n2. Aide\n3. Annuler'
            };
          }
          return {
            message: 'Aide Orange Money:\n- Solde: #144*4#\n- Service client: #144#\n- Agent proche: #144*5#\n\n0. Retour au menu principal'
          };
        }
      }
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `USSD-${Date.now()}-${generateSecureRandomString(8)}`;
  }

  /**
   * Start session cleanup process
   */
  private startSessionCleanup(): void {
    setInterval(() => {
      const now = new Date();
      const expiredSessions: string[] = [];

      for (const [sessionId, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          expiredSessions.push(sessionId);
        }
      }

      for (const sessionId of expiredSessions) {
        this.sessions.delete(sessionId);
        logger.debug('USSD session cleaned up', { sessionId });
      }

      if (expiredSessions.length > 0) {
        logger.info('USSD session cleanup completed', {
          expiredCount: expiredSessions.length,
          activeCount: this.sessions.size
        });
      }
    }, 60000); // Run every minute
  }

  /**
   * Get USSD service statistics
   */
  public getStatistics(): {
    activeSessions: number;
    totalSessions: number;
    successRate: number;
    averageSessionDuration: number;
    providerBreakdown: Record<PaymentProvider, number>;
  } {
    // In a real implementation, this would include historical data
    const providerBreakdown = {
      [PaymentProvider.MTN_MOBILE_MONEY]: 0,
      [PaymentProvider.ORANGE_MONEY]: 0,
      [PaymentProvider.CASH]: 0
    };

    for (const session of this.sessions.values()) {
      providerBreakdown[session.provider]++;
    }

    return {
      activeSessions: this.sessions.size,
      totalSessions: this.sessions.size, // Mock data
      successRate: 0.85, // Mock data
      averageSessionDuration: 120, // Mock data in seconds
      providerBreakdown
    };
  }

  /**
   * Health check for USSD service
   */
  public healthCheck(): { status: 'healthy' | 'unhealthy'; details?: any } {
    try {
      return {
        status: 'healthy',
        details: {
          activeSessions: this.sessions.size,
          memoryUsage: process.memoryUsage()
        }
      };
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