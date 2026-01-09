import 'app_error.dart';

/// Payment-related errors (E020-E029)
class PaymentError extends AppError {
  const PaymentError._({
    required super.code,
    required super.userMessage,
    super.technicalMessage,
    super.recoveryAction,
    super.originalException,
    super.stackTrace,
  });

  /// E020: Insufficient funds
  const PaymentError.insufficientFunds({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E020',
          userMessage: 'Insufficient funds. Please try a different payment method.',
          technicalMessage: technicalMessage ?? 'Payment failed - insufficient balance',
          recoveryAction: RecoveryAction.tryDifferentPayment,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E021: Payment declined
  const PaymentError.declined({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E021',
          userMessage: 'Payment was declined. Please try again or use a different method.',
          technicalMessage: technicalMessage ?? 'Payment declined by provider',
          recoveryAction: RecoveryAction.tryDifferentPayment,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E022: Payment timeout
  const PaymentError.timeout({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E022',
          userMessage: 'Payment timed out. Please check your transaction history.',
          technicalMessage: technicalMessage ?? 'Payment request timed out',
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E023: Invalid payment method
  const PaymentError.invalidMethod({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E023',
          userMessage: 'Invalid payment method. Please select another option.',
          technicalMessage: technicalMessage ?? 'Payment method validation failed',
          recoveryAction: RecoveryAction.tryDifferentPayment,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E024: Payment provider unavailable (MTN/Orange)
  const PaymentError.providerUnavailable({
    String? providerName,
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E024',
          userMessage: '${providerName ?? 'Payment service'} is temporarily unavailable. Please try later.',
          technicalMessage: technicalMessage ?? 'Payment provider service unavailable',
          recoveryAction: RecoveryAction.tryDifferentPayment,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E025: Invalid phone number for mobile money
  const PaymentError.invalidMobileMoneyNumber({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E025',
          userMessage: 'Invalid mobile money number. Please check and try again.',
          technicalMessage: technicalMessage ?? 'Mobile money number validation failed',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E026: Payment already processed
  const PaymentError.alreadyProcessed({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E026',
          userMessage: 'This payment has already been processed.',
          technicalMessage: technicalMessage ?? 'Duplicate payment attempt',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E027: Refund failed
  const PaymentError.refundFailed({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E027',
          userMessage: 'Refund could not be processed. Please contact support.',
          technicalMessage: technicalMessage ?? 'Refund processing failed',
          recoveryAction: RecoveryAction.contactSupport,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E028: Payment verification failed
  const PaymentError.verificationFailed({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E028',
          userMessage: 'Could not verify payment. Please check your transaction history.',
          technicalMessage: technicalMessage ?? 'Payment verification failed',
          recoveryAction: RecoveryAction.contactSupport,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E029: Payment amount exceeds limit
  const PaymentError.amountExceedsLimit({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E029',
          userMessage: 'Payment amount exceeds the allowed limit.',
          technicalMessage: technicalMessage ?? 'Payment amount exceeds transaction limit',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  @override
  String getLocalizedMessage(String languageCode) {
    if (languageCode != 'fr') return userMessage;
    
    switch (code) {
      case 'E020':
        return 'Solde insuffisant. Veuillez essayer un autre mode de paiement.';
      case 'E021':
        return 'Paiement refusé. Veuillez réessayer ou utiliser un autre mode.';
      case 'E022':
        return 'Le paiement a expiré. Veuillez vérifier votre historique de transactions.';
      case 'E023':
        return 'Mode de paiement invalide. Veuillez sélectionner une autre option.';
      case 'E024':
        return 'Le service de paiement est temporairement indisponible. Veuillez réessayer plus tard.';
      case 'E025':
        return 'Numéro Mobile Money invalide. Veuillez vérifier et réessayer.';
      case 'E026':
        return 'Ce paiement a déjà été traité.';
      case 'E027':
        return 'Le remboursement n\'a pas pu être traité. Veuillez contacter le support.';
      case 'E028':
        return 'Impossible de vérifier le paiement. Veuillez vérifier votre historique.';
      case 'E029':
        return 'Le montant du paiement dépasse la limite autorisée.';
      default:
        return userMessage;
    }
  }

  @override
  ErrorSeverity get severity => ErrorSeverity.error;

  @override
  bool get shouldReport {
    // Report all payment errors for financial tracking
    return true;
  }
}
