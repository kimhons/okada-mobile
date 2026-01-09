import 'package:dio/dio.dart';
import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';
import 'package:dio_cache_interceptor_hive_store/dio_cache_interceptor_hive_store.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../errors/exceptions.dart';
import 'network_info.dart';

class DioClient {
  late final Dio _dio;
  late final CacheOptions _cacheOptions;
  final NetworkInfo _networkInfo;
  String? _authToken;
  String? _refreshToken;

  DioClient(this._networkInfo) {
    _initializeDio();
    _initializeCache();
  }

  Dio get dio => _dio;

  void _initializeDio() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: Duration(milliseconds: AppConstants.connectionTimeout),
      receiveTimeout: Duration(milliseconds: AppConstants.receiveTimeout),
      sendTimeout: Duration(milliseconds: AppConstants.sendTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(_createLogInterceptor());
    _dio.interceptors.add(_createAuthInterceptor());
    _dio.interceptors.add(_createNetworkInterceptor());
    _dio.interceptors.add(_createErrorInterceptor());
  }

  void _initializeCache() {
    _cacheOptions = CacheOptions(
      store: HiveCacheStore(null),
      policy: CachePolicy.request,
      hitCacheOnErrorExcept: [401, 403],
      maxStale: AppConstants.cacheMaxStale,
      priority: CachePriority.normal,
      cipher: null,
      keyBuilder: CacheOptions.defaultCacheKeyBuilder,
      allowPostMethod: false,
    );

    _dio.interceptors.add(DioCacheInterceptor(options: _cacheOptions));
  }

  LogInterceptor _createLogInterceptor() {
    return LogInterceptor(
      requestBody: true,
      responseBody: true,
      requestHeader: true,
      responseHeader: false,
      error: true,
      logPrint: (object) {
        // Only log in debug mode
        // ignore: avoid_print
        print(object);
      },
    );
  }

  InterceptorsWrapper _createAuthInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token if available
        if (_authToken != null) {
          options.headers['Authorization'] = 'Bearer $_authToken';
        }

