import 'app_error.dart';

/// Server-related errors (E040-E049)
class ServerError extends AppError {
  /// HTTP status code (if applicable)
  final int? statusCode;

  const ServerError._({
    required super.code,
    required super.userMessage,
    super.technicalMessage,
    super.recoveryAction,
    super.originalException,
    super.stackTrace,
    this.statusCode,
  });

  /// E040: Internal server error (500)
  const ServerError.internalError({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E040',
          userMessage: 'Something went wrong on our end. Please try again.',
          technicalMessage: technicalMessage ?? 'Internal server error (500)',
          recoveryAction: RecoveryAction.retry,
          statusCode: 500,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E041: Service unavailable (503)
  const ServerError.serviceUnavailable({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E041',
          userMessage: 'Service is temporarily unavailable. Please try again later.',
          technicalMessage: technicalMessage ?? 'Service unavailable (503)',
          recoveryAction: RecoveryAction.retry,
          statusCode: 503,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E042: Bad gateway (502)
  const ServerError.badGateway({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E042',
          userMessage: 'Server communication error. Please try again.',
          technicalMessage: technicalMessage ?? 'Bad gateway (502)',
          recoveryAction: RecoveryAction.retry,
          statusCode: 502,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E043: Gateway timeout (504)
  const ServerError.gatewayTimeout({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E043',
          userMessage: 'Server took too long to respond. Please try again.',
          technicalMessage: technicalMessage ?? 'Gateway timeout (504)',
          recoveryAction: RecoveryAction.retry,
          statusCode: 504,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E044: Not found (404)
  const ServerError.notFound({
    String? resource,
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E044',
          userMessage: resource != null 
              ? '$resource not found.'
              : 'The requested resource was not found.',
          technicalMessage: technicalMessage ?? 'Resource not found (404)',
          recoveryAction: RecoveryAction.goBack,
          statusCode: 404,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E045: Bad request (400)
  const ServerError.badRequest({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E045',
          userMessage: 'Invalid request. Please check your input and try again.',
          technicalMessage: technicalMessage ?? 'Bad request (400)',
          recoveryAction: RecoveryAction.none,
          statusCode: 400,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E046: Conflict (409)
  const ServerError.conflict({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E046',
          userMessage: 'This action conflicts with existing data. Please refresh and try again.',
          technicalMessage: technicalMessage ?? 'Conflict (409)',
          recoveryAction: RecoveryAction.refresh,
          statusCode: 409,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E047: Unprocessable entity (422)
  const ServerError.unprocessableEntity({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E047',
          userMessage: 'Unable to process your request. Please check your input.',
          technicalMessage: technicalMessage ?? 'Unprocessable entity (422)',
          recoveryAction: RecoveryAction.none,
          statusCode: 422,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E048: Maintenance mode
  const ServerError.maintenance({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E048',
          userMessage: 'We\'re performing maintenance. Please try again later.',
          technicalMessage: technicalMessage ?? 'Server in maintenance mode',
          recoveryAction: RecoveryAction.retry,
          statusCode: 503,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E049: API version deprecated
  const ServerError.apiDeprecated({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E049',
          userMessage: 'Please update the app to continue using this feature.',
          technicalMessage: technicalMessage ?? 'API version deprecated',
          recoveryAction: RecoveryAction.updateApp,
          statusCode: 410,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// Create a ServerError from HTTP status code
  factory ServerError.fromStatusCode(
    int statusCode, {
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) {
    switch (statusCode) {
      case 400:
        return ServerError.badRequest(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 404:
        return ServerError.notFound(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 409:
        return ServerError.conflict(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 410:
        return ServerError.apiDeprecated(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 422:
        return ServerError.unprocessableEntity(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 500:
        return ServerError.internalError(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 502:
        return ServerError.badGateway(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 503:
        return ServerError.serviceUnavailable(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      case 504:
        return ServerError.gatewayTimeout(
          technicalMessage: technicalMessage,
          originalException: originalException,
          stackTrace: stackTrace,
        );
      default:
        return ServerError._(
          code: 'E040',
          userMessage: 'Server error occurred. Please try again.',
          technicalMessage: technicalMessage ?? 'HTTP $statusCode',
          recoveryAction: RecoveryAction.retry,
          statusCode: statusCode,
          originalException: originalException,
          stackTrace: stackTrace,
        );
    }
  }

  @override
  List<Object?> get props => [...super.props, statusCode];

  @override
  String getLocalizedMessage(String languageCode) {
    if (languageCode != 'fr') return userMessage;
    
    switch (code) {
      case 'E040':
        return 'Une erreur s\'est produite de notre côté. Veuillez réessayer.';
      case 'E041':
        return 'Le service est temporairement indisponible. Veuillez réessayer plus tard.';
      case 'E042':
        return 'Erreur de communication serveur. Veuillez réessayer.';
      case 'E043':
        return 'Le serveur a mis trop de temps à répondre. Veuillez réessayer.';
      case 'E044':
        return 'La ressource demandée n\'a pas été trouvée.';
      case 'E045':
        return 'Requête invalide. Veuillez vérifier vos données et réessayer.';
      case 'E046':
        return 'Cette action entre en conflit avec des données existantes. Veuillez actualiser et réessayer.';
      case 'E047':
        return 'Impossible de traiter votre demande. Veuillez vérifier vos données.';
      case 'E048':
        return 'Nous effectuons une maintenance. Veuillez réessayer plus tard.';
      case 'E049':
        return 'Veuillez mettre à jour l\'application pour continuer à utiliser cette fonctionnalité.';
      default:
        return userMessage;
    }
  }

  @override
  ErrorSeverity get severity {
    switch (code) {
      case 'E040':
      case 'E041':
      case 'E042':
      case 'E043':
        return ErrorSeverity.error;
      case 'E048':
        return ErrorSeverity.warning;
      case 'E049':
        return ErrorSeverity.critical;
      default:
        return ErrorSeverity.error;
    }
  }

  @override
  bool get shouldReport {
    // Report server errors for monitoring
    return statusCode != null && statusCode! >= 500;
  }
}
