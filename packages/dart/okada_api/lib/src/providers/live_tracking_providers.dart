import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/websocket/websocket_manager.dart';
import '../services/location/location_tracking_service.dart';

// ============ WebSocket Connection Providers ============

/// WebSocket manager instance provider
final webSocketManagerProvider = Provider<WebSocketManager>((ref) {
  return WebSocketManager.instance;
});

/// WebSocket connection state provider
final webSocketStateProvider = StreamProvider<WebSocketState>((ref) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.stateStream;
});

/// WebSocket connection status
final isWebSocketConnectedProvider = Provider<bool>((ref) {
  final state = ref.watch(webSocketStateProvider);
  return state.maybeWhen(
    data: (s) => s == WebSocketState.connected,
    orElse: () => false,
  );
});

// ============ Order Tracking Providers ============

/// Live order tracking state
class LiveOrderTrackingState {
  final int orderId;
  final String status;
  final RiderLocationUpdate? riderLocation;
  final int? estimatedMinutes;
  final double? distanceKm;
  final DateTime? lastUpdate;
  final bool isLoading;
  final String? error;

  LiveOrderTrackingState({
    required this.orderId,
    this.status = 'pending',
    this.riderLocation,
    this.estimatedMinutes,
    this.distanceKm,
    this.lastUpdate,
    this.isLoading = false,
    this.error,
  });

  LiveOrderTrackingState copyWith({
    int? orderId,
    String? status,
    RiderLocationUpdate? riderLocation,
    int? estimatedMinutes,
    double? distanceKm,
    DateTime? lastUpdate,
    bool? isLoading,
    String? error,
  }) {
    return LiveOrderTrackingState(
      orderId: orderId ?? this.orderId,
      status: status ?? this.status,
      riderLocation: riderLocation ?? this.riderLocation,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      distanceKm: distanceKm ?? this.distanceKm,
      lastUpdate: lastUpdate ?? this.lastUpdate,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Live order tracking notifier
class LiveOrderTrackingNotifier extends StateNotifier<LiveOrderTrackingState> {
  final WebSocketManager _wsManager;
  final int orderId;
  
  StreamSubscription? _statusSubscription;
  StreamSubscription? _locationSubscription;
  StreamSubscription? _etaSubscription;

  LiveOrderTrackingNotifier(this._wsManager, this.orderId)
      : super(LiveOrderTrackingState(orderId: orderId)) {
    _initialize();
  }

  void _initialize() {
    // Subscribe to order updates
    _wsManager.subscribeToOrder(orderId);

    // Listen to order status updates
    _statusSubscription = _wsManager.orderStatusStream
        .where((update) => update.orderId == orderId)
        .listen((update) {
      state = state.copyWith(
        status: update.status,
        lastUpdate: update.timestamp,
      );
    });

    // Listen to rider location updates
    _locationSubscription = _wsManager.riderLocationStream
        .where((update) => update.orderId == orderId)
        .listen((update) {
      state = state.copyWith(
        riderLocation: update,
        lastUpdate: update.timestamp,
      );
    });

    // Listen to ETA updates
    _etaSubscription = _wsManager.etaStream
        .where((update) => update.orderId == orderId)
        .listen((update) {
      state = state.copyWith(
        estimatedMinutes: update.estimatedMinutes,
        distanceKm: update.distanceKm,
        lastUpdate: update.updatedAt,
      );
    });
  }

  void refresh() {
    state = state.copyWith(isLoading: true);
    // Re-subscribe to get latest data
    _wsManager.subscribeToOrder(orderId);
    state = state.copyWith(isLoading: false);
  }

  @override
  void dispose() {
    _statusSubscription?.cancel();
    _locationSubscription?.cancel();
    _etaSubscription?.cancel();
    _wsManager.unsubscribeFromOrder(orderId);
    super.dispose();
  }
}

/// Live order tracking provider family
final liveOrderTrackingProvider = StateNotifierProvider.family<
    LiveOrderTrackingNotifier, LiveOrderTrackingState, int>((ref, orderId) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return LiveOrderTrackingNotifier(wsManager, orderId);
});

// ============ Rider Location Providers ============

/// Stream of rider location updates for an order
final orderRiderLocationProvider = StreamProvider.family<RiderLocationUpdate, int>((ref, orderId) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.riderLocationStream.where((update) => update.orderId == orderId);
});

/// Latest rider location for an order
final latestRiderLocationProvider = Provider.family<RiderLocationUpdate?, int>((ref, orderId) {
  final trackingState = ref.watch(liveOrderTrackingProvider(orderId));
  return trackingState.riderLocation;
});

// ============ Order Status Providers ============

/// Stream of order status updates
final orderStatusStreamProvider = StreamProvider.family<OrderStatusUpdate, int>((ref, orderId) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.orderStatusStream.where((update) => update.orderId == orderId);
});

