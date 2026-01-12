import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Offline storage service using Hive for local data persistence
/// Enables the app to work in areas with poor connectivity
class OfflineStorageService {
  static final OfflineStorageService _instance = OfflineStorageService._internal();
  factory OfflineStorageService() => _instance;
  OfflineStorageService._internal();

  // Hive boxes
  late Box<String> _userBox;
  late Box<String> _ordersBox;
  late Box<String> _productsBox;
  late Box<String> _categoriesBox;
  late Box<String> _cartBox;
  late Box<String> _pendingActionsBox;
  late Box<String> _cacheMetadataBox;

  // Connectivity
  final Connectivity _connectivity = Connectivity();
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  
  bool _isOnline = true;
  bool get isOnline => _isOnline;

  // Sync callbacks
  Function()? onConnectivityChanged;
  Function(List<PendingAction>)? onPendingActionsSync;

  bool _initialized = false;

  /// Initialize offline storage
  Future<void> initialize() async {
    if (_initialized) return;

    // Initialize Hive
    await Hive.initFlutter();

    // Open boxes
    _userBox = await Hive.openBox<String>('user_data');
    _ordersBox = await Hive.openBox<String>('orders_cache');
    _productsBox = await Hive.openBox<String>('products_cache');
    _categoriesBox = await Hive.openBox<String>('categories_cache');
    _cartBox = await Hive.openBox<String>('cart_data');
    _pendingActionsBox = await Hive.openBox<String>('pending_actions');
    _cacheMetadataBox = await Hive.openBox<String>('cache_metadata');

    // Check initial connectivity
    final result = await _connectivity.checkConnectivity();
    _isOnline = result != ConnectivityResult.none;

    // Listen for connectivity changes
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      _handleConnectivityChange,
    );

