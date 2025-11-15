/// Okada API Client
/// 
/// Wrapper around the generated API client with:
/// - Authentication handling
/// - Error handling
/// - Request/response interceptors
/// - Cameroon-specific formatting (FCFA, +237)

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class OkadaApiClient {
  late final Dio _dio;
  String? _accessToken;
  
  static const String prodBaseUrl = 'https://api.okada.cm/v1';
  static const String stagingBaseUrl = 'https://staging-api.okada.cm/v1';
  static const String devBaseUrl = 'http://localhost:8000/api/v1';
  
  OkadaApiClient({
    String? baseUrl,
    String? accessToken,
  }) {
    _accessToken = accessToken;
    
    // Determine base URL based on environment
    final String apiBaseUrl = baseUrl ?? _getBaseUrl();
    
    _dio = Dio(BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'fr', // Default to French for Cameroon
      },
    ));
    
    _setupInterceptors();
  }
  
  /// Get base URL based on build mode
  String _getBaseUrl() {
    if (kReleaseMode) {
      return prodBaseUrl;
    } else if (kProfileMode) {
      return stagingBaseUrl;
    } else {
      return devBaseUrl;
    }
  }
  
  /// Set up request/response interceptors
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add authentication token
          if (_accessToken != null) {
            options.headers['Authorization'] = 'Bearer $_accessToken';
          }
          
          // Log request in debug mode
          if (kDebugMode) {
            print('🌐 ${options.method} ${options.uri}');
            if (options.data != null) {
              print('📤 Request: ${options.data}');
            }
          }
          
          return handler.next(options);
        },
        onResponse: (response, handler) {
          // Log response in debug mode
          if (kDebugMode) {
            print('✅ ${response.statusCode} ${response.requestOptions.uri}');
            print('📥 Response: ${response.data}');
          }
          
          return handler.next(response);
        },
        onError: (error, handler) {
          // Log error in debug mode
          if (kDebugMode) {
            print('❌ ${error.response?.statusCode} ${error.requestOptions.uri}');
            print('⚠️ Error: ${error.message}');
            if (error.response?.data != null) {
              print('📥 Error Response: ${error.response?.data}');
            }
          }
          
          // Handle specific error cases
          if (error.response?.statusCode == 401) {
            // Token expired or invalid
            _handleUnauthorized();
          }
          
          return handler.next(error);
        },
      ),
    );
  }
  
  /// Handle unauthorized error (token expired)
  void _handleUnauthorized() {
    // Clear token
    _accessToken = null;
    
    // TODO: Navigate to login screen or refresh token
    if (kDebugMode) {
      print('🔒 Unauthorized - Token expired or invalid');
    }
  }
  
  /// Set access token
  void setAccessToken(String token) {
    _accessToken = token;
  }
  
  /// Clear access token (logout)
  void clearAccessToken() {
    _accessToken = null;
  }
  
  /// Get Dio instance for custom requests
  Dio get dio => _dio;
  
  // ============================================
  // AUTHENTICATION
  // ============================================
  
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String role,
    String language = 'fr',
  }) async {
    final response = await _dio.post('/auth/register', data: {
      'name': name,
      'email': email,
      'password': password,
      'phone': phone,
      'role': role,
      'language': language,
    });
    
    // Save access token
    if (response.data['access_token'] != null) {
      setAccessToken(response.data['access_token']);
    }
    
    return response.data;
  }
  
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    
    // Save access token
    if (response.data['access_token'] != null) {
      setAccessToken(response.data['access_token']);
    }
    
    return response.data;
  }
  
  Future<void> logout() async {
    await _dio.post('/auth/logout');
    clearAccessToken();
  }
  
  Future<Map<String, dynamic>> refreshToken() async {
    final response = await _dio.post('/auth/refresh');
    
    // Update access token
    if (response.data['access_token'] != null) {
      setAccessToken(response.data['access_token']);
    }
    
    return response.data;
  }
  
  // ============================================
  // USER
  // ============================================
  
  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await _dio.get('/users/me');
    return response.data;
  }
  
  Future<Map<String, dynamic>> updateCurrentUser({
    String? name,
    String? phone,
    String? language,
  }) async {
    final response = await _dio.put('/users/me', data: {
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (language != null) 'language': language,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> uploadAvatar(String filePath) async {
    final formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(filePath),
    });
    
    final response = await _dio.post('/users/me/avatar', data: formData);
    return response.data;
  }
  
  // ============================================
  // PRODUCTS
  // ============================================
  
  Future<Map<String, dynamic>> listProducts({
    int page = 1,
    int perPage = 20,
    int? categoryId,
    int? sellerId,
    String? search,
    double? minPrice,
    double? maxPrice,
    String? sort,
  }) async {
    final response = await _dio.get('/products', queryParameters: {
      'page': page,
      'per_page': perPage,
      if (categoryId != null) 'category_id': categoryId,
      if (sellerId != null) 'seller_id': sellerId,
      if (search != null) 'search': search,
      if (minPrice != null) 'min_price': minPrice,
      if (maxPrice != null) 'max_price': maxPrice,
      if (sort != null) 'sort': sort,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> getProduct(int id) async {
    final response = await _dio.get('/products/$id');
    return response.data;
  }
  
  Future<Map<String, dynamic>> createProduct({
    required String name,
    required String description,
    required double price,
    required int stock,
    required List<int> categoryIds,
  }) async {
    final response = await _dio.post('/products', data: {
      'name': name,
      'description': description,
      'price': price,
      'stock': stock,
      'category_ids': categoryIds,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> updateProduct(
    int id, {
    String? name,
    String? description,
    double? price,
    int? stock,
    List<int>? categoryIds,
  }) async {
    final response = await _dio.put('/products/$id', data: {
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (price != null) 'price': price,
      if (stock != null) 'stock': stock,
      if (categoryIds != null) 'category_ids': categoryIds,
    });
    return response.data;
  }
  
  Future<void> deleteProduct(int id) async {
    await _dio.delete('/products/$id');
  }
  
  Future<List<dynamic>> uploadProductImages(
    int productId,
    List<String> imagePaths,
  ) async {
    final formData = FormData.fromMap({
      'images': [
        for (var path in imagePaths)
          await MultipartFile.fromFile(path),
      ],
    });
    
    final response = await _dio.post(
      '/products/$productId/images',
      data: formData,
    );
    return response.data['data'];
  }
  
  // ============================================
  // CATEGORIES
  // ============================================
  
  Future<List<dynamic>> listCategories() async {
    final response = await _dio.get('/categories');
    return response.data['data'];
  }
  
  // ============================================
  // CART
  // ============================================
  
  Future<Map<String, dynamic>> getCart() async {
    final response = await _dio.get('/cart');
    return response.data;
  }
  
  Future<Map<String, dynamic>> addCartItem({
    required int productId,
    required int quantity,
  }) async {
    final response = await _dio.post('/cart/items', data: {
      'product_id': productId,
      'quantity': quantity,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> updateCartItem(
    int itemId, {
    required int quantity,
  }) async {
    final response = await _dio.put('/cart/items/$itemId', data: {
      'quantity': quantity,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> removeCartItem(int itemId) async {
    final response = await _dio.delete('/cart/items/$itemId');
    return response.data;
  }
  
  Future<void> clearCart() async {
    await _dio.delete('/cart/clear');
  }
  
  // ============================================
  // ORDERS
  // ============================================
  
  Future<Map<String, dynamic>> listOrders({
    int page = 1,
    int perPage = 20,
    String? status,
  }) async {
    final response = await _dio.get('/orders', queryParameters: {
      'page': page,
      'per_page': perPage,
      if (status != null) 'status': status,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> getOrder(int id) async {
    final response = await _dio.get('/orders/$id');
    return response.data;
  }
  
  Future<Map<String, dynamic>> createOrder({
    required Map<String, dynamic> deliveryAddress,
    required String paymentMethod,
    String? phoneNumber,
    String? notes,
  }) async {
    final response = await _dio.post('/orders', data: {
      'delivery_address': deliveryAddress,
      'payment_method': paymentMethod,
      if (phoneNumber != null) 'phone_number': phoneNumber,
      if (notes != null) 'notes': notes,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> cancelOrder(int id) async {
    final response = await _dio.post('/orders/$id/cancel');
    return response.data;
  }
  
  // ============================================
  // QUALITY VERIFICATION (KEY DIFFERENTIATOR!)
  // ============================================
  
  Future<Map<String, dynamic>> submitQualityVerification({
    required int orderId,
    required List<String> photoPaths,
    String? notes,
  }) async {
    final formData = FormData.fromMap({
      'order_id': orderId,
      'photos': [
        for (var path in photoPaths)
          await MultipartFile.fromFile(path),
      ],
      if (notes != null) 'notes': notes,
    });
    
    final response = await _dio.post(
      '/quality-verifications',
      data: formData,
    );
    return response.data;
  }
  
  Future<Map<String, dynamic>> getQualityVerification(int id) async {
    final response = await _dio.get('/quality-verifications/$id');
    return response.data;
  }
  
  Future<Map<String, dynamic>> approveQualityVerification(int id) async {
    final response = await _dio.post('/quality-verifications/$id/approve');
    return response.data;
  }
  
  Future<Map<String, dynamic>> rejectQualityVerification(
    int id, {
    required String reason,
  }) async {
    final response = await _dio.post(
      '/quality-verifications/$id/reject',
      data: {'reason': reason},
    );
    return response.data;
  }
  
  // ============================================
  // PAYMENTS
  // ============================================
  
  Future<Map<String, dynamic>> initiatePayment({
    required int orderId,
    required String paymentMethod,
    required String phoneNumber,
  }) async {
    final response = await _dio.post('/payments/initiate', data: {
      'order_id': orderId,
      'payment_method': paymentMethod,
      'phone_number': phoneNumber,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> getPaymentStatus(int id) async {
    final response = await _dio.get('/payments/$id/status');
    return response.data;
  }
  
  // ============================================
  // DELIVERIES (RIDER)
  // ============================================
  
  Future<List<dynamic>> getAvailableDeliveries({
    required double latitude,
    required double longitude,
    double radius = 5.0,
  }) async {
    final response = await _dio.get('/deliveries/available', queryParameters: {
      'latitude': latitude,
      'longitude': longitude,
      'radius': radius,
    });
    return response.data['data'];
  }
  
  Future<Map<String, dynamic>> acceptDelivery(int id) async {
    final response = await _dio.post('/deliveries/$id/accept');
    return response.data;
  }
  
  Future<Map<String, dynamic>> confirmPickup(int id) async {
    final response = await _dio.post('/deliveries/$id/pickup');
    return response.data;
  }
  
  Future<Map<String, dynamic>> completeDelivery(
    int id, {
    String? signature,
    String? notes,
  }) async {
    final response = await _dio.post('/deliveries/$id/complete', data: {
      if (signature != null) 'signature': signature,
      if (notes != null) 'notes': notes,
    });
    return response.data;
  }
  
  Future<void> updateDeliveryLocation(
    int id, {
    required double latitude,
    required double longitude,
  }) async {
    await _dio.post('/deliveries/$id/location', data: {
      'latitude': latitude,
      'longitude': longitude,
    });
  }
  
  // ============================================
  // REVIEWS
  // ============================================
  
  Future<Map<String, dynamic>> createReview({
    int? productId,
    int? orderId,
    required int rating,
    String? comment,
  }) async {
    final response = await _dio.post('/reviews', data: {
      if (productId != null) 'product_id': productId,
      if (orderId != null) 'order_id': orderId,
      'rating': rating,
      if (comment != null) 'comment': comment,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> getProductReviews(
    int productId, {
    int page = 1,
    int perPage = 20,
  }) async {
    final response = await _dio.get(
      '/products/$productId/reviews',
      queryParameters: {
        'page': page,
        'per_page': perPage,
      },
    );
    return response.data;
  }
  
  // ============================================
  // SELLER
  // ============================================
  
  Future<Map<String, dynamic>> getSellerDashboard() async {
    final response = await _dio.get('/sellers/me/dashboard');
    return response.data;
  }
  
  Future<Map<String, dynamic>> getSellerEarnings({
    String? startDate,
    String? endDate,
  }) async {
    final response = await _dio.get('/sellers/me/earnings', queryParameters: {
      if (startDate != null) 'start_date': startDate,
      if (endDate != null) 'end_date': endDate,
    });
    return response.data;
  }
  
  // ============================================
  // RIDER
  // ============================================
  
  Future<Map<String, dynamic>> getRiderDashboard() async {
    final response = await _dio.get('/riders/me/dashboard');
    return response.data;
  }
  
  Future<Map<String, dynamic>> getRiderEarnings({
    String? startDate,
    String? endDate,
  }) async {
    final response = await _dio.get('/riders/me/earnings', queryParameters: {
      if (startDate != null) 'start_date': startDate,
      if (endDate != null) 'end_date': endDate,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> updateRiderStatus({
    required String status,
  }) async {
    final response = await _dio.put('/riders/me/status', data: {
      'status': status,
    });
    return response.data;
  }
  
  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  Future<Map<String, dynamic>> getNotifications({
    int page = 1,
    int perPage = 20,
    bool? read,
  }) async {
    final response = await _dio.get('/notifications', queryParameters: {
      'page': page,
      'per_page': perPage,
      if (read != null) 'read': read,
    });
    return response.data;
  }
  
  Future<void> markNotificationRead(int id) async {
    await _dio.post('/notifications/$id/read');
  }
  
  Future<void> markAllNotificationsRead() async {
    await _dio.post('/notifications/read-all');
  }
  
  Future<void> registerDeviceToken({
    required String token,
    required String platform,
  }) async {
    await _dio.post('/notifications/device-token', data: {
      'token': token,
      'platform': platform,
    });
  }
}

