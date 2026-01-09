import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import '../constants/app_constants.dart';
import '../errors/exceptions.dart';
import 'network_info.dart';

enum WebSocketConnectionState {
  disconnected,
  connecting,
  connected,
  reconnecting,
  error,
}

class WebSocketMessage {
  final String type;
  final Map<String, dynamic> data;
  final String? id;
  final DateTime timestamp;

  WebSocketMessage({
    required this.type,
    required this.data,
    this.id,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  factory WebSocketMessage.fromJson(Map<String, dynamic> json) {
    return WebSocketMessage(
      type: json['type'] ?? '',
      data: json['data'] ?? {},
      id: json['id'],
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'data': data,
      'id': id,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class WebSocketClient {
  final NetworkInfo _networkInfo;
  final String _baseUrl;
  String? _authToken;

  WebSocketChannel? _channel;
  StreamSubscription? _messageSubscription;
  StreamSubscription? _networkSubscription;
  Timer? _reconnectTimer;
  Timer? _heartbeatTimer;

  WebSocketConnectionState _connectionState = WebSocketConnectionState.disconnected;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 5);
  static const Duration _heartbeatInterval = Duration(seconds: 30);

  final StreamController<WebSocketConnectionState> _stateController =
      StreamController<WebSocketConnectionState>.broadcast();
  final StreamController<WebSocketMessage> _messageController =
      StreamController<WebSocketMessage>.broadcast();
  final StreamController<AppException> _errorController =
      StreamController<AppException>.broadcast();

  WebSocketClient(this._networkInfo, {String? baseUrl})
      : _baseUrl = baseUrl ?? AppConstants.wsBaseUrl {
    _listenToNetworkChanges();
  }

  // Getters
  WebSocketConnectionState get connectionState => _connectionState;
  Stream<WebSocketConnectionState> get onConnectionStateChanged => _stateController.stream;
  Stream<WebSocketMessage> get onMessage => _messageController.stream;
  Stream<AppException> get onError => _errorController.stream;
  bool get isConnected => _connectionState == WebSocketConnectionState.connected;

  void _listenToNetworkChanges() {
    _networkSubscription = _networkInfo.onConnectivityChanged.listen(
      (isConnected) {
        if (isConnected && _connectionState == WebSocketConnectionState.disconnected) {
          // Network back online, try to reconnect
          connect();
        } else if (!isConnected && _connectionState == WebSocketConnectionState.connected) {
          // Network lost, disconnect gracefully
          _updateConnectionState(WebSocketConnectionState.disconnected);
        }
      },
    );
  }

  Future<void> connect({String? authToken}) async {
    if (_connectionState == WebSocketConnectionState.connected ||
        _connectionState == WebSocketConnectionState.connecting) {
      return;
    }

    _authToken = authToken ?? _authToken;

    if (!await _networkInfo.isConnected) {
      _handleError(const NetworkException('No internet connection'));
      return;
    }

    _updateConnectionState(WebSocketConnectionState.connecting);
    _cancelReconnectTimer();

    try {
      final uri = Uri.parse('$_baseUrl/ws');
      final headers = <String, dynamic>{
        'User-Agent': 'OkadaCustomer/1.0.0',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

      _channel = WebSocketChannel.connect(uri, headers: headers);

      await _channel!.ready;

      _updateConnectionState(WebSocketConnectionState.connected);
      _reconnectAttempts = 0;

      _listenToMessages();
      _startHeartbeat();

      // Send connection acknowledgment
      send(WebSocketMessage(
        type: 'connection',
        data: {'action': 'connected', 'timestamp': DateTime.now().toIso8601String()},
      ));

    } catch (e) {
      _handleError(NetworkException('WebSocket connection failed: $e'));
      _scheduleReconnect();
    }
  }

  void _listenToMessages() {
    _messageSubscription = _channel!.stream.listen(
      (data) {
        try {
          final jsonData = jsonDecode(data as String) as Map<String, dynamic>;
          final message = WebSocketMessage.fromJson(jsonData);

          if (message.type == 'pong') {
            // Handle pong response for heartbeat
            return;
          }

          _messageController.add(message);
        } catch (e) {
          _handleError(NetworkException('Failed to parse WebSocket message: $e'));
        }
      },
      onError: (error) {
        _handleError(NetworkException('WebSocket stream error: $error'));
        _scheduleReconnect();
      },
      onDone: () {
        if (_connectionState == WebSocketConnectionState.connected) {
          _updateConnectionState(WebSocketConnectionState.disconnected);
          _scheduleReconnect();
        }
      },
    );
  }

  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(_heartbeatInterval, (timer) {
      if (_connectionState == WebSocketConnectionState.connected) {
        send(WebSocketMessage(
          type: 'ping',
          data: {'timestamp': DateTime.now().toIso8601String()},
        ));
      }
    });
  }

  void send(WebSocketMessage message) {
    if (_connectionState != WebSocketConnectionState.connected || _channel == null) {
      _handleError(const NetworkException('WebSocket not connected'));
      return;
    }

    try {
      final jsonString = jsonEncode(message.toJson());
      _channel!.sink.add(jsonString);
    } catch (e) {
      _handleError(NetworkException('Failed to send WebSocket message: $e'));
    }
  }

  void sendOrderTracking(String orderId) {
    send(WebSocketMessage(
      type: 'track_order',
      data: {'orderId': orderId},
      id: 'track_$orderId',
    ));
  }

  void subscribeToOrderUpdates(String orderId) {
    send(WebSocketMessage(
      type: 'subscribe',
      data: {'channel': 'order_updates', 'orderId': orderId},
      id: 'sub_order_$orderId',
    ));
  }

  void unsubscribeFromOrderUpdates(String orderId) {
    send(WebSocketMessage(
      type: 'unsubscribe',
      data: {'channel': 'order_updates', 'orderId': orderId},
      id: 'unsub_order_$orderId',
    ));
  }

  void subscribeToDeliveryTracking(String orderId) {
    send(WebSocketMessage(
      type: 'subscribe',
      data: {'channel': 'delivery_tracking', 'orderId': orderId},
      id: 'sub_delivery_$orderId',
    ));
  }

  void unsubscribeFromDeliveryTracking(String orderId) {
    send(WebSocketMessage(
      type: 'unsubscribe',
      data: {'channel': 'delivery_tracking', 'orderId': orderId},
      id: 'unsub_delivery_$orderId',
    ));
  }

  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      _updateConnectionState(WebSocketConnectionState.error);
      _handleError(const NetworkException('Max reconnection attempts reached'));
      return;
    }

    _reconnectAttempts++;
    _updateConnectionState(WebSocketConnectionState.reconnecting);

    final delay = Duration(
      seconds: _reconnectDelay.inSeconds * _reconnectAttempts,
    );

    _reconnectTimer = Timer(delay, () {
      connect();
    });
  }

  void _cancelReconnectTimer() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
  }

  void _updateConnectionState(WebSocketConnectionState newState) {
    if (_connectionState != newState) {
      _connectionState = newState;
      _stateController.add(newState);
    }
  }

  void _handleError(AppException error) {
    _errorController.add(error);
  }

  Future<void> disconnect() async {
    _cancelReconnectTimer();
    _heartbeatTimer?.cancel();
    _messageSubscription?.cancel();

    if (_channel != null) {
      try {
        // Send disconnect message
        send(WebSocketMessage(
          type: 'connection',
          data: {'action': 'disconnect', 'timestamp': DateTime.now().toIso8601String()},
        ));

        await _channel!.sink.close(status.goingAway);
      } catch (e) {
        // Ignore errors during disconnect
      }
      _channel = null;
    }

    _updateConnectionState(WebSocketConnectionState.disconnected);
    _reconnectAttempts = 0;
  }

  void setAuthToken(String? token) {
    _authToken = token;

    // If connected, reconnect with new token
    if (_connectionState == WebSocketConnectionState.connected) {
      disconnect().then((_) => connect());
    }
  }

  void dispose() {
    disconnect();
    _networkSubscription?.cancel();
    _stateController.close();
    _messageController.close();
    _errorController.close();
  }
}

// WebSocket message types
class WebSocketMessageType {
  static const String connection = 'connection';
  static const String ping = 'ping';
  static const String pong = 'pong';
  static const String subscribe = 'subscribe';
  static const String unsubscribe = 'unsubscribe';
  static const String trackOrder = 'track_order';
  static const String orderUpdate = 'order_update';
  static const String deliveryUpdate = 'delivery_update';
  static const String riderLocation = 'rider_location';
  static const String notification = 'notification';
  static const String error = 'error';
}

// WebSocket channels
class WebSocketChannel {
  static const String orderUpdates = 'order_updates';
  static const String deliveryTracking = 'delivery_tracking';
  static const String notifications = 'notifications';
  static const String chat = 'chat';
}