    _initialized = true;
    debugPrint('[OfflineStorage] Initialized, online: $_isOnline');
  }

  /// Handle connectivity changes
  void _handleConnectivityChange(ConnectivityResult result) {
    final wasOnline = _isOnline;
    _isOnline = result != ConnectivityResult.none;

    debugPrint('[OfflineStorage] Connectivity changed: $result, online: $_isOnline');

    if (!wasOnline && _isOnline) {
      // Just came online - trigger sync
      _syncPendingActions();
    }

    onConnectivityChanged?.call();
  }

  // ============================================================================
  // User Data
  // ============================================================================

  /// Save user profile
  Future<void> saveUserProfile(Map<String, dynamic> profile) async {
    await _userBox.put('profile', jsonEncode(profile));
    await _updateCacheMetadata('user_profile');
  }

  /// Get cached user profile
  Map<String, dynamic>? getUserProfile() {
    final json = _userBox.get('profile');
    if (json == null) return null;
    return jsonDecode(json) as Map<String, dynamic>;
  }

  /// Save auth token
  Future<void> saveAuthToken(String token) async {
    await _userBox.put('auth_token', token);
  }

  /// Get auth token
  String? getAuthToken() {
    return _userBox.get('auth_token');
  }

  /// Clear user data (logout)
  Future<void> clearUserData() async {
    await _userBox.clear();
  }

  // ============================================================================
  // Orders Cache
  // ============================================================================

  /// Save orders list
  Future<void> saveOrders(List<Map<String, dynamic>> orders) async {
    await _ordersBox.put('orders_list', jsonEncode(orders));
    await _updateCacheMetadata('orders');
  }

  /// Get cached orders
  List<Map<String, dynamic>> getOrders() {
    final json = _ordersBox.get('orders_list');
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.cast<Map<String, dynamic>>();
  }

  /// Save single order
  Future<void> saveOrder(String orderId, Map<String, dynamic> order) async {
    await _ordersBox.put('order_$orderId', jsonEncode(order));
  }

  /// Get single order
  Map<String, dynamic>? getOrder(String orderId) {
    final json = _ordersBox.get('order_$orderId');
    if (json == null) return null;
    return jsonDecode(json) as Map<String, dynamic>;
  }

  /// Save active order (for riders)
  Future<void> saveActiveOrder(Map<String, dynamic>? order) async {
    if (order == null) {
      await _ordersBox.delete('active_order');
    } else {
      await _ordersBox.put('active_order', jsonEncode(order));
    }
  }

  /// Get active order
  Map<String, dynamic>? getActiveOrder() {
    final json = _ordersBox.get('active_order');
    if (json == null) return null;
    return jsonDecode(json) as Map<String, dynamic>;
  }

  // ============================================================================
  // Products Cache
  // ============================================================================

  /// Save products by category
  Future<void> saveProductsByCategory(
    String categoryId,
    List<Map<String, dynamic>> products,
  ) async {
    await _productsBox.put('category_$categoryId', jsonEncode(products));
    await _updateCacheMetadata('products_$categoryId');
  }

  /// Get products by category
  List<Map<String, dynamic>> getProductsByCategory(String categoryId) {
    final json = _productsBox.get('category_$categoryId');
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.cast<Map<String, dynamic>>();
  }

  /// Save single product
  Future<void> saveProduct(String productId, Map<String, dynamic> product) async {
    await _productsBox.put('product_$productId', jsonEncode(product));
  }

  /// Get single product
  Map<String, dynamic>? getProduct(String productId) {
    final json = _productsBox.get('product_$productId');
    if (json == null) return null;
    return jsonDecode(json) as Map<String, dynamic>;
  }

  /// Save featured products
  Future<void> saveFeaturedProducts(List<Map<String, dynamic>> products) async {
    await _productsBox.put('featured', jsonEncode(products));
    await _updateCacheMetadata('featured_products');
  }

  /// Get featured products
  List<Map<String, dynamic>> getFeaturedProducts() {
    final json = _productsBox.get('featured');
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.cast<Map<String, dynamic>>();
  }

  // ============================================================================
  // Categories Cache
  // ============================================================================

  /// Save categories
  Future<void> saveCategories(List<Map<String, dynamic>> categories) async {
    await _categoriesBox.put('all', jsonEncode(categories));
    await _updateCacheMetadata('categories');
  }

  /// Get categories
  List<Map<String, dynamic>> getCategories() {
    final json = _categoriesBox.get('all');
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.cast<Map<String, dynamic>>();
  }

  // ============================================================================
  // Cart Data
  // ============================================================================

  /// Save cart items
  Future<void> saveCart(List<Map<String, dynamic>> items) async {
    await _cartBox.put('items', jsonEncode(items));
  }

  /// Get cart items
  List<Map<String, dynamic>> getCart() {
    final json = _cartBox.get('items');
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.cast<Map<String, dynamic>>();
  }

  /// Add item to cart
  Future<void> addToCart(Map<String, dynamic> item) async {
    final items = getCart();
    final existingIndex = items.indexWhere(
      (i) => i['productId'] == item['productId'],
    );
    
    if (existingIndex >= 0) {
      items[existingIndex]['quantity'] = 
          (items[existingIndex]['quantity'] as int) + (item['quantity'] as int);
    } else {
      items.add(item);
    }
    
    await saveCart(items);
  }

  /// Remove item from cart
  Future<void> removeFromCart(String productId) async {
    final items = getCart();
    items.removeWhere((i) => i['productId'] == productId);
    await saveCart(items);
  }

  /// Update cart item quantity
  Future<void> updateCartQuantity(String productId, int quantity) async {
    final items = getCart();
    final index = items.indexWhere((i) => i['productId'] == productId);
    if (index >= 0) {
      if (quantity <= 0) {
        items.removeAt(index);
      } else {
        items[index]['quantity'] = quantity;
      }
      await saveCart(items);
    }
  }

  /// Clear cart
  Future<void> clearCart() async {
    await _cartBox.delete('items');
  }

  // ============================================================================
  // Pending Actions Queue
  // ============================================================================

  /// Add pending action
  Future<void> addPendingAction(PendingAction action) async {
    final actions = getPendingActions();
    actions.add(action);
    await _savePendingActions(actions);
    debugPrint('[OfflineStorage] Added pending action: ${action.type}');
  }

  /// Get all pending actions
  List<PendingAction> getPendingActions() {
    final json = _pendingActionsBox.get('queue');
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.map((e) => PendingAction.fromJson(e)).toList();
  }

  /// Save pending actions
  Future<void> _savePendingActions(List<PendingAction> actions) async {
    await _pendingActionsBox.put(
      'queue',
      jsonEncode(actions.map((a) => a.toJson()).toList()),
    );
  }

  /// Remove pending action
  Future<void> removePendingAction(String actionId) async {
    final actions = getPendingActions();
    actions.removeWhere((a) => a.id == actionId);
    await _savePendingActions(actions);
  }

  /// Clear all pending actions
  Future<void> clearPendingActions() async {
    await _pendingActionsBox.delete('queue');
  }

  /// Sync pending actions when online
  Future<void> _syncPendingActions() async {
    final actions = getPendingActions();
    if (actions.isEmpty) return;

    debugPrint('[OfflineStorage] Syncing ${actions.length} pending actions');
    onPendingActionsSync?.call(actions);
  }

  /// Get pending actions count
  int get pendingActionsCount => getPendingActions().length;

  // ============================================================================
  // Cache Metadata
  // ============================================================================

  /// Update cache metadata
  Future<void> _updateCacheMetadata(String key) async {
    await _cacheMetadataBox.put(
      key,
      jsonEncode({
        'updatedAt': DateTime.now().toIso8601String(),
      }),
    );
  }

  /// Check if cache is stale
  bool isCacheStale(String key, Duration maxAge) {
    final json = _cacheMetadataBox.get(key);
    if (json == null) return true;

    final metadata = jsonDecode(json) as Map<String, dynamic>;
    final updatedAt = DateTime.parse(metadata['updatedAt'] as String);
    return DateTime.now().difference(updatedAt) > maxAge;
  }

  /// Get cache age
  Duration? getCacheAge(String key) {
    final json = _cacheMetadataBox.get(key);
    if (json == null) return null;

    final metadata = jsonDecode(json) as Map<String, dynamic>;
    final updatedAt = DateTime.parse(metadata['updatedAt'] as String);
    return DateTime.now().difference(updatedAt);
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /// Clear all cached data
  Future<void> clearAllCache() async {
    await _ordersBox.clear();
    await _productsBox.clear();
    await _categoriesBox.clear();
    await _cacheMetadataBox.clear();
    debugPrint('[OfflineStorage] All cache cleared');
  }

  /// Clear expired cache
  Future<void> clearExpiredCache(Duration maxAge) async {
    final keysToDelete = <String>[];

    for (final key in _cacheMetadataBox.keys) {
      if (isCacheStale(key as String, maxAge)) {
        keysToDelete.add(key);
      }
    }

    for (final key in keysToDelete) {
      await _cacheMetadataBox.delete(key);
      // Also delete from respective boxes
      await _ordersBox.delete(key);
      await _productsBox.delete(key);
      await _categoriesBox.delete(key);
    }

    debugPrint('[OfflineStorage] Cleared ${keysToDelete.length} expired cache entries');
  }

  /// Dispose resources
  void dispose() {
    _connectivitySubscription?.cancel();
  }
}

