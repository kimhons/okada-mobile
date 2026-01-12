import 'dart:async';
import 'dart:convert';
import 'package:logger/logger.dart';

/// WebSocket event types
enum WebSocketEventType {
  orderStatusUpdate,
  riderLocationUpdate,
  newMessage,
  newOrder,
  orderAssigned,
  notification,
  connected,
  disconnected,
  error,
}

/// WebSocket event
class WebSocketEvent {
  final WebSocketEventType type;
  final Map<String, dynamic>? data;
  final DateTime timestamp;

  WebSocketEvent({
    required this.type,
    this.data,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  factory WebSocketEvent.fromJson(Map<String, dynamic> json) {
    final typeString = json['type'] as String;
    final type = WebSocketEventType.values.firstWhere(
      (e) => e.name == typeString,
      orElse: () => WebSocketEventType.notification,
    );
    return WebSocketEvent(
      type: type,
      data: json['data'] as Map<String, dynamic>?,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type.name,
        'data': data,
        'timestamp': timestamp.toIso8601String(),
      };
}

/// WebSocket connection state
enum WebSocketConnectionState {
  disconnected,
  connecting,
  connected,
  reconnecting,
}

/// WebSocket service for real-time communication
class WebSocketService {
  static WebSocketService? _instance;
  
  final Logger _logger = Logger();
  final String _baseUrl;
  final String? _authToken;
  
  // WebSocket channel (using web_socket_channel package)
  dynamic _channel;
  
  // Connection state
  WebSocketConnectionState _connectionState = WebSocketConnectionState.disconnected;
  WebSocketConnectionState get connectionState => _connectionState;
  
  // Stream controllers for events
  final _eventController = StreamController<WebSocketEvent>.broadcast();
  Stream<WebSocketEvent> get events => _eventController.stream;
  
  // Specific event streams
  Stream<WebSocketEvent> get orderStatusUpdates => events.where(
        (e) => e.type == WebSocketEventType.orderStatusUpdate,
      );
  
  Stream<WebSocketEvent> get riderLocationUpdates => events.where(
        (e) => e.type == WebSocketEventType.riderLocationUpdate,
      );
  
  Stream<WebSocketEvent> get messages => events.where(
        (e) => e.type == WebSocketEventType.newMessage,
      );
  
  Stream<WebSocketEvent> get newOrders => events.where(
        (e) => e.type == WebSocketEventType.newOrder,
      );
  
  Stream<WebSocketEvent> get notifications => events.where(
        (e) => e.type == WebSocketEventType.notification,
      );
  
  // Reconnection
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 3);
  
  // Heartbeat
  Timer? _heartbeatTimer;
  static const Duration _heartbeatInterval = Duration(seconds: 30);
  
  // Subscriptions
  final Set<String> _subscriptions = {};
  
  WebSocketService._({
    required String baseUrl,
    String? authToken,
  })  : _baseUrl = baseUrl.replaceFirst('http', 'ws'),
        _authToken = authToken;
  
  /// Get singleton instance
  static WebSocketService getInstance({
    required String baseUrl,
    String? authToken,
  }) {
    _instance ??= WebSocketService._(baseUrl: baseUrl, authToken: authToken);
    return _instance!;
  }
  
  /// Update auth token
  void updateAuthToken(String? token) {
    // Reconnect with new token if connected
    if (_connectionState == WebSocketConnectionState.connected) {
      disconnect();
      connect();
    }
  }
  
  /// Connect to WebSocket server
  Future<void> connect() async {
    if (_connectionState == WebSocketConnectionState.connected ||
        _connectionState == WebSocketConnectionState.connecting) {
      return;
    }
    
    _connectionState = WebSocketConnectionState.connecting;
    _logger.d('WebSocket connecting to $_baseUrl');
    
    try {
      // Build WebSocket URL with auth token
      final uri = Uri.parse('$_baseUrl/ws');
      final wsUrl = uri.replace(
        queryParameters: {
          if (_authToken != null) 'token': _authToken!,
        },
      );
      
      // Note: In actual implementation, use web_socket_channel package
      // _channel = WebSocketChannel.connect(wsUrl);
      
      // Simulate connection for now
      await Future.delayed(const Duration(milliseconds: 500));
      
      _connectionState = WebSocketConnectionState.connected;
      _reconnectAttempts = 0;
      _startHeartbeat();
      
      _eventController.add(WebSocketEvent(
        type: WebSocketEventType.connected,
      ));
      
      _logger.i('WebSocket connected');
      
      // Resubscribe to previous subscriptions
      for (final subscription in _subscriptions) {
        _sendSubscription(subscription);
      }
      
      // Listen for messages
      // _channel.stream.listen(
      //   _handleMessage,
      //   onError: _handleError,
      //   onDone: _handleDisconnect,
      // );
    } catch (e) {
      _logger.e('WebSocket connection failed', error: e);
      _connectionState = WebSocketConnectionState.disconnected;
      _scheduleReconnect();
    }
  }
  
  /// Disconnect from WebSocket server
  void disconnect() {
    _stopHeartbeat();
    _reconnectTimer?.cancel();
    _channel?.sink?.close();
    _channel = null;
    _connectionState = WebSocketConnectionState.disconnected;
    
    _eventController.add(WebSocketEvent(
      type: WebSocketEventType.disconnected,
    ));
    
    _logger.i('WebSocket disconnected');
  }
  
  /// Subscribe to order updates
  void subscribeToOrder(int orderId) {
    final subscription = 'order:$orderId';
    _subscriptions.add(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _sendSubscription(subscription);
    }
  }
  
  /// Unsubscribe from order updates
  void unsubscribeFromOrder(int orderId) {
    final subscription = 'order:$orderId';
    _subscriptions.remove(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _sendUnsubscription(subscription);
    }
  }
  
  /// Subscribe to rider location updates
  void subscribeToRiderLocation(int riderId) {
    final subscription = 'rider:$riderId';
    _subscriptions.add(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _sendSubscription(subscription);
    }
  }
  
  /// Unsubscribe from rider location updates
  void unsubscribeFromRiderLocation(int riderId) {
    final subscription = 'rider:$riderId';
    _subscriptions.remove(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _sendUnsubscription(subscription);
    }
  }
  
  /// Subscribe to chat messages for an order
  void subscribeToChat(int orderId) {
    final subscription = 'chat:$orderId';
    _subscriptions.add(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _sendSubscription(subscription);
    }
  }
  
  /// Unsubscribe from chat messages
  void unsubscribeFromChat(int orderId) {
    final subscription = 'chat:$orderId';
    _subscriptions.remove(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _sendUnsubscription(subscription);
    }
  }
  
  /// Subscribe to new orders (for riders)
  void subscribeToNewOrders({double? latitude, double? longitude}) {
    final subscription = 'new_orders';
    _subscriptions.add(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _send({
        'action': 'subscribe',
        'channel': subscription,
        'data': {
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
        },
      });
    }
  }
  
  /// Unsubscribe from new orders
  void unsubscribeFromNewOrders() {
    final subscription = 'new_orders';
    _subscriptions.remove(subscription);
    if (_connectionState == WebSocketConnectionState.connected) {
      _sendUnsubscription(subscription);
    }
  }
  
  /// Send rider location update
  void sendRiderLocation({
    required double latitude,
    required double longitude,
    double? heading,
    double? speed,
    int? orderId,
  }) {
    if (_connectionState != WebSocketConnectionState.connected) return;
    
    _send({
      'action': 'location_update',
      'data': {
        'latitude': latitude,
        'longitude': longitude,
        if (heading != null) 'heading': heading,
        if (speed != null) 'speed': speed,
        if (orderId != null) 'orderId': orderId,
      },
    });
  }
  
  /// Send chat message
  void sendChatMessage({
    required int orderId,
    required String message,
    String? imageUrl,
  }) {
    if (_connectionState != WebSocketConnectionState.connected) return;
    
    _send({
      'action': 'send_message',
      'data': {
        'orderId': orderId,
        'message': message,
        if (imageUrl != null) 'imageUrl': imageUrl,
      },
    });
  }
  
  /// Send typing indicator
  void sendTypingIndicator(int orderId, bool isTyping) {
    if (_connectionState != WebSocketConnectionState.connected) return;
    
    _send({
      'action': 'typing',
      'data': {
        'orderId': orderId,
        'isTyping': isTyping,
      },
    });
  }
  
  // Private methods
  
  void _send(Map<String, dynamic> data) {
    if (_channel == null) return;
    final message = jsonEncode(data);
    // _channel.sink.add(message);
    _logger.d('WebSocket sent: $message');
  }
  
  void _sendSubscription(String subscription) {
    _send({
      'action': 'subscribe',
      'channel': subscription,
    });
  }
  
  void _sendUnsubscription(String subscription) {
    _send({
      'action': 'unsubscribe',
      'channel': subscription,
    });
  }
  
  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message as String) as Map<String, dynamic>;
      final event = WebSocketEvent.fromJson(data);
      _eventController.add(event);
      _logger.d('WebSocket received: ${event.type}');
    } catch (e) {
      _logger.e('WebSocket message parse error', error: e);
    }
  }
  
  void _handleError(dynamic error) {
    _logger.e('WebSocket error', error: error);
    _eventController.add(WebSocketEvent(
      type: WebSocketEventType.error,
      data: {'error': error.toString()},
    ));
  }
  
  void _handleDisconnect() {
    _connectionState = WebSocketConnectionState.disconnected;
    _stopHeartbeat();
    
    _eventController.add(WebSocketEvent(
      type: WebSocketEventType.disconnected,
    ));
    
    _logger.w('WebSocket disconnected unexpectedly');
    _scheduleReconnect();
  }
  
  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      _logger.e('WebSocket max reconnect attempts reached');
      return;
    }
    
    _connectionState = WebSocketConnectionState.reconnecting;
    _reconnectAttempts++;
    
    final delay = _reconnectDelay * _reconnectAttempts;
    _logger.d('WebSocket reconnecting in ${delay.inSeconds}s (attempt $_reconnectAttempts)');
    
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(delay, connect);
  }
  
  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(_heartbeatInterval, (_) {
      if (_connectionState == WebSocketConnectionState.connected) {
        _send({'action': 'ping'});
      }
    });
  }
  
  void _stopHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
  }
  
  /// Dispose resources
  void dispose() {
    disconnect();
    _eventController.close();
    _instance = null;
  }
}