/// Current order status
final currentOrderStatusProvider = Provider.family<String, int>((ref, orderId) {
  final trackingState = ref.watch(liveOrderTrackingProvider(orderId));
  return trackingState.status;
});

// ============ ETA Providers ============

/// ETA stream for an order
final orderEtaStreamProvider = StreamProvider.family<EtaUpdateEvent, int>((ref, orderId) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.etaStream.where((update) => update.orderId == orderId);
});

/// Current ETA for an order
final currentEtaProvider = Provider.family<({int? minutes, double? distanceKm}), int>((ref, orderId) {
  final trackingState = ref.watch(liveOrderTrackingProvider(orderId));
  return (
    minutes: trackingState.estimatedMinutes,
    distanceKm: trackingState.distanceKm,
  );
});

// ============ Rider-Side Providers ============

/// Location tracking service provider
final locationTrackingServiceProvider = Provider<LocationTrackingService>((ref) {
  return LocationTrackingService.instance;
});

/// Current rider location stream
final currentRiderLocationProvider = StreamProvider<LocationData>((ref) {
  final service = ref.watch(locationTrackingServiceProvider);
  return service.locationStream;
});

/// Rider tracking state
class RiderTrackingState {
  final bool isTracking;
  final int? activeOrderId;
  final LocationData? currentLocation;
  final String? error;

  RiderTrackingState({
    this.isTracking = false,
    this.activeOrderId,
    this.currentLocation,
    this.error,
  });

  RiderTrackingState copyWith({
    bool? isTracking,
    int? activeOrderId,
    LocationData? currentLocation,
    String? error,
  }) {
    return RiderTrackingState(
      isTracking: isTracking ?? this.isTracking,
      activeOrderId: activeOrderId ?? this.activeOrderId,
      currentLocation: currentLocation ?? this.currentLocation,
      error: error,
    );
  }
}

/// Rider tracking notifier
class RiderTrackingNotifier extends StateNotifier<RiderTrackingState> {
  final LocationTrackingService _trackingService;
  StreamSubscription? _locationSubscription;

  RiderTrackingNotifier(this._trackingService) : super(RiderTrackingState()) {
    _locationSubscription = _trackingService.locationStream.listen((location) {
      state = state.copyWith(currentLocation: location);
    });
  }

