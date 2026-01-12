import 'package:dio/dio.dart';
import 'package:logger/logger.dart';

import 'api_client.dart';

/// Auth interceptor to add token to requests
class AuthInterceptor extends Interceptor {
  final OkadaApiClient _client;
  
  AuthInterceptor(this._client);
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _client.accessToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // Token expired or invalid - clear and let app handle re-auth
      _client.clearAccessToken();
    }
    handler.next(err);
  }
}

/// Logging interceptor for debugging
class LoggingInterceptor extends Interceptor {
  final Logger _logger;
  
  LoggingInterceptor(this._logger);
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    _logger.d('→ ${options.method} ${options.uri}');
    if (options.data != null) {
      _logger.d('Request Data: ${options.data}');
    }
    handler.next(options);
  }
  
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    _logger.d('← ${response.statusCode} ${response.requestOptions.uri}');
    handler.next(response);
  }
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    _logger.e('✗ ${err.response?.statusCode} ${err.requestOptions.uri}');
    _logger.e('Error: ${err.message}');
    handler.next(err);
  }
}

/// Retry interceptor for failed requests
class RetryInterceptor extends Interceptor {
  final Dio _dio;
  final int maxRetries;
  final Duration retryDelay;
  
  RetryInterceptor(
    this._dio, {
    this.maxRetries = 3,
    this.retryDelay = const Duration(seconds: 1),
  });
  
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final retryCount = err.requestOptions.extra['retryCount'] ?? 0;
    
    // Only retry on network errors or 5xx server errors
    final shouldRetry = _shouldRetry(err) && retryCount < maxRetries;
    
    if (shouldRetry) {
      await Future.delayed(retryDelay * (retryCount + 1));
      
      final options = err.requestOptions;
      options.extra['retryCount'] = retryCount + 1;
      
      try {
        final response = await _dio.fetch(options);
        handler.resolve(response);
        return;
      } catch (e) {
        // Continue to error handler
      }
    }
    
    handler.next(err);
  }
  
  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
           err.type == DioExceptionType.sendTimeout ||
           err.type == DioExceptionType.receiveTimeout ||
           err.type == DioExceptionType.connectionError ||
           (err.response?.statusCode ?? 0) >= 500;
  }
}

/// Connectivity interceptor to check network before requests
class ConnectivityInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Note: In production, inject connectivity service
    handler.next(options);
  }
}
