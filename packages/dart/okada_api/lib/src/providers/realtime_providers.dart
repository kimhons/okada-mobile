import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/websocket/websocket_service.dart';
import '../models/api_models.dart';
import 'api_providers.dart';

// ============ WEBSOCKET CONNECTION STATE ============

/// WebSocket connection state provider
final wsConnectionStateProvider = StreamProvider<WebSocketConnectionState>((ref) {
  final wsService = ref.watch(webSocketServiceProvider);
  
  // Create a stream that emits connection state changes
  return Stream.periodic(const Duration(seconds: 1), (_) => wsService.connectionState);
});

/// Is WebSocket connected provider
final isWsConnectedProvider = Provider<bool>((ref) {
  final state = ref.watch(wsConnectionStateProvider);
  return state.when(
    data: (s) => s == WebSocketConnectionState.connected,
    loading: () => false,
    error: (_, __) => false,
  );
});

// ============ ORDER STATUS UPDATES ============

/// Order status update event
class OrderStatusUpdate {
  final int orderId;
  final String status;
  final String? message;
  final DateTime timestamp;
  final Map<String, dynamic>? metadata;

  const OrderStatusUpdate({
    required this.orderId,
    required this.status,
    this.message,
    required this.timestamp,
    this.metadata,
  });

  factory OrderStatusUpdate.fromEvent(WebSocketEvent event) {
    final data = event.data ?? {};
    return OrderStatusUpdate(
      orderId: data['orderId'] as int? ?? 0,
      status: data['status'] as String? ?? 'unknown',
      message: data['message'] as String?,
      timestamp: event.timestamp,
      metadata: data['metadata'] as Map<String, dynamic>?,
    );
  }
}

/// Order status updates stream provider
final orderStatusUpdatesProvider = StreamProvider.family<OrderStatusUpdate, int>((ref, orderId) {
  final wsService = ref.watch(webSocketServiceProvider);
  
  // Subscribe to order updates
  wsService.subscribeToOrder(orderId);
  
  // Return filtered stream
  return wsService.orderStatusUpdates
      .where((e) => e.data?['orderId'] == orderId)
      .map((e) => OrderStatusUpdate.fromEvent(e));
});

// ============ RIDER LOCATION TRACKING ============

/// Rider location update
class RiderLocation {
  final int riderId;
  final double latitude;
  final double longitude;
  final double? heading;
  final double? speed;
  final DateTime timestamp;

  const RiderLocation({
    required this.riderId,
    required this.latitude,
    required this.longitude,
    this.heading,
    this.speed,
    required this.timestamp,
  });

  factory RiderLocation.fromEvent(WebSocketEvent event) {
    final data = event.data ?? {};
    return RiderLocation(
      riderId: data['riderId'] as int? ?? 0,
      latitude: (data['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (data['longitude'] as num?)?.toDouble() ?? 0,
      heading: (data['heading'] as num?)?.toDouble(),
      speed: (data['speed'] as num?)?.toDouble(),
      timestamp: event.timestamp,
    );
  }
}

/// Rider location stream provider
final riderLocationProvider = StreamProvider.family<RiderLocation, int>((ref, riderId) {
  final wsService = ref.watch(webSocketServiceProvider);
  
  // Subscribe to rider location
  wsService.subscribeToRiderLocation(riderId);
  
  // Return filtered stream
  return wsService.riderLocationUpdates
      .where((e) => e.data?['riderId'] == riderId)
      .map((e) => RiderLocation.fromEvent(e));
});

/// Order rider location provider (for tracking order delivery)
final orderRiderLocationProvider = StreamProvider.family<RiderLocation, int>((ref, orderId) {
  final wsService = ref.watch(webSocketServiceProvider);
  
  // Subscribe to order updates which include rider location
  wsService.subscribeToOrder(orderId);
  
  return wsService.riderLocationUpdates
      .where((e) => e.data?['orderId'] == orderId)
      .map((e) => RiderLocation.fromEvent(e));
});

// ============ CHAT / MESSAGING ============

/// Chat message
class ChatMessage {
  final int id;
  final int orderId;
  final int senderId;
  final String senderType; // 'customer' or 'rider'
  final String message;
  final String? imageUrl;
  final DateTime timestamp;
  final bool isRead;

  const ChatMessage({
    required this.id,
    required this.orderId,
    required this.senderId,
    required this.senderType,
    required this.message,
    this.imageUrl,
    required this.timestamp,
    this.isRead = false,
  });

  factory ChatMessage.fromEvent(WebSocketEvent event) {
    final data = event.data ?? {};
    return ChatMessage(
      id: data['id'] as int? ?? 0,
      orderId: data['orderId'] as int? ?? 0,
      senderId: data['senderId'] as int? ?? 0,
      senderType: data['senderType'] as String? ?? 'unknown',
      message: data['message'] as String? ?? '',
      imageUrl: data['imageUrl'] as String?,
      timestamp: event.timestamp,
      isRead: data['isRead'] as bool? ?? false,
    );
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as int? ?? 0,
      orderId: json['orderId'] as int? ?? 0,
      senderId: json['senderId'] as int? ?? 0,
      senderType: json['senderType'] as String? ?? 'unknown',
      message: json['message'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : DateTime.now(),
      isRead: json['isRead'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderId': orderId,
        'senderId': senderId,
        'senderType': senderType,
        'message': message,
        'imageUrl': imageUrl,
        'timestamp': timestamp.toIso8601String(),
        'isRead': isRead,
      };
}

/// Typing indicator state
class TypingIndicator {
  final int orderId;
  final bool isTyping;
  final String senderType;
  final DateTime timestamp;

  const TypingIndicator({
    required this.orderId,
    required this.isTyping,
    required this.senderType,
    required this.timestamp,
  });
}

/// Chat state
class ChatState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String? error;
  final bool isTyping;

  const ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.error,
    this.isTyping = false,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? error,
    bool? isTyping,
  }) =>
      ChatState(
        messages: messages ?? this.messages,
        isLoading: isLoading ?? this.isLoading,
        error: error,
        isTyping: isTyping ?? this.isTyping,
      );
}

/// Chat notifier for managing chat state
class ChatNotifier extends StateNotifier<ChatState> {
  final int orderId;
  final WebSocketService _wsService;
  StreamSubscription? _messageSubscription;

