import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../services/offline_storage_service.dart';
import '../services/sync_service.dart';

/// Base class for offline-capable repositories
/// Provides caching, offline queue, and sync functionality
abstract class OfflineRepository<T> {
  final OfflineStorageService _offlineStorage = OfflineStorageService();
  final SyncService _syncService = SyncService();
  final Uuid _uuid = const Uuid();

  /// Cache duration for this repository
  Duration get cacheDuration => const Duration(hours: 1);

  /// Cache key prefix for this repository
  String get cacheKeyPrefix;

  /// Convert item to JSON
  Map<String, dynamic> toJson(T item);

  /// Convert JSON to item
  T fromJson(Map<String, dynamic> json);

  /// Fetch data from API
  Future<T> fetchFromApi(String id);

  /// Fetch list from API
  Future<List<T>> fetchListFromApi();

  /// Get single item with offline support
  Future<OfflineResult<T>> get(String id, {bool forceRefresh = false}) async {
    final cacheKey = '${cacheKeyPrefix}_$id';

    // Check if we should use cache
    if (!forceRefresh && !_offlineStorage.isCacheStale(cacheKey, cacheDuration)) {
      final cached = _getCached(id);
      if (cached != null) {
        return OfflineResult(
          data: cached,
          isFromCache: true,
          cacheAge: _offlineStorage.getCacheAge(cacheKey),
        );
      }
    }

    // Try to fetch from API
    if (_offlineStorage.isOnline) {
      try {
        final data = await fetchFromApi(id);
        await _saveToCache(id, data);
        return OfflineResult(
          data: data,
          isFromCache: false,
        );
      } catch (e) {
        debugPrint('[OfflineRepository] API error: $e');
        // Fall back to cache on error
        final cached = _getCached(id);
        if (cached != null) {
          return OfflineResult(
            data: cached,
            isFromCache: true,
            cacheAge: _offlineStorage.getCacheAge(cacheKey),
            error: e.toString(),
          );
        }
        rethrow;
      }
    }

    // Offline - return cached data
    final cached = _getCached(id);
    if (cached != null) {
      return OfflineResult(
        data: cached,
        isFromCache: true,
        cacheAge: _offlineStorage.getCacheAge(cacheKey),
      );
    }

    throw OfflineException('No cached data available for $id');
  }

  /// Get list with offline support
  Future<OfflineResult<List<T>>> getList({bool forceRefresh = false}) async {
    final cacheKey = '${cacheKeyPrefix}_list';

    // Check if we should use cache
    if (!forceRefresh && !_offlineStorage.isCacheStale(cacheKey, cacheDuration)) {
      final cached = _getCachedList();
      if (cached.isNotEmpty) {
        return OfflineResult(
          data: cached,
          isFromCache: true,
          cacheAge: _offlineStorage.getCacheAge(cacheKey),
        );
      }
    }

    // Try to fetch from API
    if (_offlineStorage.isOnline) {
      try {
        final data = await fetchListFromApi();
        await _saveListToCache(data);
        return OfflineResult(
          data: data,
          isFromCache: false,
        );
      } catch (e) {
        debugPrint('[OfflineRepository] API error: $e');
        // Fall back to cache on error
        final cached = _getCachedList();
        if (cached.isNotEmpty) {
          return OfflineResult(
            data: cached,
            isFromCache: true,
            cacheAge: _offlineStorage.getCacheAge(cacheKey),
            error: e.toString(),
          );
        }
        rethrow;
      }
    }

    // Offline - return cached data
    final cached = _getCachedList();
    return OfflineResult(
      data: cached,
      isFromCache: true,
      cacheAge: _offlineStorage.getCacheAge(cacheKey),
    );
  }

  /// Queue an action for offline execution
  Future<void> queueAction(String actionType, Map<String, dynamic> data) async {
    final action = PendingAction(
      id: _uuid.v4(),
      type: actionType,
      data: data,
      createdAt: DateTime.now(),
    );
    await _offlineStorage.addPendingAction(action);
  }

  /// Get cached item
  T? _getCached(String id) {
    // Override in subclass to implement specific caching
    return null;
  }

  /// Get cached list
  List<T> _getCachedList() {
    // Override in subclass to implement specific caching
    return [];
  }

  /// Save item to cache
  Future<void> _saveToCache(String id, T item) async {
    // Override in subclass to implement specific caching
  }

  /// Save list to cache
  Future<void> _saveListToCache(List<T> items) async {
    // Override in subclass to implement specific caching
  }
}

/// Result wrapper for offline-capable operations
class OfflineResult<T> {
  final T data;
  final bool isFromCache;
  final Duration? cacheAge;
  final String? error;

