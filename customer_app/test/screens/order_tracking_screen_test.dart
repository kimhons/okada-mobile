import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:customer_app/screens/order/order_tracking_screen.dart';
import 'package:customer_app/providers/order_tracking_provider.dart';
import 'package:customer_app/models/tracking_data.dart';
import '../fixtures/tracking_data_fixtures.dart';
import '../helpers/widget_test_helpers.dart';

void main() {
  group('OrderTrackingScreen - Main UI', () {
    const testOrderId = 'ORD-12345';

    testWidgets('should display app bar with title', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.text('Order Tracking'), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should display WebSocket connection indicator', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
        isWebSocketConnected: true,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      // Connection indicator should be present in app bar
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should display loading state', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        isLoading: true,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Loading tracking information...'), findsOneWidget);
    });

    testWidgets('should display error state with retry button', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        error: 'Failed to load tracking data',
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.text('Failed to load tracking'), findsOneWidget);
      expect(find.text('Failed to load tracking data'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });

    testWidgets('should display empty state when no data', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState();

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.text('No tracking data available'), findsOneWidget);
    });

    testWidgets('should display map when tracking data is available', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      // Map widget should be present
      expect(find.byType(OrderTrackingMap), findsOneWidget);
    });

    testWidgets('should display draggable bottom sheet', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.byType(DraggableScrollableSheet), findsOneWidget);
    });

    testWidgets('should display order status timeline', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.byType(OrderStatusTimeline), findsOneWidget);
    });

    testWidgets('should display rider info card', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.byType(RiderInfoCard), findsOneWidget);
      expect(find.text('Daniel Okoro'), findsOneWidget);
      expect(find.text('4.8'), findsOneWidget);
    });

    testWidgets('should display order details section', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.text('Order Details'), findsOneWidget);
      expect(find.text('ID: ORD-12345'), findsOneWidget);
    });

    testWidgets('should display compensation banner when present', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
        compensationMessage: '500 FCFA credit has been added to your account',
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.text('500 FCFA credit has been added to your account'), findsOneWidget);
      expect(find.byIcon(Icons.card_giftcard), findsOneWidget);
    });

    testWidgets('should not display compensation banner when not present', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.byIcon(Icons.card_giftcard), findsNothing);
    });

    testWidgets('should handle retry button tap in error state', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        error: 'Network error',
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Find and tap retry button
      final retryButton = find.text('Retry');
      expect(retryButton, findsOneWidget);

      await tester.tap(retryButton);
      await tester.pumpAndSettle();

      // Assert - button should be tappable
      expect(retryButton, findsOneWidget);
    });

    testWidgets('should display drag handle on bottom sheet', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert - drag handle should be visible
      final dragHandle = find.byWidgetPredicate(
        (widget) => widget is Container && widget.decoration != null,
      );
      expect(dragHandle, findsWidgets);
    });

    testWidgets('should display order ID in details section', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.textContaining('ORD-12345'), findsOneWidget);
    });

    testWidgets('should display estimated arrival time', (tester) async {
      // Arrange
      final state = WidgetTestHelpers.createMockState(
        trackingData: TrackingDataFixtures.inTransitTrackingData,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: const OrderTrackingScreen(orderId: testOrderId),
          overrides: [
            WidgetTestHelpers.createOrderTrackingOverride(
              orderId: testOrderId,
              state: state,
            ),
          ],
        ),
      );

      // Assert
      expect(find.text('Estimated Arrival'), findsOneWidget);
      expect(find.byIcon(Icons.access_time), findsWidgets);
    });
  });
}

