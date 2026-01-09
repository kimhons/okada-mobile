import 'package:equatable/equatable.dart';

/// Recovery actions that can be suggested to users when errors occur
enum RecoveryAction {
  /// Retry the failed operation
  retry,
  
  /// Re-authenticate the user
  relogin,
  
  /// Contact customer support
  contactSupport,
  
  /// Update the app to latest version
  updateApp,
  
  /// Check internet connection
  checkConnection,
  
  /// Try a different payment method
  tryDifferentPayment,
  
  /// Go back to previous screen
  goBack,
  
  /// Refresh the current screen
  refresh,
  
  /// Clear cache and retry
  clearCache,
  
  /// No specific action needed
  none,
}

/// Base class for all application errors
/// 
/// Provides a consistent error structure with:
/// - Error code for programmatic handling
/// - User-friendly message for display
/// - Technical message for logging
/// - Suggested recovery action
abstract class AppError extends Equatable implements Exception {
  /// Unique error code (e.g., E001, E010)
  final String code;
  
  /// User-friendly error message (can be shown in UI)
  final String userMessage;
  
  /// Technical error message (for logging/debugging)
  final String? technicalMessage;
  
  /// Suggested action for recovery
  final RecoveryAction recoveryAction;
  
  /// Original exception that caused this error
  final dynamic originalException;
  
  /// Stack trace from original exception
  final StackTrace? stackTrace;

  const AppError({
    required this.code,
    required this.userMessage,
    this.technicalMessage,
    this.recoveryAction = RecoveryAction.none,
    this.originalException,
    this.stackTrace,
  });

  @override
  List<Object?> get props => [code, userMessage, technicalMessage, recoveryAction];

  @override
  String toString() => 'AppError($code): $userMessage';

  /// Get localized user message based on language code
  String getLocalizedMessage(String languageCode) {
    // Override in subclasses for localization
    return userMessage;
  }

  /// Whether this error is recoverable
  bool get isRecoverable => recoveryAction != RecoveryAction.none;

  /// Whether this error should be reported to crash analytics
  bool get shouldReport => true;

  /// Error severity level
  ErrorSeverity get severity => ErrorSeverity.error;
}

/// Error severity levels
enum ErrorSeverity {
  /// Informational - not really an error
  info,
  
  /// Warning - something unexpected but not critical
  warning,
  
  /// Error - operation failed but app can continue
  error,
  
  /// Critical - app may need to restart or user needs to re-authenticate
  critical,
  
  /// Fatal - app cannot continue
  fatal,
}

/// Generic unknown error
class UnknownError extends AppError {
  const UnknownError({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : super(
          code: 'E000',
          userMessage: 'An unexpected error occurred. Please try again.',
          technicalMessage: technicalMessage,
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  @override
  String getLocalizedMessage(String languageCode) {
    if (languageCode == 'fr') {
      return 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
    }
    return userMessage;
  }
}