  OfflineResult({
    required this.data,
    required this.isFromCache,
    this.cacheAge,
    this.error,
  });

  bool get hasError => error != null;
  bool get isStale => cacheAge != null && cacheAge! > const Duration(hours: 1);
}

/// Exception for offline scenarios
class OfflineException implements Exception {
  final String message;
  OfflineException(this.message);

  @override
  String toString() => 'OfflineException: $message';
}

// ============================================================================
// Concrete Repository Implementations
// ============================================================================

/// Orders repository with offline support
class OrdersRepository extends OfflineRepository<Map<String, dynamic>> {
  final OfflineStorageService _storage = OfflineStorageService();

  @override
  String get cacheKeyPrefix => 'orders';

  @override
  Duration get cacheDuration => const Duration(minutes: 30);

  @override
  Map<String, dynamic> toJson(Map<String, dynamic> item) => item;

  @override
  Map<String, dynamic> fromJson(Map<String, dynamic> json) => json;

  @override
  Future<Map<String, dynamic>> fetchFromApi(String id) async {
    // TODO: Implement API call
    throw UnimplementedError('Implement fetchFromApi');
  }

  @override
  Future<List<Map<String, dynamic>>> fetchListFromApi() async {
    // TODO: Implement API call
    throw UnimplementedError('Implement fetchListFromApi');
  }

  @override
  Map<String, dynamic>? _getCached(String id) {
    return _storage.getOrder(id);
  }

  @override
  List<Map<String, dynamic>> _getCachedList() {
    return _storage.getOrders();
  }

  @override
  Future<void> _saveToCache(String id, Map<String, dynamic> item) async {
    await _storage.saveOrder(id, item);
  }

  @override
  Future<void> _saveListToCache(List<Map<String, dynamic>> items) async {
    await _storage.saveOrders(items);
  }

  /// Create order with offline support
  Future<OfflineResult<Map<String, dynamic>>> createOrder(
    Map<String, dynamic> orderData,
  ) async {
    if (_storage.isOnline) {
      try {
        // TODO: Call API to create order
        // final result = await api.createOrder(orderData);
        final result = {...orderData, 'id': 'temp_${DateTime.now().millisecondsSinceEpoch}'};
        await _saveToCache(result['id'], result);
        return OfflineResult(data: result, isFromCache: false);
      } catch (e) {
        debugPrint('[OrdersRepository] Create order error: $e');
        rethrow;
      }
    }

    // Queue for later sync
    final tempId = 'offline_${DateTime.now().millisecondsSinceEpoch}';
    final offlineOrder = {
      ...orderData,
      'id': tempId,
      'status': 'pending_sync',
      'isOffline': true,
    };

    await queueAction(PendingActionTypes.createOrder, offlineOrder);
    await _saveToCache(tempId, offlineOrder);

    return OfflineResult(
      data: offlineOrder,
      isFromCache: true,
      error: 'Order queued for sync when online',
    );
  }

  /// Cancel order with offline support
  Future<void> cancelOrder(String orderId, String reason) async {
    if (_storage.isOnline) {
      try {
        // TODO: Call API to cancel order
        return;
      } catch (e) {
        debugPrint('[OrdersRepository] Cancel order error: $e');
        rethrow;
      }
    }

    // Queue for later sync
    await queueAction(PendingActionTypes.cancelOrder, {
      'orderId': orderId,
      'reason': reason,
    });
  }
}

/// Products repository with offline support
class ProductsRepository extends OfflineRepository<Map<String, dynamic>> {
  final OfflineStorageService _storage = OfflineStorageService();

  @override
  String get cacheKeyPrefix => 'products';

  @override
  Duration get cacheDuration => const Duration(hours: 2);

  @override
  Map<String, dynamic> toJson(Map<String, dynamic> item) => item;

  @override
  Map<String, dynamic> fromJson(Map<String, dynamic> json) => json;

  @override
  Future<Map<String, dynamic>> fetchFromApi(String id) async {
    // TODO: Implement API call
    throw UnimplementedError('Implement fetchFromApi');
  }

  @override
  Future<List<Map<String, dynamic>>> fetchListFromApi() async {
    // TODO: Implement API call
    throw UnimplementedError('Implement fetchListFromApi');
  }

  @override
  Map<String, dynamic>? _getCached(String id) {
    return _storage.getProduct(id);
  }

  @override
  List<Map<String, dynamic>> _getCachedList() {
    return _storage.getFeaturedProducts();
  }

  @override
  Future<void> _saveToCache(String id, Map<String, dynamic> item) async {
    await _storage.saveProduct(id, item);
  }

