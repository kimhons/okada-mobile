import 'app_error.dart';

/// Network-related errors (E001-E009)
class NetworkError extends AppError {
  const NetworkError._({
    required super.code,
    required super.userMessage,
    super.technicalMessage,
    super.recoveryAction,
    super.originalException,
    super.stackTrace,
  });

  /// E001: No internet connection
  const NetworkError.noConnection({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E001',
          userMessage: 'No internet connection. Please check your network.',
          technicalMessage: technicalMessage ?? 'Network connectivity check failed',
          recoveryAction: RecoveryAction.checkConnection,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E002: Request timeout
  const NetworkError.timeout({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E002',
          userMessage: 'Request timed out. Please try again.',
          technicalMessage: technicalMessage ?? 'Request exceeded timeout limit',
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E003: Server unreachable
  const NetworkError.serverUnreachable({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E003',
          userMessage: 'Unable to reach server. Please try again later.',
          technicalMessage: technicalMessage ?? 'Server connection failed',
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E004: Connection reset
  const NetworkError.connectionReset({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E004',
          userMessage: 'Connection was interrupted. Please try again.',
          technicalMessage: technicalMessage ?? 'Connection reset by peer',
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E005: DNS resolution failed
  const NetworkError.dnsFailure({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E005',
          userMessage: 'Unable to connect. Please check your network settings.',
          technicalMessage: technicalMessage ?? 'DNS resolution failed',
          recoveryAction: RecoveryAction.checkConnection,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E006: SSL/TLS certificate error
  const NetworkError.sslError({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E006',
          userMessage: 'Secure connection failed. Please update the app.',
          technicalMessage: technicalMessage ?? 'SSL certificate validation failed',
          recoveryAction: RecoveryAction.updateApp,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E007: Request cancelled
  const NetworkError.cancelled({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E007',
          userMessage: 'Request was cancelled.',
          technicalMessage: technicalMessage ?? 'Request cancelled by user or system',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E008: Too many requests (rate limited)
  const NetworkError.rateLimited({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E008',
          userMessage: 'Too many requests. Please wait a moment and try again.',
          technicalMessage: technicalMessage ?? 'Rate limit exceeded (429)',
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E009: Bad response format
  const NetworkError.badResponse({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E009',
          userMessage: 'Received invalid response. Please try again.',
          technicalMessage: technicalMessage ?? 'Response parsing failed',
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  @override
  String getLocalizedMessage(String languageCode) {
    if (languageCode != 'fr') return userMessage;
    
    switch (code) {
      case 'E001':
        return 'Pas de connexion internet. Veuillez vérifier votre réseau.';
      case 'E002':
        return 'La requête a expiré. Veuillez réessayer.';
      case 'E003':
        return 'Impossible de joindre le serveur. Veuillez réessayer plus tard.';
      case 'E004':
        return 'La connexion a été interrompue. Veuillez réessayer.';
      case 'E005':
        return 'Impossible de se connecter. Veuillez vérifier vos paramètres réseau.';
      case 'E006':
        return 'La connexion sécurisée a échoué. Veuillez mettre à jour l\'application.';
      case 'E007':
        return 'La requête a été annulée.';
      case 'E008':
        return 'Trop de requêtes. Veuillez patienter un moment et réessayer.';
      case 'E009':
        return 'Réponse invalide reçue. Veuillez réessayer.';
      default:
        return userMessage;
    }
  }

  @override
  ErrorSeverity get severity {
    switch (code) {
      case 'E001':
      case 'E007':
        return ErrorSeverity.warning;
      case 'E006':
        return ErrorSeverity.critical;
      default:
        return ErrorSeverity.error;
    }
  }

  @override
  bool get shouldReport {
    // Don't report user-initiated cancellations or connectivity issues
    return code != 'E001' && code != 'E007';
  }
}
