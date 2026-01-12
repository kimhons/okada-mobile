/// Failure types for error handling
sealed class FailureReason {
  final String message;
  final String? code;
  final dynamic originalError;

  const FailureReason({
    required this.message,
    this.code,
    this.originalError,
  });

  /// Network failure
  factory FailureReason.network([String? message]) = NetworkFailure;

  /// Server failure
  factory FailureReason.server(String message, {String? code}) = ServerFailure;

  /// Authentication failure
  factory FailureReason.auth([String? message]) = AuthFailure;

  /// Validation failure
  factory FailureReason.validation(String message, {String? field}) =
      ValidationFailure;

  /// Not found failure
  factory FailureReason.notFound([String? message]) = NotFoundFailure;

  /// Permission failure
  factory FailureReason.permission([String? message]) = PermissionFailure;

  /// Cache failure
  factory FailureReason.cache([String? message]) = CacheFailure;

  /// Timeout failure
  factory FailureReason.timeout([String? message]) = TimeoutFailure;

  /// Cancelled failure
  factory FailureReason.cancelled([String? message]) = CancelledFailure;

  /// Unknown failure
  factory FailureReason.unknown([String? message]) = UnknownFailure;

  /// Payment failure
  factory FailureReason.payment(String message, {String? code}) =
      PaymentFailure;

  /// Location failure
  factory FailureReason.location([String? message]) = LocationFailure;

  @override
  String toString() => 'Failure: $message${code != null ? ' ($code)' : ''}';
}

/// Network failure (no internet, DNS, etc.)
final class NetworkFailure extends FailureReason {
  NetworkFailure([String? message])
      : super(
          message: message ?? 'Erreur de connexion réseau',
          code: 'NETWORK_ERROR',
        );
}

/// Server failure (5xx errors, unexpected responses)
final class ServerFailure extends FailureReason {
  ServerFailure(String message, {String? code})
      : super(
          message: message,
          code: code ?? 'SERVER_ERROR',
        );
}

/// Authentication failure (401, invalid token, etc.)
final class AuthFailure extends FailureReason {
  AuthFailure([String? message])
      : super(
          message: message ?? 'Session expirée, veuillez vous reconnecter',
          code: 'AUTH_ERROR',
        );
}

/// Validation failure (invalid input, form errors)
final class ValidationFailure extends FailureReason {
  final String? field;

  ValidationFailure(String message, {this.field})
      : super(
          message: message,
          code: 'VALIDATION_ERROR',
        );
}

/// Not found failure (404, resource doesn't exist)
final class NotFoundFailure extends FailureReason {
  NotFoundFailure([String? message])
      : super(
          message: message ?? 'Ressource non trouvée',
          code: 'NOT_FOUND',
        );
}

/// Permission failure (403, forbidden)
final class PermissionFailure extends FailureReason {
  PermissionFailure([String? message])
      : super(
          message: message ?? 'Accès non autorisé',
          code: 'PERMISSION_DENIED',
        );
}

/// Cache failure (storage errors)
final class CacheFailure extends FailureReason {
  CacheFailure([String? message])
      : super(
          message: message ?? 'Erreur de cache local',
          code: 'CACHE_ERROR',
        );
}

/// Timeout failure (request took too long)
final class TimeoutFailure extends FailureReason {
  TimeoutFailure([String? message])
      : super(
          message: message ?? 'La requête a pris trop de temps',
          code: 'TIMEOUT',
        );
}

/// Cancelled failure (user cancelled operation)
final class CancelledFailure extends FailureReason {
  CancelledFailure([String? message])
      : super(
          message: message ?? 'Opération annulée',
          code: 'CANCELLED',
        );
}

/// Unknown failure (catch-all)
final class UnknownFailure extends FailureReason {
  UnknownFailure([String? message])
      : super(
          message: message ?? 'Une erreur inattendue s\'est produite',
          code: 'UNKNOWN_ERROR',
        );
}

/// Payment failure
final class PaymentFailure extends FailureReason {
  PaymentFailure(String message, {String? code})
      : super(
          message: message,
          code: code ?? 'PAYMENT_ERROR',
        );
}

/// Location failure (GPS, permissions)
final class LocationFailure extends FailureReason {
  LocationFailure([String? message])
      : super(
          message: message ?? 'Impossible d\'obtenir la localisation',
          code: 'LOCATION_ERROR',
        );
}

/// Extension to convert exceptions to failures
extension ExceptionToFailure on Exception {
  FailureReason toFailure() {
    final message = toString().replaceFirst('Exception: ', '');
    return FailureReason.unknown(message);
  }
}