  @override
  Future<void> _saveListToCache(List<Map<String, dynamic>> items) async {
    await _storage.saveFeaturedProducts(items);
  }

  /// Get products by category with offline support
  Future<OfflineResult<List<Map<String, dynamic>>>> getByCategory(
    String categoryId, {
    bool forceRefresh = false,
  }) async {
    final cacheKey = 'products_category_$categoryId';

    // Check cache
    if (!forceRefresh && !_storage.isCacheStale(cacheKey, cacheDuration)) {
      final cached = _storage.getProductsByCategory(categoryId);
      if (cached.isNotEmpty) {
        return OfflineResult(
          data: cached,
          isFromCache: true,
          cacheAge: _storage.getCacheAge(cacheKey),
        );
      }
    }

    // Try API
    if (_storage.isOnline) {
      try {
        // TODO: Fetch from API
        // final products = await api.getProductsByCategory(categoryId);
        // await _storage.saveProductsByCategory(categoryId, products);
        // return OfflineResult(data: products, isFromCache: false);
        throw UnimplementedError();
      } catch (e) {
        final cached = _storage.getProductsByCategory(categoryId);
        if (cached.isNotEmpty) {
          return OfflineResult(
            data: cached,
            isFromCache: true,
            cacheAge: _storage.getCacheAge(cacheKey),
            error: e.toString(),
          );
        }
        rethrow;
      }
    }

    // Return cached
    return OfflineResult(
      data: _storage.getProductsByCategory(categoryId),
      isFromCache: true,
      cacheAge: _storage.getCacheAge(cacheKey),
    );
  }
}

/// Cart repository with offline support
class CartRepository {
  final OfflineStorageService _storage = OfflineStorageService();

  /// Get cart items
  List<Map<String, dynamic>> getItems() {
    return _storage.getCart();
  }

  /// Add item to cart with offline support
  Future<void> addItem(Map<String, dynamic> item) async {
    await _storage.addToCart(item);

    if (_storage.isOnline) {
      try {
        // TODO: Sync with server
        // await api.cart.addItem(item);
      } catch (e) {
        debugPrint('[CartRepository] Add item error: $e');
        // Queue for later sync
        await _storage.addPendingAction(PendingAction(
          id: const Uuid().v4(),
          type: PendingActionTypes.addToCart,
          data: item,
          createdAt: DateTime.now(),
        ));
      }
    } else {
      // Queue for later sync
      await _storage.addPendingAction(PendingAction(
        id: const Uuid().v4(),
        type: PendingActionTypes.addToCart,
        data: item,
        createdAt: DateTime.now(),
      ));
    }
  }

  /// Remove item from cart
  Future<void> removeItem(String productId) async {
    await _storage.removeFromCart(productId);

    if (_storage.isOnline) {
      try {
        // TODO: Sync with server
      } catch (e) {
        await _storage.addPendingAction(PendingAction(
          id: const Uuid().v4(),
          type: PendingActionTypes.removeFromCart,
          data: {'productId': productId},
          createdAt: DateTime.now(),
        ));
      }
    } else {
      await _storage.addPendingAction(PendingAction(
        id: const Uuid().v4(),
        type: PendingActionTypes.removeFromCart,
        data: {'productId': productId},
        createdAt: DateTime.now(),
      ));
    }
  }

  /// Update item quantity
  Future<void> updateQuantity(String productId, int quantity) async {
    await _storage.updateCartQuantity(productId, quantity);

    if (_storage.isOnline) {
      try {
        // TODO: Sync with server
      } catch (e) {
        await _storage.addPendingAction(PendingAction(
          id: const Uuid().v4(),
          type: PendingActionTypes.updateCartQuantity,
          data: {'productId': productId, 'quantity': quantity},
          createdAt: DateTime.now(),
        ));
      }
    } else {
      await _storage.addPendingAction(PendingAction(
        id: const Uuid().v4(),
        type: PendingActionTypes.updateCartQuantity,
        data: {'productId': productId, 'quantity': quantity},
        createdAt: DateTime.now(),
      ));
    }
  }

  /// Clear cart
  Future<void> clear() async {
    await _storage.clearCart();
  }

  /// Get cart total
  double getTotal() {
    final items = getItems();
    return items.fold(0.0, (sum, item) {
      final price = (item['price'] as num?)?.toDouble() ?? 0.0;
      final quantity = (item['quantity'] as int?) ?? 1;
      return sum + (price * quantity);
    });
  }

  /// Get item count
  int getItemCount() {
    final items = getItems();
    return items.fold(0, (sum, item) {
      return sum + ((item['quantity'] as int?) ?? 1);
    });
  }
}