/// Pending action model for offline queue
class PendingAction {
  final String id;
  final String type;
  final Map<String, dynamic> data;
  final DateTime createdAt;
  final int retryCount;
  final int maxRetries;

  PendingAction({
    required this.id,
    required this.type,
    required this.data,
    required this.createdAt,
    this.retryCount = 0,
    this.maxRetries = 3,
  });

  factory PendingAction.fromJson(Map<String, dynamic> json) {
    return PendingAction(
      id: json['id'] as String,
      type: json['type'] as String,
      data: json['data'] as Map<String, dynamic>,
      createdAt: DateTime.parse(json['createdAt'] as String),
      retryCount: json['retryCount'] as int? ?? 0,
      maxRetries: json['maxRetries'] as int? ?? 3,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'data': data,
    'createdAt': createdAt.toIso8601String(),
    'retryCount': retryCount,
    'maxRetries': maxRetries,
  };

  PendingAction copyWith({
    String? id,
    String? type,
    Map<String, dynamic>? data,
    DateTime? createdAt,
    int? retryCount,
    int? maxRetries,
  }) {
    return PendingAction(
      id: id ?? this.id,
      type: type ?? this.type,
      data: data ?? this.data,
      createdAt: createdAt ?? this.createdAt,
      retryCount: retryCount ?? this.retryCount,
      maxRetries: maxRetries ?? this.maxRetries,
    );
  }

  bool get canRetry => retryCount < maxRetries;
}

/// Pending action types
class PendingActionTypes {
  static const String addToCart = 'add_to_cart';
  static const String removeFromCart = 'remove_from_cart';
  static const String updateCartQuantity = 'update_cart_quantity';
  static const String createOrder = 'create_order';
  static const String cancelOrder = 'cancel_order';
  static const String rateOrder = 'rate_order';
  static const String updateProfile = 'update_profile';
  static const String acceptOrder = 'accept_order';
  static const String rejectOrder = 'reject_order';
  static const String confirmPickup = 'confirm_pickup';
  static const String confirmDelivery = 'confirm_delivery';
  static const String updateLocation = 'update_location';
  static const String sendMessage = 'send_message';
}
