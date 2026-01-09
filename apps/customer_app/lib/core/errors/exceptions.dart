// Base exception class
abstract class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  const AppException(this.message, {this.code, this.details});

  @override
  String toString() => 'AppException: $message';
}

// Network related exceptions
class NetworkException extends AppException {
  const NetworkException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ServerException extends AppException {
  const ServerException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class TimeoutException extends AppException {
  const TimeoutException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class UnauthorizedException extends AppException {
  const UnauthorizedException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ForbiddenException extends AppException {
  const ForbiddenException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class NotFoundException extends AppException {
  const NotFoundException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class BadRequestException extends AppException {
  const BadRequestException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ConflictException extends AppException {
  const ConflictException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Cache related exceptions
class CacheException extends AppException {
  const CacheException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Local storage exceptions
class StorageException extends AppException {
  const StorageException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Authentication exceptions
class AuthenticationException extends AppException {
  const AuthenticationException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class TokenExpiredException extends AppException {
  const TokenExpiredException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Validation exceptions
class ValidationException extends AppException {
  final Map<String, List<String>>? fieldErrors;

  const ValidationException(
    String message, {
    String? code,
    dynamic details,
    this.fieldErrors,
  }) : super(message, code: code, details: details);
}

// Location exceptions
class LocationException extends AppException {
  const LocationException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class LocationPermissionException extends AppException {
  const LocationPermissionException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class LocationServiceException extends AppException {
  const LocationServiceException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Payment exceptions
class PaymentException extends AppException {
  const PaymentException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class PaymentMethodException extends AppException {
  const PaymentMethodException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class InsufficientFundsException extends AppException {
  const InsufficientFundsException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// AI/ML exceptions
class AiException extends AppException {
  const AiException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class ModelLoadException extends AppException {
  const ModelLoadException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class PredictionException extends AppException {
  const PredictionException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// File handling exceptions
class FileException extends AppException {
  const FileException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class FileSizeException extends AppException {
  const FileSizeException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class FileFormatException extends AppException {
  const FileFormatException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Device exceptions
class DeviceException extends AppException {
  const DeviceException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class BiometricException extends AppException {
  const BiometricException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class CameraException extends AppException {
  const CameraException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Business logic exceptions
class BusinessLogicException extends AppException {
  const BusinessLogicException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class OutOfStockException extends AppException {
  const OutOfStockException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class OrderException extends AppException {
  const OrderException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

class DeliveryException extends AppException {
  const DeliveryException(String message, {String? code, dynamic details})
      : super(message, code: code, details: details);
}

// Utility class for exception handling
class ExceptionUtils {
  static String getDisplayMessage(AppException exception) {
    switch (exception.runtimeType) {
      case NetworkException:
        return 'Network error. Please check your connection.';
      case TimeoutException:
        return 'Request timed out. Please try again.';
      case UnauthorizedException:
        return 'Please log in to continue.';
      case ForbiddenException:
        return 'You don\'t have permission to perform this action.';
      case NotFoundException:
        return 'The requested resource was not found.';
      case ServerException:
        return 'Server error. Please try again later.';
      case ValidationException:
        return exception.message;
      case OutOfStockException:
        return 'This item is currently out of stock.';
      case PaymentException:
        return 'Payment failed. Please try again.';
      case LocationException:
        return 'Location access is required for delivery.';
      default:
        return exception.message.isNotEmpty
            ? exception.message
            : 'An unexpected error occurred.';
    }
  }

  static bool isRetryable(AppException exception) {
    switch (exception.runtimeType) {
      case NetworkException:
      case TimeoutException:
      case ServerException:
        return true;
      case UnauthorizedException:
      case ForbiddenException:
      case NotFoundException:
      case ValidationException:
      case BadRequestException:
        return false;
      default:
        return false;
    }
  }

  static bool shouldLogout(AppException exception) {
    return exception is UnauthorizedException ||
           exception is TokenExpiredException;
  }

  static Map<String, dynamic> toJson(AppException exception) {
    return {
      'type': exception.runtimeType.toString(),
      'message': exception.message,
      'code': exception.code,
      'details': exception.details,
      'timestamp': DateTime.now().toIso8601String(),
    };
  }
}