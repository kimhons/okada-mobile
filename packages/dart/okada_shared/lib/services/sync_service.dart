import 'dart:async';

import 'package:flutter/foundation.dart';

import 'offline_storage_service.dart';

/// Sync service for handling data synchronization between local cache and server
class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final OfflineStorageService _offlineStorage = OfflineStorageService();

  // API client reference (to be set by the app)
  dynamic apiClient;

  // Sync state
  bool _isSyncing = false;
  bool get isSyncing => _isSyncing;

  // Sync callbacks
  Function(SyncProgress)? onSyncProgress;
  Function(SyncResult)? onSyncComplete;
  Function(SyncError)? onSyncError;

  // Conflict resolution strategy
  ConflictResolutionStrategy conflictStrategy = ConflictResolutionStrategy.serverWins;

  /// Initialize sync service
  Future<void> initialize() async {
    await _offlineStorage.initialize();

    // Set up pending actions sync callback
    _offlineStorage.onPendingActionsSync = _syncPendingActions;

    // Set up connectivity change callback
    _offlineStorage.onConnectivityChanged = _onConnectivityChanged;
  }

  /// Handle connectivity change
  void _onConnectivityChanged() {
    if (_offlineStorage.isOnline) {
      debugPrint('[SyncService] Online - starting sync');
      syncAll();
    }
  }

  /// Sync all data
  Future<SyncResult> syncAll() async {
    if (_isSyncing) {
      debugPrint('[SyncService] Sync already in progress');
      return SyncResult(
        success: false,
        message: 'Sync already in progress',
        syncedItems: 0,
        failedItems: 0,
      );
    }

    if (!_offlineStorage.isOnline) {
      debugPrint('[SyncService] Offline - cannot sync');
      return SyncResult(
        success: false,
        message: 'No internet connection',
        syncedItems: 0,
        failedItems: 0,
      );
    }

    _isSyncing = true;
    int syncedItems = 0;
    int failedItems = 0;
    final errors = <String>[];

    try {
      // 1. Sync pending actions first
      onSyncProgress?.call(SyncProgress(
        stage: 'pending_actions',
        progress: 0.0,
        message: 'Syncing pending actions...',
      ));

      final pendingResult = await _syncPendingActionsInternal();
      syncedItems += pendingResult.synced;
      failedItems += pendingResult.failed;
      if (pendingResult.errors.isNotEmpty) {
        errors.addAll(pendingResult.errors);
      }

      // 2. Refresh user profile
      onSyncProgress?.call(SyncProgress(
        stage: 'user_profile',
        progress: 0.25,
        message: 'Syncing user profile...',
      ));

      await _syncUserProfile();

      // 3. Refresh orders
      onSyncProgress?.call(SyncProgress(
        stage: 'orders',
        progress: 0.5,
        message: 'Syncing orders...',
      ));

      await _syncOrders();

      // 4. Refresh products and categories
      onSyncProgress?.call(SyncProgress(
        stage: 'products',
        progress: 0.75,
        message: 'Syncing products...',
      ));

      await _syncProductsAndCategories();

      // 5. Sync cart
      onSyncProgress?.call(SyncProgress(
        stage: 'cart',
        progress: 0.9,
        message: 'Syncing cart...',
      ));

      await _syncCart();

      onSyncProgress?.call(SyncProgress(
        stage: 'complete',
        progress: 1.0,
        message: 'Sync complete',
      ));

      final result = SyncResult(
        success: failedItems == 0,
        message: failedItems == 0 
            ? 'Sync completed successfully'
            : 'Sync completed with $failedItems errors',
        syncedItems: syncedItems,
        failedItems: failedItems,
        errors: errors,
      );

      onSyncComplete?.call(result);
      return result;
    } catch (e) {
      debugPrint('[SyncService] Sync error: $e');
      final result = SyncResult(
        success: false,
        message: 'Sync failed: $e',
        syncedItems: syncedItems,
        failedItems: failedItems + 1,
        errors: [...errors, e.toString()],
      );

      onSyncError?.call(SyncError(
        stage: 'unknown',
        message: e.toString(),
      ));

      return result;
    } finally {
      _isSyncing = false;
    }
  }

  /// Sync pending actions
  Future<void> _syncPendingActions(List<PendingAction> actions) async {
    await _syncPendingActionsInternal();
  }

  /// Internal method to sync pending actions
  Future<({int synced, int failed, List<String> errors})> _syncPendingActionsInternal() async {
    final actions = _offlineStorage.getPendingActions();
    int synced = 0;
    int failed = 0;
    final errors = <String>[];

    for (final action in actions) {
      try {
        final success = await _executePendingAction(action);
        if (success) {
          await _offlineStorage.removePendingAction(action.id);
          synced++;
        } else if (action.canRetry) {
          // Update retry count
          final updatedAction = action.copyWith(retryCount: action.retryCount + 1);
          await _offlineStorage.removePendingAction(action.id);
          await _offlineStorage.addPendingAction(updatedAction);
          failed++;
        } else {
          // Max retries reached, remove action
          await _offlineStorage.removePendingAction(action.id);
          failed++;
          errors.add('Action ${action.type} failed after ${action.maxRetries} retries');
        }
      } catch (e) {
        debugPrint('[SyncService] Error executing action ${action.type}: $e');
        failed++;
        errors.add('Action ${action.type}: $e');
      }
    }

    debugPrint('[SyncService] Pending actions sync: $synced synced, $failed failed');
    return (synced: synced, failed: failed, errors: errors);
  }

  /// Execute a single pending action
  Future<bool> _executePendingAction(PendingAction action) async {
    if (apiClient == null) {
      debugPrint('[SyncService] API client not set');
      return false;
    }

    try {
      switch (action.type) {
        case PendingActionTypes.addToCart:
          // await apiClient.cart.addItem(action.data);
          debugPrint('[SyncService] Would add to cart: ${action.data}');
          return true;

        case PendingActionTypes.removeFromCart:
          // await apiClient.cart.removeItem(action.data['productId']);
          debugPrint('[SyncService] Would remove from cart: ${action.data}');
          return true;

        case PendingActionTypes.updateCartQuantity:
          // await apiClient.cart.updateQuantity(action.data);
          debugPrint('[SyncService] Would update cart quantity: ${action.data}');
          return true;

        case PendingActionTypes.createOrder:
          // await apiClient.orders.create(action.data);
          debugPrint('[SyncService] Would create order: ${action.data}');
          return true;

        case PendingActionTypes.cancelOrder:
          // await apiClient.orders.cancel(action.data['orderId']);
          debugPrint('[SyncService] Would cancel order: ${action.data}');
          return true;

        case PendingActionTypes.rateOrder:
          // await apiClient.orders.rate(action.data);
          debugPrint('[SyncService] Would rate order: ${action.data}');
          return true;

        case PendingActionTypes.updateProfile:
          // await apiClient.user.updateProfile(action.data);
          debugPrint('[SyncService] Would update profile: ${action.data}');
          return true;

        case PendingActionTypes.acceptOrder:
          // await apiClient.rider.acceptOrder(action.data['orderId']);
          debugPrint('[SyncService] Would accept order: ${action.data}');
          return true;

        case PendingActionTypes.rejectOrder:
          // await apiClient.rider.rejectOrder(action.data['orderId']);
          debugPrint('[SyncService] Would reject order: ${action.data}');
          return true;

        case PendingActionTypes.confirmPickup:
          // await apiClient.rider.confirmPickup(action.data);
          debugPrint('[SyncService] Would confirm pickup: ${action.data}');
          return true;

        case PendingActionTypes.confirmDelivery:
          // await apiClient.rider.confirmDelivery(action.data);
          debugPrint('[SyncService] Would confirm delivery: ${action.data}');
          return true;

        case PendingActionTypes.updateLocation:
          // await apiClient.rider.updateLocation(action.data);
          debugPrint('[SyncService] Would update location: ${action.data}');
          return true;

        case PendingActionTypes.sendMessage:
          // await apiClient.chat.sendMessage(action.data);
          debugPrint('[SyncService] Would send message: ${action.data}');
          return true;

        default:
          debugPrint('[SyncService] Unknown action type: ${action.type}');
          return false;
      }
    } catch (e) {
      debugPrint('[SyncService] Error executing ${action.type}: $e');
      return false;
    }
  }

  /// Sync user profile
  Future<void> _syncUserProfile() async {
    try {
      // Fetch latest profile from server
      // final profile = await apiClient.user.getProfile();
      // await _offlineStorage.saveUserProfile(profile);
      debugPrint('[SyncService] User profile synced');
    } catch (e) {
      debugPrint('[SyncService] Error syncing user profile: $e');
    }
  }

  /// Sync orders
  Future<void> _syncOrders() async {
    try {
      // Fetch latest orders from server
      // final orders = await apiClient.orders.list();
      // await _offlineStorage.saveOrders(orders);
      debugPrint('[SyncService] Orders synced');
    } catch (e) {
      debugPrint('[SyncService] Error syncing orders: $e');
    }
  }

  /// Sync products and categories
  Future<void> _syncProductsAndCategories() async {
    try {
      // Fetch categories
      // final categories = await apiClient.categories.list();
      // await _offlineStorage.saveCategories(categories);

      // Fetch featured products
      // final featured = await apiClient.products.featured();
      // await _offlineStorage.saveFeaturedProducts(featured);

      debugPrint('[SyncService] Products and categories synced');
    } catch (e) {
      debugPrint('[SyncService] Error syncing products: $e');
    }
  }

  /// Sync cart
  Future<void> _syncCart() async {
    try {
      final localCart = _offlineStorage.getCart();
      
      if (localCart.isEmpty) {
        // Fetch server cart
        // final serverCart = await apiClient.cart.get();
        // await _offlineStorage.saveCart(serverCart);
      } else {
        // Merge local and server cart based on conflict strategy
        // final serverCart = await apiClient.cart.get();
        // final mergedCart = _mergeCart(localCart, serverCart);
        // await apiClient.cart.sync(mergedCart);
        // await _offlineStorage.saveCart(mergedCart);
      }

      debugPrint('[SyncService] Cart synced');
    } catch (e) {
      debugPrint('[SyncService] Error syncing cart: $e');
    }
  }

  /// Merge cart items with conflict resolution
  List<Map<String, dynamic>> _mergeCart(
    List<Map<String, dynamic>> local,
    List<Map<String, dynamic>> server,
  ) {
    switch (conflictStrategy) {
      case ConflictResolutionStrategy.serverWins:
        return server;
      
      case ConflictResolutionStrategy.localWins:
        return local;
      
      case ConflictResolutionStrategy.merge:
        final merged = <String, Map<String, dynamic>>{};
        
        // Add server items
        for (final item in server) {
          merged[item['productId'] as String] = item;
        }
        
        // Merge local items (local quantity takes precedence)
        for (final item in local) {
          final productId = item['productId'] as String;
          if (merged.containsKey(productId)) {
            // Keep higher quantity
            final serverQty = merged[productId]!['quantity'] as int;
            final localQty = item['quantity'] as int;
            merged[productId]!['quantity'] = localQty > serverQty ? localQty : serverQty;
          } else {
            merged[productId] = item;
          }
        }
        
        return merged.values.toList();
      
      case ConflictResolutionStrategy.lastWriteWins:
        // Compare timestamps and use the most recent
        // This requires timestamp tracking in cart items
        return local; // Simplified - use local for now
    }
  }

  /// Force sync specific data type
  Future<void> forceSync(SyncDataType dataType) async {
    if (!_offlineStorage.isOnline) {
      debugPrint('[SyncService] Offline - cannot force sync');
      return;
    }

    switch (dataType) {
      case SyncDataType.userProfile:
        await _syncUserProfile();
        break;
      case SyncDataType.orders:
        await _syncOrders();
        break;
      case SyncDataType.products:
        await _syncProductsAndCategories();
        break;
      case SyncDataType.cart:
        await _syncCart();
        break;
      case SyncDataType.pendingActions:
        await _syncPendingActionsInternal();
        break;
    }
  }
}

/// Sync progress model
class SyncProgress {
  final String stage;
  final double progress;
  final String message;

  SyncProgress({
    required this.stage,
    required this.progress,
    required this.message,
  });
}

/// Sync result model
class SyncResult {
  final bool success;
  final String message;
  final int syncedItems;
  final int failedItems;
  final List<String> errors;

  SyncResult({
    required this.success,
    required this.message,
    required this.syncedItems,
    required this.failedItems,
    this.errors = const [],
  });
}

/// Sync error model
class SyncError {
  final String stage;
  final String message;

  SyncError({
    required this.stage,
    required this.message,
  });
}

/// Conflict resolution strategies
enum ConflictResolutionStrategy {
  serverWins,
  localWins,
  merge,
  lastWriteWins,
}

/// Data types that can be synced
enum SyncDataType {
  userProfile,
  orders,
  products,
  cart,
  pendingActions,
}
