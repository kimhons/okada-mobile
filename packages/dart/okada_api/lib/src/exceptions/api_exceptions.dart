/// Base API exception
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;
  
  ApiException(this.message, {this.statusCode, this.data});
  
  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}

/// Network-related exception
class NetworkException extends ApiException {
  NetworkException(String message) : super(message, statusCode: 0);
}

/// Unauthorized exception (401)
class UnauthorizedException extends ApiException {
  UnauthorizedException([String message = 'Unauthorized']) 
      : super(message, statusCode: 401);
}

/// Forbidden exception (403)
class ForbiddenException extends ApiException {
  ForbiddenException([String message = 'Access denied']) 
      : super(message, statusCode: 403);
}

/// Not found exception (404)
class NotFoundException extends ApiException {
  NotFoundException([String message = 'Resource not found']) 
      : super(message, statusCode: 404);
}

/// Validation exception (422)
class ValidationException extends ApiException {
  final Map<String, List<String>>? errors;
  
  ValidationException(String message, [this.errors]) 
      : super(message, statusCode: 422);
  
  String? getFirstError(String field) {
    return errors?[field]?.firstOrNull;
  }
  
  List<String> getAllErrors() {
    if (errors == null) return [message];
    return errors!.values.expand((e) => e).toList();
  }
}

/// Server exception (5xx)
class ServerException extends ApiException {
  ServerException([String message = 'Server error. Please try again later.']) 
      : super(message, statusCode: 500);
}

/// Timeout exception
class TimeoutException extends ApiException {
  TimeoutException([String message = 'Request timed out']) 
      : super(message, statusCode: 408);
}

/// Rate limit exception (429)
class RateLimitException extends ApiException {
  final Duration? retryAfter;
  
  RateLimitException([String message = 'Too many requests', this.retryAfter]) 
      : super(message, statusCode: 429);
}
