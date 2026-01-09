import 'package:equatable/equatable.dart';

// Base failure class
abstract class Failure extends Equatable {
  final String message;
  final String? code;
  final dynamic details;

  const Failure(this.message, {this.code, this.details});

  @override
  List<Object?> get props => [message, code, details];

  @override
  String toString() => 'Failure: $message';
}

// Network related failures
class NetworkFailure extends Failure {
  const NetworkFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ServerFailure extends Failure {
  const ServerFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class TimeoutFailure extends Failure {
  const TimeoutFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ForbiddenFailure extends Failure {
  const ForbiddenFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class BadRequestFailure extends Failure {
  const BadRequestFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ConflictFailure extends Failure {
  const ConflictFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Cache related failures
class CacheFailure extends Failure {
  const CacheFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Local storage failures
class StorageFailure extends Failure {
  const StorageFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Authentication failures
class AuthenticationFailure extends Failure {
  const AuthenticationFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class TokenExpiredFailure extends Failure {
  const TokenExpiredFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Validation failures
class ValidationFailure extends Failure {
  final Map<String, List<String>>? fieldErrors;

  const ValidationFailure(
    String message, {
    String? code,
    dynamic details,
    this.fieldErrors,
  }) : super(message, code: code, details: details);

  @override
  List<Object?> get props => [message, code, details, fieldErrors];
}

// Location failures
class LocationFailure extends Failure {
  const LocationFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class LocationPermissionFailure extends Failure {
  const LocationPermissionFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class LocationServiceFailure extends Failure {
  const LocationServiceFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Payment failures
class PaymentFailure extends Failure {
  const PaymentFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class PaymentMethodFailure extends Failure {
  const PaymentMethodFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class InsufficientFundsFailure extends Failure {
  const InsufficientFundsFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// AI/ML failures
class AiFailure extends Failure {
  const AiFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ModelLoadFailure extends Failure {
  const ModelLoadFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class PredictionFailure extends Failure {
  const PredictionFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// File handling failures
class FileFailure extends Failure {
  const FileFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class FileSizeFailure extends Failure {
  const FileSizeFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class FileFormatFailure extends Failure {
  const FileFormatFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Device failures
class DeviceFailure extends Failure {
  const DeviceFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class BiometricFailure extends Failure {
  const BiometricFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class CameraFailure extends Failure {
  const CameraFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Business logic failures
class BusinessLogicFailure extends Failure {
  const BusinessLogicFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class OutOfStockFailure extends Failure {
  const OutOfStockFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class OrderFailure extends Failure {
  const OrderFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class DeliveryFailure extends Failure {
  const DeliveryFailure(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Utility class for failure handling
class FailureUtils {
  static String getDisplayMessage(Failure failure) {
    switch (failure.runtimeType) {
      case NetworkFailure:
        return 'Network error. Please check your connection.';
      case TimeoutFailure:
        return 'Request timed out. Please try again.';
      case UnauthorizedFailure:
        return 'Please log in to continue.';
      case ForbiddenFailure:
        return 'You don\'t have permission to perform this action.';
      case NotFoundFailure:
        return 'The requested resource was not found.';
      case ServerFailure:
        return 'Server error. Please try again later.';
      case ValidationFailure:
        return failure.message;
      case OutOfStockFailure:
        return 'This item is currently out of stock.';
      case PaymentFailure:
        return 'Payment failed. Please try again.';
      case LocationFailure:
        return 'Location access is required for delivery.';
      default:
        return failure.message.isNotEmpty
            ? failure.message
            : 'An unexpected error occurred.';
    }
  }

  static bool isRetryable(Failure failure) {
    switch (failure.runtimeType) {
      case NetworkFailure:
      case TimeoutFailure:
      case ServerFailure:
        return true;
      case UnauthorizedFailure:
      case ForbiddenFailure:
      case NotFoundFailure:
      case ValidationFailure:
      case BadRequestFailure:
        return false;
      default:
        return false;
    }
  }

  static bool shouldLogout(Failure failure) {
    return failure is UnauthorizedFailure ||
           failure is TokenExpiredFailure;
  }

  static Map<String, dynamic> toJson(Failure failure) {
    return {
      'type': failure.runtimeType.toString(),
      'message': failure.message,
      'code': failure.code,
      'details': failure.details,
      'timestamp': DateTime.now().toIso8601String(),
    };
  }
}