        // Add device info
        options.headers['X-Device-Type'] = 'mobile';
        options.headers['X-Platform'] = 'flutter';

        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired, try to refresh
          if (_refreshToken != null) {
            try {
              await _refreshAuthToken();
              // Retry the original request
              final options = error.requestOptions;
              options.headers['Authorization'] = 'Bearer $_authToken';
              final response = await _dio.fetch(options);
              handler.resolve(response);
              return;
            } catch (e) {
              // Refresh failed, clear tokens and let the error through
              await _clearTokens();
            }
          }
        }
        handler.next(error);
      },
    );
  }

  InterceptorsWrapper _createNetworkInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Check network connectivity
        if (!await _networkInfo.isConnected) {
          // If offline, try to serve from cache
          options.extra[DioCacheInterceptor.requestPolicyKey] = CachePolicy.cacheFirst;
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.receiveTimeout ||
            error.type == DioExceptionType.sendTimeout) {
          // Network timeout, try cache
          final options = error.requestOptions;
          options.extra[DioCacheInterceptor.requestPolicyKey] = CachePolicy.cacheOnly;
          try {
            final response = await _dio.fetch(options);
            handler.resolve(response);
            return;
          } catch (e) {
            // Cache miss, return original error
          }
        }
        handler.next(error);
      },
    );
  }

  InterceptorsWrapper _createErrorInterceptor() {
    return InterceptorsWrapper(
      onError: (error, handler) {
        final exception = _handleDioError(error);
        handler.reject(DioException(
          requestOptions: error.requestOptions,
          error: exception,
        ));
      },
    );
  }

  AppException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const TimeoutException(
          'Connection timeout. Please try again.',
          code: 'TIMEOUT',
        );

      case DioExceptionType.badResponse:
        return _handleHttpError(error.response!);

      case DioExceptionType.cancel:
        return const NetworkException(
          'Request was cancelled.',
          code: 'CANCELLED',
        );

      case DioExceptionType.connectionError:
        return const NetworkException(
          'No internet connection. Please check your network.',
          code: 'NO_CONNECTION',
        );

      case DioExceptionType.unknown:
      default:
        return NetworkException(
          error.message ?? 'An unexpected error occurred.',
          code: 'UNKNOWN',
          details: error.error,
        );
    }
  }

  AppException _handleHttpError(Response response) {
    final statusCode = response.statusCode ?? 0;
    final data = response.data;
    String message = 'An error occurred';
    String? code;

    if (data is Map<String, dynamic>) {
      message = data['message'] ?? data['error'] ?? message;
      code = data['code']?.toString();
    }

    switch (statusCode) {
      case 400:
        return BadRequestException(message, code: code, details: data);
      case 401:
        return UnauthorizedException(message, code: code, details: data);
      case 403:
        return ForbiddenException(message, code: code, details: data);
      case 404:
        return NotFoundException(message, code: code, details: data);
      case 409:
        return ConflictException(message, code: code, details: data);
      case 422:
        return ValidationException(
          message,
          code: code,
          details: data,
          fieldErrors: _extractFieldErrors(data),
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return ServerException(message, code: code, details: data);
      default:
        return ServerException(
          'Server error (${statusCode}): $message',
          code: code,
          details: data,
        );
    }
  }

  Map<String, List<String>>? _extractFieldErrors(dynamic data) {
    if (data is Map<String, dynamic> && data.containsKey('errors')) {
      final errors = data['errors'];
      if (errors is Map<String, dynamic>) {
        final fieldErrors = <String, List<String>>{};
        errors.forEach((key, value) {
          if (value is List) {
            fieldErrors[key] = value.map((e) => e.toString()).toList();
          } else {
            fieldErrors[key] = [value.toString()];
          }
        });
        return fieldErrors;
      }
    }
    return null;
  }

  Future<void> _refreshAuthToken() async {
    if (_refreshToken == null) {
      throw const UnauthorizedException('No refresh token available');
    }

    try {
      final response = await _dio.post(
        ApiEndpoints.refreshToken,
        data: {'refreshToken': _refreshToken},
        options: Options(
          extra: {DioCacheInterceptor.requestPolicyKey: CachePolicy.noCache},
        ),
      );

      final data = response.data as Map<String, dynamic>;
      _authToken = data['accessToken'];
      _refreshToken = data['refreshToken'];

      // Save tokens
      await _saveTokens(_authToken!, _refreshToken!);
    } catch (e) {
      await _clearTokens();
      rethrow;
    }
  }

  Future<void> setAuthTokens(String accessToken, String refreshToken) async {
    _authToken = accessToken;
    _refreshToken = refreshToken;
    await _saveTokens(accessToken, refreshToken);
  }

  Future<void> _saveTokens(String accessToken, String refreshToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userTokenKey, accessToken);
    await prefs.setString(AppConstants.refreshTokenKey, refreshToken);
  }

  Future<void> _clearTokens() async {
    _authToken = null;
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.userTokenKey);
    await prefs.remove(AppConstants.refreshTokenKey);
  }

  Future<void> clearAuth() async {
    await _clearTokens();
  }

  Future<void> loadTokens() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString(AppConstants.userTokenKey);
    _refreshToken = prefs.getString(AppConstants.refreshTokenKey);
  }

  // Generic GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    bool useCache = true,
  }) async {
    try {
      final requestOptions = options ?? Options();
      if (useCache) {
        requestOptions.extra?[DioCacheInterceptor.requestPolicyKey] = CachePolicy.request;
      } else {
        requestOptions.extra?[DioCacheInterceptor.requestPolicyKey] = CachePolicy.noCache;
      }

      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: requestOptions,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error as AppException;
      }
      throw _handleDioError(e);
    }
  }

  // Generic POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final requestOptions = options ?? Options();
      requestOptions.extra?[DioCacheInterceptor.requestPolicyKey] = CachePolicy.noCache;

      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: requestOptions,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error as AppException;
      }
      throw _handleDioError(e);
    }
  }

  // Generic PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final requestOptions = options ?? Options();
      requestOptions.extra?[DioCacheInterceptor.requestPolicyKey] = CachePolicy.noCache;

      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: requestOptions,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error as AppException;
      }
      throw _handleDioError(e);
    }
  }

  // Generic DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final requestOptions = options ?? Options();
      requestOptions.extra?[DioCacheInterceptor.requestPolicyKey] = CachePolicy.noCache;

      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: requestOptions,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error as AppException;
      }
      throw _handleDioError(e);
    }
  }

  // File upload
  Future<Response<T>> upload<T>(
    String path,
    FormData formData, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final requestOptions = options ?? Options();
      requestOptions.extra?[DioCacheInterceptor.requestPolicyKey] = CachePolicy.noCache;

      return await _dio.post<T>(
        path,
        data: formData,
        queryParameters: queryParameters,
        options: requestOptions,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error as AppException;
      }
      throw _handleDioError(e);
    }
  }

  // Clear cache
  Future<void> clearCache() async {
    await _cacheOptions.store?.clean();
  }

  // Get cache size
  Future<int> getCacheSize() async {
    return await _cacheOptions.store?.size ?? 0;
  }

  void dispose() {
    _dio.close();
  }
}