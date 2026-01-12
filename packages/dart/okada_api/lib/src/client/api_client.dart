import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';

import 'api_interceptors.dart';
import '../exceptions/api_exceptions.dart';

/// Main API client for Okada Platform
class OkadaApiClient {
  static OkadaApiClient? _instance;
  late final Dio _dio;
  late final FlutterSecureStorage _secureStorage;
  late final Logger _logger;
  
  String? _baseUrl;
  String? _accessToken;
  
  OkadaApiClient._internal() {
    _secureStorage = const FlutterSecureStorage();
    _logger = Logger(
      printer: PrettyPrinter(
        methodCount: 0,
        errorMethodCount: 5,
        lineLength: 50,
        colors: true,
        printEmojis: true,
        printTime: true,
      ),
    );
  }
  
  /// Get singleton instance
  static OkadaApiClient get instance {
    _instance ??= OkadaApiClient._internal();
    return _instance!;
  }
  
  /// Initialize the API client with base URL
  Future<void> initialize({
    required String baseUrl,
    Duration connectTimeout = const Duration(seconds: 30),
    Duration receiveTimeout = const Duration(seconds: 30),
  }) async {
    _baseUrl = baseUrl;
    
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: connectTimeout,
      receiveTimeout: receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // Add interceptors
    _dio.interceptors.addAll([
      AuthInterceptor(this),
      LoggingInterceptor(_logger),
      RetryInterceptor(_dio),
    ]);
    
    // Load stored token
    _accessToken = await _secureStorage.read(key: 'access_token');
  }
  
  /// Get current base URL
  String? get baseUrl => _baseUrl;
  
  /// Get current access token
  String? get accessToken => _accessToken;
  
  /// Set access token
  Future<void> setAccessToken(String token) async {
    _accessToken = token;
    await _secureStorage.write(key: 'access_token', value: token);
  }
  
  /// Clear access token (logout)
  Future<void> clearAccessToken() async {
    _accessToken = null;
    await _secureStorage.delete(key: 'access_token');
  }
  
  /// Check if user is authenticated
  bool get isAuthenticated => _accessToken != null && _accessToken!.isNotEmpty;
  
  /// GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  /// POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  /// PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  /// PATCH request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  /// DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  /// Upload file
  Future<Response<T>> uploadFile<T>(
    String path, {
    required String filePath,
    required String fieldName,
    Map<String, dynamic>? additionalData,
    void Function(int, int)? onSendProgress,
    CancelToken? cancelToken,
  }) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        ...?additionalData,
      });
      
      return await _dio.post<T>(
        path,
        data: formData,
        onSendProgress: onSendProgress,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  /// Handle Dio errors
  ApiException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException('Connection timeout. Please try again.');
      
      case DioExceptionType.connectionError:
        return NetworkException('No internet connection. Please check your network.');
      
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode ?? 0;
        final message = _extractErrorMessage(error.response);
        
        if (statusCode == 401) {
          return UnauthorizedException(message);
        } else if (statusCode == 403) {
          return ForbiddenException(message);
        } else if (statusCode == 404) {
          return NotFoundException(message);
        } else if (statusCode == 422) {
          return ValidationException(message, _extractValidationErrors(error.response));
        } else if (statusCode >= 500) {
          return ServerException(message);
        }
        return ApiException(message, statusCode: statusCode);
      
      case DioExceptionType.cancel:
        return ApiException('Request cancelled');
      
      default:
        return ApiException('An unexpected error occurred');
    }
  }
  
  String _extractErrorMessage(Response? response) {
    if (response?.data is Map) {
      return response?.data['message'] ?? 
             response?.data['error'] ?? 
             'An error occurred';
    }
    return 'An error occurred';
  }
  
  Map<String, List<String>>? _extractValidationErrors(Response? response) {
    if (response?.data is Map && response?.data['errors'] is Map) {
      final errors = response?.data['errors'] as Map;
      return errors.map((key, value) => MapEntry(
        key.toString(),
        (value is List) ? value.map((e) => e.toString()).toList() : [value.toString()],
      ));
    }
    return null;
  }
}
