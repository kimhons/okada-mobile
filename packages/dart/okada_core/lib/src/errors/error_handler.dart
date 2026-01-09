import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';

import 'app_error.dart';
import 'network_error.dart';
import 'auth_error.dart';
import 'server_error.dart';
import '../utils/logger_service.dart';

/// Centralized error handler for the application
class ErrorHandler {
  final LoggerService _logger;
  
  /// Callback for handling critical errors that require user action
  void Function(AppError error)? onCriticalError;
  
  /// Callback for reporting errors to crash analytics
  Future<void> Function(AppError error, StackTrace? stackTrace)? onReportError;

  ErrorHandler({
    required LoggerService logger,
    this.onCriticalError,
    this.onReportError,
  }) : _logger = logger;

  /// Handle any exception and convert it to an AppError
  AppError handle(dynamic exception, [StackTrace? stackTrace]) {
    final error = _convertToAppError(exception, stackTrace);
    
    // Log the error
    _logError(error);
    
    // Report if needed
    if (error.shouldReport) {
      _reportError(error, stackTrace);
    }
    
    // Handle critical errors
    if (error.severity == ErrorSeverity.critical || 
        error.severity == ErrorSeverity.fatal) {
      onCriticalError?.call(error);
    }
    
    return error;
  }

  /// Convert any exception to an AppError
  AppError _convertToAppError(dynamic exception, StackTrace? stackTrace) {
    // Already an AppError
    if (exception is AppError) {
      return exception;
    }
    
    // Dio exceptions
    if (exception is DioException) {
      return _handleDioException(exception, stackTrace);
    }
    
    // Socket exceptions
    if (exception is SocketException) {
      return NetworkError.noConnection(
        technicalMessage: exception.message,
        originalException: exception,
        stackTrace: stackTrace,
      );
    }
    
    // Timeout exceptions
    if (exception is TimeoutException) {
      return NetworkError.timeout(
        technicalMessage: exception.message,
        originalException: exception,
        stackTrace: stackTrace,
      );
    }
    
    // Format exceptions
    if (exception is FormatException) {
      return NetworkError.badResponse(
        technicalMessage: exception.message,
        originalException: exception,
        stackTrace: stackTrace,
      );
    }
    
    // Generic exception
    return UnknownError(
      technicalMessage: exception.toString(),
      originalException: exception,
      stackTrace: stackTrace,
    );
  }

  /// Handle Dio-specific exceptions
  AppError _handleDioException(DioException exception, StackTrace? stackTrace) {
    switch (exception.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkError.timeout(
          technicalMessage: exception.message,
          originalException: exception,
          stackTrace: stackTrace,
        );
        
      case DioExceptionType.connectionError:
        return NetworkError.noConnection(
          technicalMessage: exception.message,
          originalException: exception,
          stackTrace: stackTrace,
        );
        
      case DioExceptionType.cancel:
        return NetworkError.cancelled(
          technicalMessage: exception.message,
          originalException: exception,
          stackTrace: stackTrace,
        );
        
      case DioExceptionType.badCertificate:
        return NetworkError.sslError(
          technicalMessage: exception.message,
          originalException: exception,
          stackTrace: stackTrace,
        );
        
      case DioExceptionType.badResponse:
        return _handleBadResponse(exception, stackTrace);
        
      case DioExceptionType.unknown:
      default:
        if (exception.error is SocketException) {
          return NetworkError.noConnection(
            technicalMessage: exception.message,
            originalException: exception,
            stackTrace: stackTrace,
          );
        }
        return UnknownError(
          technicalMessage: exception.message,
          originalException: exception,
          stackTrace: stackTrace,
        );
    }
  }

  /// Handle bad HTTP responses
  AppError _handleBadResponse(DioException exception, StackTrace? stackTrace) {
    final statusCode = exception.response?.statusCode;
    final responseData = exception.response?.data;
    
    // Extract error message from response if available
    String? serverMessage;
    if (responseData is Map<String, dynamic>) {
      serverMessage = responseData['message'] as String? ??
          responseData['error'] as String? ??
          responseData['detail'] as String?;
    }
    
    // Handle specific status codes
    switch (statusCode) {
      case 401:
        // Check if it's a token expiry
        if (serverMessage?.toLowerCase().contains('expired') == true) {
          return AuthError.sessionExpired(
            technicalMessage: serverMessage,
            originalException: exception,
            stackTrace: stackTrace,
          );
        }
        return AuthError.invalidCredentials(
          technicalMessage: serverMessage,
          originalException: exception,
          stackTrace: stackTrace,
        );
        
      case 403:
        return AuthError.unauthorized(
          technicalMessage: serverMessage,
          originalException: exception,
          stackTrace: stackTrace,
        );
        
      case 429:
        return NetworkError.rateLimited(
          technicalMessage: serverMessage,
          originalException: exception,
          stackTrace: stackTrace,
        );
        
      default:
        if (statusCode != null) {
          return ServerError.fromStatusCode(
            statusCode,
            technicalMessage: serverMessage ?? exception.message,
            originalException: exception,
            stackTrace: stackTrace,
          );
        }
        return UnknownError(
          technicalMessage: exception.message,
          originalException: exception,
          stackTrace: stackTrace,
        );
    }
  }

  /// Log the error
  void _logError(AppError error) {
    final message = '[${error.code}] ${error.userMessage}';
    
    switch (error.severity) {
      case ErrorSeverity.info:
        _logger.info(message, error.originalException, error.stackTrace);
        break;
      case ErrorSeverity.warning:
        _logger.warning(message, error.originalException, error.stackTrace);
        break;
      case ErrorSeverity.error:
        _logger.error(message, error.originalException, error.stackTrace);
        break;
      case ErrorSeverity.critical:
      case ErrorSeverity.fatal:
        _logger.fatal(message, error.originalException, error.stackTrace);
        break;
    }
  }

  /// Report error to crash analytics
  Future<void> _reportError(AppError error, StackTrace? stackTrace) async {
    if (onReportError != null) {
      await onReportError!(error, stackTrace ?? error.stackTrace);
    }
  }

  /// Get user-friendly message for display
  String getUserMessage(AppError error, String languageCode) {
    return error.getLocalizedMessage(languageCode);
  }

  /// Check if error requires user to re-authenticate
  bool requiresReauth(AppError error) {
    return error.recoveryAction == RecoveryAction.relogin;
  }

  /// Check if error is a network connectivity issue
  bool isConnectivityError(AppError error) {
    return error is NetworkError && 
           (error.code == 'E001' || error.code == 'E005');
  }

  /// Check if error is retryable
  bool isRetryable(AppError error) {
    return error.recoveryAction == RecoveryAction.retry ||
           error.recoveryAction == RecoveryAction.refresh;
  }
}
