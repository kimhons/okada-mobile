import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import '../models/tracking_data.dart';

/// Service for managing WebSocket connection for real-time order tracking
class TrackingWebSocketService {
  WebSocketChannel? _channel;
  final String orderId;
  final Function(Location location) onLocationUpdate;
  final Function(DateTime newEta, String reason) onDelayNotification;
  final Function(double amount) onCompensationApplied;
  final Function(String error) onError;
  final Function() onConnected;
  final Function() onDisconnected;

  bool _isConnected = false;
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _reconnectDelay = Duration(seconds: 3);

  TrackingWebSocketService({
    required this.orderId,
    required this.onLocationUpdate,
    required this.onDelayNotification,
    required this.onCompensationApplied,
    required this.onError,
    required this.onConnected,
    required this.onDisconnected,
  });

  /// Connect to the WebSocket server
  void connect() {
    if (_isConnected) {
      return;
    }

    try {
      // TODO: Replace with actual WebSocket URL from environment config
      final wsUrl = 'wss://api.okada.cm/v1/tracking/$orderId';
      
      _channel = WebSocketChannel.connect(
        Uri.parse(wsUrl),
      );

      _isConnected = true;
      _reconnectAttempts = 0;
      onConnected();

      _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnection,
        cancelOnError: false,
      );
    } catch (e) {
      _handleError(e);
    }
  }

  /// Handle incoming WebSocket messages
  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message as String) as Map<String, dynamic>;
      final event = data['event'] as String;
      final payload = data['data'] as Map<String, dynamic>;

      switch (event) {
        case 'location_update':
          _handleLocationUpdate(payload);
          break;
        case 'delivery_delayed':
          _handleDelayNotification(payload);
          break;
        case 'compensation_applied':
          _handleCompensationApplied(payload);
          break;
        case 'status_changed':
          // Handle status changes if needed
          break;
        default:
          print('Unknown WebSocket event: $event');
      }
    } catch (e) {
      onError('Failed to parse WebSocket message: $e');
    }
  }

  /// Handle location update event
  void _handleLocationUpdate(Map<String, dynamic> payload) {
    try {
      final location = Location(
        latitude: (payload['latitude'] as num).toDouble(),
        longitude: (payload['longitude'] as num).toDouble(),
      );
      onLocationUpdate(location);
    } catch (e) {
      onError('Failed to parse location update: $e');
    }
  }

  /// Handle delay notification event
  void _handleDelayNotification(Map<String, dynamic> payload) {
    try {
      final newEta = DateTime.parse(payload['newEstimatedAt'] as String);
      final reason = payload['reason'] as String? ?? 'unknown';
      onDelayNotification(newEta, reason);
    } catch (e) {
      onError('Failed to parse delay notification: $e');
    }
  }

  /// Handle compensation applied event
  void _handleCompensationApplied(Map<String, dynamic> payload) {
    try {
      final amount = (payload['amount'] as num).toDouble();
      onCompensationApplied(amount);
    } catch (e) {
      onError('Failed to parse compensation: $e');
    }
  }

  /// Handle WebSocket errors
  void _handleError(dynamic error) {
    onError('WebSocket error: $error');
    _attemptReconnect();
  }

  /// Handle WebSocket disconnection
  void _handleDisconnection() {
    _isConnected = false;
    onDisconnected();
    _attemptReconnect();
  }

  /// Attempt to reconnect with exponential backoff
  void _attemptReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      onError('Max reconnection attempts reached. Please refresh the page.');
      return;
    }

    _reconnectAttempts++;
    final delay = _reconnectDelay * _reconnectAttempts;

    print('Attempting to reconnect in ${delay.inSeconds} seconds... (Attempt $_reconnectAttempts/$_maxReconnectAttempts)');

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(delay, () {
      connect();
    });
  }

  /// Send a message to the WebSocket server
  void send(Map<String, dynamic> message) {
    if (!_isConnected || _channel == null) {
      onError('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      _channel!.sink.add(jsonEncode(message));
    } catch (e) {
      onError('Failed to send message: $e');
    }
  }

  /// Disconnect from the WebSocket server
  void disconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _reconnectAttempts = 0;
    
    if (_channel != null) {
      _channel!.sink.close(status.goingAway);
      _channel = null;
    }
    
    _isConnected = false;
  }

  /// Check if WebSocket is connected
  bool get isConnected => _isConnected;
}