  ChatNotifier(this.orderId, this._wsService) : super(const ChatState()) {
    _init();
  }

  void _init() {
    // Subscribe to chat messages
    _wsService.subscribeToChat(orderId);
    
    // Listen for new messages
    _messageSubscription = _wsService.messages
        .where((e) => e.data?['orderId'] == orderId)
        .listen((event) {
      final message = ChatMessage.fromEvent(event);
      state = state.copyWith(
        messages: [...state.messages, message],
      );
    });
  }

  void sendMessage(String text, {String? imageUrl}) {
    _wsService.sendChatMessage(
      orderId: orderId,
      message: text,
      imageUrl: imageUrl,
    );
    
    // Optimistically add message to state
    // In real implementation, wait for server confirmation
  }

  void setTyping(bool isTyping) {
    _wsService.sendTypingIndicator(orderId, isTyping);
  }

  void loadHistory(List<ChatMessage> messages) {
    state = state.copyWith(messages: messages);
  }

  @override
  void dispose() {
    _messageSubscription?.cancel();
    _wsService.unsubscribeFromChat(orderId);
    super.dispose();
  }
}

/// Chat provider family
final chatProvider = StateNotifierProvider.family<ChatNotifier, ChatState, int>((ref, orderId) {
  final wsService = ref.watch(webSocketServiceProvider);
  return ChatNotifier(orderId, wsService);
});

/// New messages stream provider
final newMessagesProvider = StreamProvider.family<ChatMessage, int>((ref, orderId) {
  final wsService = ref.watch(webSocketServiceProvider);
  
  wsService.subscribeToChat(orderId);
  
  return wsService.messages
      .where((e) => e.data?['orderId'] == orderId)
      .map((e) => ChatMessage.fromEvent(e));
});

// ============ NEW ORDER NOTIFICATIONS (FOR RIDERS) ============

/// New order notification
class NewOrderNotification {
  final int orderId;
  final String orderNumber;
  final String pickupAddress;
  final String deliveryAddress;
  final double distance;
  final double estimatedEarnings;
  final DateTime timestamp;

  const NewOrderNotification({
    required this.orderId,
    required this.orderNumber,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.distance,
    required this.estimatedEarnings,
    required this.timestamp,
  });

