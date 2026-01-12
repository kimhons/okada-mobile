import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

/// WebSocket connection states
enum WebSocketState {
  disconnected,
  connecting,
  connected,
  reconnecting,
  error,
}

/// WebSocket event types
class WebSocketEventType {
  static const String orderStatusUpdate = 'order_status_update';
  static const String riderLocationUpdate = 'rider_location_update';
  static const String newOrderAvailable = 'new_order_available';
  static const String chatMessage = 'chat_message';
  static const String chatTyping = 'chat_typing';
  static const String chatRead = 'chat_read';
  static const String notification = 'notification';
  static const String etaUpdate = 'eta_update';
  static const String orderAssigned = 'order_assigned';
  static const String orderCancelled = 'order_cancelled';
  static const String paymentConfirmed = 'payment_confirmed';
  static const String ping = 'ping';
  static const String pong = 'pong';
}

/// WebSocket event data
class WebSocketEvent {
  final String type;
  final Map<String, dynamic> data;
  final DateTime timestamp;

  WebSocketEvent({
    required this.type,
    required this.data,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  factory WebSocketEvent.fromJson(Map<String, dynamic> json) {
    return WebSocketEvent(
      type: json['type'] as String,
      data: json['data'] as Map<String, dynamic>? ?? {},
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'type': type,
    'data': data,
    'timestamp': timestamp.toIso8601String(),
  };
}

/// Comprehensive WebSocket Manager for real-time features
class WebSocketManager {
  static WebSocketManager? _instance;
  static WebSocketManager get instance => _instance ??= WebSocketManager._();

  WebSocketManager._();

  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  Timer? _pingTimer;
  Timer? _reconnectTimer;
  
  WebSocketState _state = WebSocketState.disconnected;
  String? _authToken;
  String? _userId;
  String? _userType; // 'customer' or 'rider'
  
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 3);
  static const Duration _pingInterval = Duration(seconds: 30);

  // Event streams
  final _stateController = StreamController<WebSocketState>.broadcast();
  final _eventController = StreamController<WebSocketEvent>.broadcast();
  final _orderStatusController = StreamController<OrderStatusUpdate>.broadcast();
  final _riderLocationController = StreamController<RiderLocationUpdate>.broadcast();
  final _newOrderController = StreamController<NewOrderNotification>.broadcast();
  final _chatMessageController = StreamController<ChatMessageEvent>.broadcast();
  final _chatTypingController = StreamController<ChatTypingEvent>.broadcast();
  final _notificationController = StreamController<NotificationEvent>.broadcast();
  final _etaController = StreamController<EtaUpdateEvent>.broadcast();

  // Public streams
  Stream<WebSocketState> get stateStream => _stateController.stream;
  Stream<WebSocketEvent> get eventStream => _eventController.stream;
  Stream<OrderStatusUpdate> get orderStatusStream => _orderStatusController.stream;
  Stream<RiderLocationUpdate> get riderLocationStream => _riderLocationController.stream;
  Stream<NewOrderNotification> get newOrderStream => _newOrderController.stream;
  Stream<ChatMessageEvent> get chatMessageStream => _chatMessageController.stream;
  Stream<ChatTypingEvent> get chatTypingStream => _chatTypingController.stream;
  Stream<NotificationEvent> get notificationStream => _notificationController.stream;
  Stream<EtaUpdateEvent> get etaStream => _etaController.stream;

  WebSocketState get state => _state;
  bool get isConnected => _state == WebSocketState.connected;

  /// Initialize WebSocket connection
  Future<void> connect({
    required String baseUrl,
    required String authToken,
    required String userId,
    required String userType,
  }) async {
    if (_state == WebSocketState.connecting || _state == WebSocketState.connected) {
      return;
    }

    _authToken = authToken;
    _userId = userId;
    _userType = userType;

    await _connect(baseUrl);
  }

  Future<void> _connect(String baseUrl) async {
    _updateState(WebSocketState.connecting);

    try {
      final wsUrl = baseUrl.replaceFirst('http', 'ws');
      final uri = Uri.parse('$wsUrl/ws?token=$_authToken&userId=$_userId&userType=$_userType');
      
      _channel = WebSocketChannel.connect(uri);
      
      _subscription = _channel!.stream.listen(
        _onMessage,
        onError: _onError,
        onDone: _onDone,
      );

      _updateState(WebSocketState.connected);
      _reconnectAttempts = 0;
      _startPingTimer();

      // Send initial authentication
      _send({
        'type': 'authenticate',
        'data': {
          'token': _authToken,
          'userId': _userId,
          'userType': _userType,
        },
      });

    } catch (e) {
      _updateState(WebSocketState.error);
      _scheduleReconnect(baseUrl);
    }
  }

  void _onMessage(dynamic message) {
    try {
      final json = jsonDecode(message as String) as Map<String, dynamic>;
      final event = WebSocketEvent.fromJson(json);
      
      _eventController.add(event);
      _routeEvent(event);
    } catch (e) {
      print('WebSocket message parse error: $e');
    }
  }

  void _routeEvent(WebSocketEvent event) {
    switch (event.type) {
      case WebSocketEventType.orderStatusUpdate:
        _orderStatusController.add(OrderStatusUpdate.fromJson(event.data));
        break;
      case WebSocketEventType.riderLocationUpdate:
        _riderLocationController.add(RiderLocationUpdate.fromJson(event.data));
        break;
      case WebSocketEventType.newOrderAvailable:
        _newOrderController.add(NewOrderNotification.fromJson(event.data));
        break;
      case WebSocketEventType.chatMessage:
        _chatMessageController.add(ChatMessageEvent.fromJson(event.data));
        break;
      case WebSocketEventType.chatTyping:
        _chatTypingController.add(ChatTypingEvent.fromJson(event.data));
        break;
      case WebSocketEventType.notification:
        _notificationController.add(NotificationEvent.fromJson(event.data));
        break;
      case WebSocketEventType.etaUpdate:
        _etaController.add(EtaUpdateEvent.fromJson(event.data));
        break;
      case WebSocketEventType.pong:
        // Handle pong response
        break;
    }
  }

  void _onError(dynamic error) {
    print('WebSocket error: $error');
    _updateState(WebSocketState.error);
  }

  void _onDone() {
    _updateState(WebSocketState.disconnected);
    _stopPingTimer();
    
    if (_reconnectAttempts < _maxReconnectAttempts) {
      _scheduleReconnect(_channel?.closeReason ?? '');
    }
  }

  void _scheduleReconnect(String baseUrl) {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(_reconnectDelay * (_reconnectAttempts + 1), () {
      _reconnectAttempts++;
      _updateState(WebSocketState.reconnecting);
      _connect(baseUrl);
    });
  }

  void _startPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(_pingInterval, (_) {
      _send({'type': WebSocketEventType.ping, 'data': {}});
    });
  }

  void _stopPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = null;
  }

