import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/api/okada_api_client.dart';
import '../models/tracking_data.dart';
import '../services/tracking_websocket_service.dart';

/// State class for Order Tracking
class OrderTrackingState {
  final bool isLoading;
  final TrackingData? trackingData;
  final String? error;
  final bool isWebSocketConnected;
  final String? compensationMessage;

  const OrderTrackingState({
    this.isLoading = false,
    this.trackingData,
    this.error,
    this.isWebSocketConnected = false,
    this.compensationMessage,
  });

  OrderTrackingState copyWith({
    bool? isLoading,
    TrackingData? trackingData,
    String? error,
    bool? isWebSocketConnected,
    String? compensationMessage,
  }) {
    return OrderTrackingState(
      isLoading: isLoading ?? this.isLoading,
      trackingData: trackingData ?? this.trackingData,
      error: error,
      isWebSocketConnected: isWebSocketConnected ?? this.isWebSocketConnected,
      compensationMessage: compensationMessage,
    );
  }

  bool get hasError => error != null;
  bool get hasData => trackingData != null;
  bool get isDelayed => trackingData?.isDelayed ?? false;
}

/// Notifier for managing order tracking state
class OrderTrackingNotifier extends StateNotifier<OrderTrackingState> {
  final OkadaApiClient apiClient;
  final String orderId;
  TrackingWebSocketService? _wsService;

  OrderTrackingNotifier({
    required this.apiClient,
    required this.orderId,
  }) : super(const OrderTrackingState(isLoading: true)) {
    _initialize();
  }

  /// Initialize tracking by fetching data and connecting to WebSocket
  Future<void> _initialize() async {
    try {
      // Fetch initial tracking data from API
      await fetchTrackingData();

      // Connect to WebSocket for real-time updates
      _connectWebSocket();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to initialize tracking: $e',
      );
    }
  }

  /// Fetch tracking data from API
  Future<void> fetchTrackingData() async {
    try {
      state = state.copyWith(isLoading: true, error: null);

      final response = await apiClient.get('/orders/$orderId/tracking');
      final trackingData = TrackingData.fromJson(response.data as Map<String, dynamic>);

      state = state.copyWith(
        isLoading: false,
        trackingData: trackingData,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to fetch tracking data: $e',
      );
      rethrow;
    }
  }

  /// Connect to WebSocket for real-time updates
  void _connectWebSocket() {
    _wsService = TrackingWebSocketService(
      orderId: orderId,
      onLocationUpdate: _handleLocationUpdate,
      onDelayNotification: _handleDelayNotification,
      onCompensationApplied: _handleCompensationApplied,
      onError: _handleWebSocketError,
      onConnected: _handleWebSocketConnected,
      onDisconnected: _handleWebSocketDisconnected,
    );

    _wsService!.connect();
  }

  /// Handle real-time location updates from WebSocket
  void _handleLocationUpdate(Location newLocation) {
    if (state.trackingData == null) return;

    final updatedRider = state.trackingData!.rider.copyWith(
      currentLocation: newLocation,
    );

    final updatedTrackingData = state.trackingData!.copyWith(
      rider: updatedRider,
    );

    state = state.copyWith(trackingData: updatedTrackingData);
  }

  /// Handle delay notifications from WebSocket
  void _handleDelayNotification(DateTime newEta, String reason) {
    if (state.trackingData == null) return;

    final updatedTrackingData = state.trackingData!.copyWith(
      status: OrderStatus.delayed,
      newEstimatedAt: newEta,
      delayReason: reason,
    );

    state = state.copyWith(trackingData: updatedTrackingData);
  }

  /// Handle compensation applied event from WebSocket
  void _handleCompensationApplied(double amount) {
    state = state.copyWith(
      compensationMessage: 'We\'re sorry for the delay. ${amount.toStringAsFixed(0)} FCFA credit has been added to your account.',
    );

    // Clear compensation message after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        state = state.copyWith(compensationMessage: null);
      }
    });
  }

  /// Handle WebSocket errors
  void _handleWebSocketError(String error) {
    print('WebSocket error: $error');
    // Don't update state.error here to avoid disrupting the UI
    // Just log it for debugging
  }

  /// Handle WebSocket connection established
  void _handleWebSocketConnected() {
    state = state.copyWith(isWebSocketConnected: true);
  }

  /// Handle WebSocket disconnection
  void _handleWebSocketDisconnected() {
    state = state.copyWith(isWebSocketConnected: false);
  }

  /// Manually update rider location (for testing or fallback polling)
  void updateRiderLocation(Location location) {
    _handleLocationUpdate(location);
  }

  /// Refresh tracking data (pull to refresh)
  Future<void> refresh() async {
    await fetchTrackingData();
  }

  /// Cancel order
  Future<void> cancelOrder(String reason) async {
    try {
      await apiClient.post('/orders/$orderId/cancel', data: {
        'reason': reason,
      });

      // Refresh tracking data to get updated status
      await fetchTrackingData();
    } catch (e) {
      state = state.copyWith(error: 'Failed to cancel order: $e');
      rethrow;
    }
  }

  /// Contact support
  Future<void> contactSupport(String message) async {
    try {
      await apiClient.post('/support/tickets', data: {
        'orderId': orderId,
        'message': message,
      });
    } catch (e) {
      state = state.copyWith(error: 'Failed to contact support: $e');
      rethrow;
    }
  }

  @override
  void dispose() {
    _wsService?.disconnect();
    super.dispose();
  }
}

/// Provider for order tracking
final orderTrackingProvider = StateNotifierProvider.family<
    OrderTrackingNotifier,
    OrderTrackingState,
    String>(
  (ref, orderId) {
    final apiClient = ref.watch(apiClientProvider);
    return OrderTrackingNotifier(
      apiClient: apiClient,
      orderId: orderId,
    );
  },
);

/// Provider for API client (should already exist in your codebase)
final apiClientProvider = Provider<OkadaApiClient>((ref) {
  // TODO: Replace with actual API client initialization
  return OkadaApiClient();
});