  factory NewOrderNotification.fromEvent(WebSocketEvent event) {
    final data = event.data ?? {};
    return NewOrderNotification(
      orderId: data['orderId'] as int? ?? 0,
      orderNumber: data['orderNumber'] as String? ?? '',
      pickupAddress: data['pickupAddress'] as String? ?? '',
      deliveryAddress: data['deliveryAddress'] as String? ?? '',
      distance: (data['distance'] as num?)?.toDouble() ?? 0,
      estimatedEarnings: (data['estimatedEarnings'] as num?)?.toDouble() ?? 0,
      timestamp: event.timestamp,
    );
  }
}

/// New orders stream provider (for riders)
final newOrdersStreamProvider = StreamProvider<NewOrderNotification>((ref) {
  final wsService = ref.watch(webSocketServiceProvider);
  
  wsService.subscribeToNewOrders();
  
  return wsService.newOrders.map((e) => NewOrderNotification.fromEvent(e));
});

// ============ NOTIFICATIONS ============

/// App notification
class AppNotification {
  final String id;
  final String title;
  final String body;
  final String type;
  final Map<String, dynamic>? data;
  final DateTime timestamp;
  final bool isRead;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.data,
    required this.timestamp,
    this.isRead = false,
  });

  factory AppNotification.fromEvent(WebSocketEvent event) {
    final data = event.data ?? {};
    return AppNotification(
      id: data['id'] as String? ?? '',
      title: data['title'] as String? ?? '',
      body: data['body'] as String? ?? '',
      type: data['type'] as String? ?? 'general',
      data: data['data'] as Map<String, dynamic>?,
      timestamp: event.timestamp,
      isRead: false,
    );
  }
}

/// Notifications stream provider
final notificationsStreamProvider = StreamProvider<AppNotification>((ref) {
  final wsService = ref.watch(webSocketServiceProvider);
  return wsService.notifications.map((e) => AppNotification.fromEvent(e));
});

/// Unread notifications count state
final unreadNotificationsCountProvider = StateProvider<int>((ref) => 0);

// ============ LIVE ORDER TRACKING STATE ============

/// Live order tracking state
class LiveOrderTrackingState {
  final int orderId;
  final String status;
  final RiderLocation? riderLocation;
  final int? estimatedMinutes;
  final double? distanceKm;
  final DateTime lastUpdated;

  const LiveOrderTrackingState({
    required this.orderId,
    required this.status,
    this.riderLocation,
    this.estimatedMinutes,
    this.distanceKm,
    required this.lastUpdated,
  });

  LiveOrderTrackingState copyWith({
    String? status,
    RiderLocation? riderLocation,
    int? estimatedMinutes,
    double? distanceKm,
    DateTime? lastUpdated,
  }) =>
      LiveOrderTrackingState(
        orderId: orderId,
        status: status ?? this.status,
        riderLocation: riderLocation ?? this.riderLocation,
        estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
        distanceKm: distanceKm ?? this.distanceKm,
        lastUpdated: lastUpdated ?? this.lastUpdated,
      );
}

/// Live order tracking notifier
class LiveOrderTrackingNotifier extends StateNotifier<LiveOrderTrackingState> {
  final int orderId;
  final WebSocketService _wsService;
  StreamSubscription? _statusSubscription;
  StreamSubscription? _locationSubscription;

  LiveOrderTrackingNotifier(this.orderId, this._wsService)
      : super(LiveOrderTrackingState(
          orderId: orderId,
          status: 'unknown',
          lastUpdated: DateTime.now(),
        )) {
    _init();
  }

  void _init() {
    // Subscribe to order updates
    _wsService.subscribeToOrder(orderId);
    
    // Listen for status updates
    _statusSubscription = _wsService.orderStatusUpdates
        .where((e) => e.data?['orderId'] == orderId)
        .listen((event) {
      final data = event.data ?? {};
      state = state.copyWith(
        status: data['status'] as String?,
        estimatedMinutes: data['estimatedMinutes'] as int?,
        distanceKm: (data['distanceKm'] as num?)?.toDouble(),
        lastUpdated: DateTime.now(),
      );
    });
    
    // Listen for rider location updates
    _locationSubscription = _wsService.riderLocationUpdates
        .where((e) => e.data?['orderId'] == orderId)
        .listen((event) {
      state = state.copyWith(
        riderLocation: RiderLocation.fromEvent(event),
        lastUpdated: DateTime.now(),
      );
    });
  }

  @override
  void dispose() {
    _statusSubscription?.cancel();
    _locationSubscription?.cancel();
    _wsService.unsubscribeFromOrder(orderId);
    super.dispose();
  }
}

/// Live order tracking provider
final liveOrderTrackingProvider = StateNotifierProvider.family<
    LiveOrderTrackingNotifier, LiveOrderTrackingState, int>((ref, orderId) {
  final wsService = ref.watch(webSocketServiceProvider);
  return LiveOrderTrackingNotifier(orderId, wsService);
});