  void _updateState(WebSocketState newState) {
    _state = newState;
    _stateController.add(newState);
  }

  void _send(Map<String, dynamic> data) {
    if (_channel != null && _state == WebSocketState.connected) {
      _channel!.sink.add(jsonEncode(data));
    }
  }

  // ============ Public Methods ============

  /// Subscribe to order updates
  void subscribeToOrder(int orderId) {
    _send({
      'type': 'subscribe_order',
      'data': {'orderId': orderId},
    });
  }

  /// Unsubscribe from order updates
  void unsubscribeFromOrder(int orderId) {
    _send({
      'type': 'unsubscribe_order',
      'data': {'orderId': orderId},
    });
  }

  /// Subscribe to new orders (for riders)
  void subscribeToNewOrders({
    required double? latitude,
    required double? longitude,
    double radiusKm = 10,
  }) {
    _send({
      'type': 'subscribe_new_orders',
      'data': {
        'latitude': latitude,
        'longitude': longitude,
        'radiusKm': radiusKm,
      },
    });
  }

  /// Unsubscribe from new orders
  void unsubscribeFromNewOrders() {
    _send({
      'type': 'unsubscribe_new_orders',
      'data': {},
    });
  }

  /// Subscribe to chat for an order
  void subscribeToChat(int orderId) {
    _send({
      'type': 'subscribe_chat',
      'data': {'orderId': orderId},
    });
  }

  /// Unsubscribe from chat
  void unsubscribeFromChat(int orderId) {
    _send({
      'type': 'unsubscribe_chat',
      'data': {'orderId': orderId},
    });
  }

  /// Send chat message
  void sendChatMessage({
    required int orderId,
    required String message,
    String? imageUrl,
  }) {
    _send({
      'type': 'send_chat_message',
      'data': {
        'orderId': orderId,
        'message': message,
        if (imageUrl != null) 'imageUrl': imageUrl,
      },
    });
  }

  /// Send typing indicator
  void sendTypingIndicator({
    required int orderId,
    required bool isTyping,
  }) {
    _send({
      'type': 'typing_indicator',
      'data': {
        'orderId': orderId,
        'isTyping': isTyping,
      },
    });
  }

  /// Mark messages as read
  void markMessagesRead({
    required int orderId,
    required List<int> messageIds,
  }) {
    _send({
      'type': 'mark_messages_read',
      'data': {
        'orderId': orderId,
        'messageIds': messageIds,
      },
    });
  }

  /// Update rider location (for riders)
  void updateRiderLocation({
    required int orderId,
    required double latitude,
    required double longitude,
    double? heading,
    double? speed,
  }) {
    _send({
      'type': 'update_rider_location',
      'data': {
        'orderId': orderId,
        'latitude': latitude,
        'longitude': longitude,
        if (heading != null) 'heading': heading,
        if (speed != null) 'speed': speed,
      },
    });
  }

  /// Update order status (for riders)
  void updateOrderStatus({
    required int orderId,
    required String status,
    String? note,
  }) {
    _send({
      'type': 'update_order_status',
      'data': {
        'orderId': orderId,
        'status': status,
        if (note != null) 'note': note,
      },
    });
  }