  Future<void> startTracking(int orderId) async {
    try {
      await _trackingService.startTracking(orderId: orderId);
      state = state.copyWith(
        isTracking: true,
        activeOrderId: orderId,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> stopTracking() async {
    await _trackingService.stopTracking();
    state = state.copyWith(
      isTracking: false,
      activeOrderId: null,
    );
  }

  void updateLocation(LocationData location) {
    _trackingService.updateLocation(location);
    state = state.copyWith(currentLocation: location);
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }
}

/// Rider tracking provider
final riderTrackingProvider = StateNotifierProvider<RiderTrackingNotifier, RiderTrackingState>((ref) {
  final service = ref.watch(locationTrackingServiceProvider);
  return RiderTrackingNotifier(service);
});

// ============ New Order Notifications (Rider) ============

/// Stream of new order notifications for riders
final newOrdersStreamProvider = StreamProvider<NewOrderNotification>((ref) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.newOrderStream;
});

/// New order notification state
class NewOrderNotificationState {
  final List<NewOrderNotification> pendingOrders;
  final bool isSubscribed;

  NewOrderNotificationState({
    this.pendingOrders = const [],
    this.isSubscribed = false,
  });

  NewOrderNotificationState copyWith({
    List<NewOrderNotification>? pendingOrders,
    bool? isSubscribed,
  }) {
    return NewOrderNotificationState(
      pendingOrders: pendingOrders ?? this.pendingOrders,
      isSubscribed: isSubscribed ?? this.isSubscribed,
    );
  }
}

/// New order notification notifier
class NewOrderNotificationNotifier extends StateNotifier<NewOrderNotificationState> {
  final WebSocketManager _wsManager;
  StreamSubscription? _subscription;

  NewOrderNotificationNotifier(this._wsManager) : super(NewOrderNotificationState());

  void subscribe({
    required double? latitude,
    required double? longitude,
    double radiusKm = 10,
  }) {
    _wsManager.subscribeToNewOrders(
      latitude: latitude,
      longitude: longitude,
      radiusKm: radiusKm,
    );

    _subscription = _wsManager.newOrderStream.listen((notification) {
      // Add to pending orders, remove expired ones
      final now = DateTime.now();
      final updatedOrders = [
        notification,
        ...state.pendingOrders.where((o) => o.expiresAt.isAfter(now)),
      ];
      state = state.copyWith(pendingOrders: updatedOrders);
    });

    state = state.copyWith(isSubscribed: true);
  }

  void unsubscribe() {
    _subscription?.cancel();
    _wsManager.unsubscribeFromNewOrders();
    state = state.copyWith(isSubscribed: false, pendingOrders: []);
  }

  void dismissOrder(int orderId) {
    final updatedOrders = state.pendingOrders.where((o) => o.orderId != orderId).toList();
    state = state.copyWith(pendingOrders: updatedOrders);
  }

  void clearExpiredOrders() {
    final now = DateTime.now();
    final updatedOrders = state.pendingOrders.where((o) => o.expiresAt.isAfter(now)).toList();
    state = state.copyWith(pendingOrders: updatedOrders);
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

/// New order notification provider
final newOrderNotificationProvider = StateNotifierProvider<
    NewOrderNotificationNotifier, NewOrderNotificationState>((ref) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return NewOrderNotificationNotifier(wsManager);
});

// ============ Geofencing Providers ============

/// Geofencing service provider
final geofencingServiceProvider = Provider<GeofencingService>((ref) {
  return GeofencingService();
});

/// Geofence entry events
final geofenceEntryProvider = StreamProvider<GeofenceRegion>((ref) {
  final service = ref.watch(geofencingServiceProvider);
  return service.onRegionEntry;
});

/// Geofence exit events
final geofenceExitProvider = StreamProvider<GeofenceRegion>((ref) {
  final service = ref.watch(geofencingServiceProvider);
  return service.onRegionExit;
});

// ============ Notification Providers ============

/// General notification stream
final notificationStreamProvider = StreamProvider<NotificationEvent>((ref) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.notificationStream;
});

/// Notification state
class NotificationState {
  final List<NotificationEvent> notifications;
  final int unreadCount;

  NotificationState({
    this.notifications = const [],
    this.unreadCount = 0,
  });

  NotificationState copyWith({
    List<NotificationEvent>? notifications,
    int? unreadCount,
  }) {
    return NotificationState(
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

/// Notification notifier
class NotificationNotifier extends StateNotifier<NotificationState> {
  final WebSocketManager _wsManager;
  StreamSubscription? _subscription;

  NotificationNotifier(this._wsManager) : super(NotificationState()) {
    _subscription = _wsManager.notificationStream.listen((notification) {
      state = state.copyWith(
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      );
    });
  }

  void markAllAsRead() {
    state = state.copyWith(unreadCount: 0);
  }

  void clearNotifications() {
    state = NotificationState();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

/// Notification provider
final notificationProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return NotificationNotifier(wsManager);
});

/// Unread notification count
final unreadNotificationCountProvider = Provider<int>((ref) {
  final state = ref.watch(notificationProvider);
  return state.unreadCount;
});
