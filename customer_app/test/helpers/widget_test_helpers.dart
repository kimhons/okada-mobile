import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/providers/order_tracking_provider.dart';
import 'package:customer_app/models/tracking_data.dart';

/// Helper class for widget testing
class WidgetTestHelpers {
  /// Create a testable widget with Riverpod provider scope
  static Widget createTestableWidget({
    required Widget child,
    List<Override>? overrides,
  }) {
    return ProviderScope(
      overrides: overrides ?? [],
      child: MaterialApp(
        home: child,
      ),
    );
  }

  /// Create a provider override for order tracking
  static Override createOrderTrackingOverride({
    required String orderId,
    required OrderTrackingState state,
  }) {
    return orderTrackingProvider(orderId).overrideWith(
      (ref) => MockOrderTrackingNotifier(state),
    );
  }

  /// Find a widget by its key
  static Finder findByKey(String key) {
    return find.byKey(Key(key));
  }

  /// Find a widget by its text
  static Finder findByText(String text) {
    return find.text(text);
  }

  /// Find a widget by its icon
  static Finder findByIcon(IconData icon) {
    return find.byIcon(icon);
  }

  /// Pump and settle with a custom duration
  static Future<void> pumpAndSettle(
    WidgetTester tester, {
    Duration duration = const Duration(milliseconds: 500),
  }) async {
    await tester.pumpAndSettle(duration);
  }

  /// Scroll a widget
  static Future<void> scroll(
    WidgetTester tester,
    Finder finder, {
    double offset = -300.0,
  }) async {
    await tester.drag(finder, Offset(0, offset));
    await tester.pumpAndSettle();
  }

  /// Tap a widget and wait for animations
  static Future<void> tapAndSettle(
    WidgetTester tester,
    Finder finder,
  ) async {
    await tester.tap(finder);
    await tester.pumpAndSettle();
  }

  /// Long press a widget and wait for animations
  static Future<void> longPressAndSettle(
    WidgetTester tester,
    Finder finder,
  ) async {
    await tester.longPress(finder);
    await tester.pumpAndSettle();
  }

  /// Verify a widget is visible on screen
  static void expectVisible(Finder finder) {
    expect(finder, findsOneWidget);
  }

  /// Verify a widget is not visible on screen
  static void expectNotVisible(Finder finder) {
    expect(finder, findsNothing);
  }

  /// Verify multiple widgets are visible
  static void expectMultiple(Finder finder, int count) {
    expect(finder, findsNWidgets(count));
  }

  /// Create a mock tracking state
  static OrderTrackingState createMockState({
    bool isLoading = false,
    TrackingData? trackingData,
    String? error,
    bool isWebSocketConnected = false,
    String? compensationMessage,
  }) {
    return OrderTrackingState(
      isLoading: isLoading,
      trackingData: trackingData,
      error: error,
      isWebSocketConnected: isWebSocketConnected,
      compensationMessage: compensationMessage,
    );
  }
}

/// Mock notifier for testing
class MockOrderTrackingNotifier extends OrderTrackingNotifier {
  final OrderTrackingState mockState;

  MockOrderTrackingNotifier(this.mockState)
      : super(
          apiClient: _MockApiClient(),
          orderId: 'TEST-123',
        ) {
    state = mockState;
  }

  @override
  Future<void> fetchTrackingData() async {
    // No-op for testing
  }

  @override
  void updateRiderLocation(Location location) {
    // No-op for testing
  }

  @override
  Future<void> refresh() async {
    // No-op for testing
  }

  @override
  Future<void> cancelOrder(String reason) async {
    // No-op for testing
  }

  @override
  Future<void> contactSupport(String message) async {
    // No-op for testing
  }
}

/// Mock API client for testing
class _MockApiClient {
  dynamic get(String path) async {
    return null;
  }

  dynamic post(String path, {dynamic data}) async {
    return null;
  }
}

/// Extension for common test operations
extension WidgetTesterExtensions on WidgetTester {
  /// Find a widget by type
  Finder findWidgetByType<T>() {
    return find.byType(T);
  }

  /// Verify text exists
  void expectText(String text) {
    expect(find.text(text), findsOneWidget);
  }

  /// Verify text does not exist
  void expectNoText(String text) {
    expect(find.text(text), findsNothing);
  }

  /// Verify icon exists
  void expectIcon(IconData icon) {
    expect(find.byIcon(icon), findsOneWidget);
  }

  /// Tap by text
  Future<void> tapText(String text) async {
    await tap(find.text(text));
    await pumpAndSettle();
  }

  /// Tap by icon
  Future<void> tapIcon(IconData icon) async {
    await tap(find.byIcon(icon));
    await pumpAndSettle();
  }

  /// Enter text in a field
  Future<void> enterTextInField(Finder finder, String text) async {
    await enterText(finder, text);
    await pumpAndSettle();
  }

  /// Scroll to bottom
  Future<void> scrollToBottom(Finder scrollable) async {
    await dragUntilVisible(
      find.text('bottom'),
      scrollable,
      const Offset(0, -100),
    );
  }
}