  /// Disconnect WebSocket
  void disconnect() {
    _stopPingTimer();
    _reconnectTimer?.cancel();
    _subscription?.cancel();
    _channel?.sink.close();
    _channel = null;
    _updateState(WebSocketState.disconnected);
  }

  /// Dispose all resources
  void dispose() {
    disconnect();
    _stateController.close();
    _eventController.close();
    _orderStatusController.close();
    _riderLocationController.close();
    _newOrderController.close();
    _chatMessageController.close();
    _chatTypingController.close();
    _notificationController.close();
    _etaController.close();
  }
}

// ============ Event Models ============

class OrderStatusUpdate {
  final int orderId;
  final String status;
  final String? note;
  final DateTime timestamp;

  OrderStatusUpdate({
    required this.orderId,
    required this.status,
    this.note,
    required this.timestamp,
  });

  factory OrderStatusUpdate.fromJson(Map<String, dynamic> json) {
    return OrderStatusUpdate(
      orderId: json['orderId'] as int,
      status: json['status'] as String,
      note: json['note'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class RiderLocationUpdate {
  final int orderId;
  final int riderId;
  final double latitude;
  final double longitude;
  final double? heading;
  final double? speed;
  final DateTime timestamp;

  RiderLocationUpdate({
    required this.orderId,
    required this.riderId,
    required this.latitude,
    required this.longitude,
    this.heading,
    this.speed,
    required this.timestamp,
  });

  factory RiderLocationUpdate.fromJson(Map<String, dynamic> json) {
    return RiderLocationUpdate(
      orderId: json['orderId'] as int,
      riderId: json['riderId'] as int,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      heading: (json['heading'] as num?)?.toDouble(),
      speed: (json['speed'] as num?)?.toDouble(),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class NewOrderNotification {
  final int orderId;
  final String orderNumber;
  final String pickupAddress;
  final String deliveryAddress;
  final double distance;
  final double estimatedEarnings;
  final int itemCount;
  final DateTime expiresAt;

  NewOrderNotification({
    required this.orderId,
    required this.orderNumber,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.distance,
    required this.estimatedEarnings,
    required this.itemCount,
    required this.expiresAt,
  });

  factory NewOrderNotification.fromJson(Map<String, dynamic> json) {
    return NewOrderNotification(
      orderId: json['orderId'] as int,
      orderNumber: json['orderNumber'] as String,
      pickupAddress: json['pickupAddress'] as String,
      deliveryAddress: json['deliveryAddress'] as String,
      distance: (json['distance'] as num).toDouble(),
      estimatedEarnings: (json['estimatedEarnings'] as num).toDouble(),
      itemCount: json['itemCount'] as int,
      expiresAt: DateTime.parse(json['expiresAt'] as String),
    );
  }
}

class ChatMessageEvent {
  final int orderId;
  final int messageId;
  final String senderId;
  final String senderType;
  final String message;
  final String? imageUrl;
  final DateTime timestamp;

  ChatMessageEvent({
    required this.orderId,
    required this.messageId,
    required this.senderId,
    required this.senderType,
    required this.message,
    this.imageUrl,
    required this.timestamp,
  });

  factory ChatMessageEvent.fromJson(Map<String, dynamic> json) {
    return ChatMessageEvent(
      orderId: json['orderId'] as int,
      messageId: json['messageId'] as int,
      senderId: json['senderId'] as String,
      senderType: json['senderType'] as String,
      message: json['message'] as String,
      imageUrl: json['imageUrl'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class ChatTypingEvent {
  final int orderId;
  final String senderId;
  final String senderType;
  final bool isTyping;

  ChatTypingEvent({
    required this.orderId,
    required this.senderId,
    required this.senderType,
    required this.isTyping,
  });

  factory ChatTypingEvent.fromJson(Map<String, dynamic> json) {
    return ChatTypingEvent(
      orderId: json['orderId'] as int,
      senderId: json['senderId'] as String,
      senderType: json['senderType'] as String,
      isTyping: json['isTyping'] as bool,
    );
  }
}

class NotificationEvent {
  final String id;
  final String title;
  final String body;
  final String? type;
  final Map<String, dynamic>? data;
  final DateTime timestamp;

  NotificationEvent({
    required this.id,
    required this.title,
    required this.body,
    this.type,
    this.data,
    required this.timestamp,
  });

  factory NotificationEvent.fromJson(Map<String, dynamic> json) {
    return NotificationEvent(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      type: json['type'] as String?,
      data: json['data'] as Map<String, dynamic>?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class EtaUpdateEvent {
  final int orderId;
  final int estimatedMinutes;
  final double distanceKm;
  final DateTime updatedAt;

  EtaUpdateEvent({
    required this.orderId,
    required this.estimatedMinutes,
    required this.distanceKm,
    required this.updatedAt,
  });

  factory EtaUpdateEvent.fromJson(Map<String, dynamic> json) {
    return EtaUpdateEvent(
      orderId: json['orderId'] as int,
      estimatedMinutes: json['estimatedMinutes'] as int,
      distanceKm: (json['distanceKm'] as num).toDouble(),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}
