import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:customer_app/widgets/order_tracking_map.dart';
import 'package:customer_app/models/tracking_data.dart';
import '../fixtures/tracking_data_fixtures.dart';
import '../helpers/widget_test_helpers.dart';

void main() {
  group('OrderTrackingMap - Real-time Location Updates', () {
    const testOrderId = 'ORD-12345';

    testWidgets('should display Google Maps widget', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert
      expect(find.byType(GoogleMap), findsOneWidget);
    });

    testWidgets('should display map control buttons', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert
      // Center on rider button
      expect(find.byIcon(Icons.my_location), findsOneWidget);
      // Fit all markers button
      expect(find.byIcon(Icons.zoom_out_map), findsOneWidget);
    });

    testWidgets('should display ETA indicator for arriving soon orders', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.arrivingSoonTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert
      expect(find.textContaining('Arriving in'), findsOneWidget);
      expect(find.byIcon(Icons.access_time), findsOneWidget);
    });

    testWidgets('should not display ETA indicator for in-transit orders', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert
      expect(find.textContaining('Arriving in'), findsNothing);
    });

    testWidgets('should handle center on rider button tap', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Find and tap center button
      final centerButton = find.byIcon(Icons.my_location);
      expect(centerButton, findsOneWidget);

      await tester.tap(centerButton);
      await tester.pumpAndSettle();

      // Assert - button should be tappable
      expect(centerButton, findsOneWidget);
    });

    testWidgets('should handle fit all markers button tap', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Find and tap fit all button
      final fitAllButton = find.byIcon(Icons.zoom_out_map);
      expect(fitAllButton, findsOneWidget);

      await tester.tap(fitAllButton);
      await tester.pumpAndSettle();

      // Assert - button should be tappable
      expect(fitAllButton, findsOneWidget);
    });

    testWidgets('should update map when rider location changes', (tester) async {
      // Arrange
      final initialData = TrackingDataFixtures.inTransitTrackingData;

      // Act - initial render
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: initialData,
          ),
        ),
      );

      expect(find.byType(GoogleMap), findsOneWidget);

      // Act - update with new location
      final updatedData = initialData.copyWith(
        rider: initialData.rider.copyWith(
          currentLocation: TrackingDataFixtures.updatedRiderLocation,
        ),
      );

      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: updatedData,
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Assert - map should still be present with updated data
      expect(find.byType(GoogleMap), findsOneWidget);
    });

    testWidgets('should display map controls in correct position', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert - controls should be in a Positioned widget
      expect(find.byType(Positioned), findsWidgets);
      expect(find.byType(FloatingActionButton), findsNWidgets(2));
    });

    testWidgets('should display ETA with correct formatting', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.arrivingSoonTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert - should show minutes
      expect(find.textContaining('min'), findsOneWidget);
    });

    testWidgets('should render map with correct initial camera position', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert
      final googleMap = tester.widget<GoogleMap>(find.byType(GoogleMap));
      expect(googleMap.initialCameraPosition, isNotNull);
      expect(googleMap.initialCameraPosition.zoom, 14);
    });

    testWidgets('should have correct map configuration', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert
      final googleMap = tester.widget<GoogleMap>(find.byType(GoogleMap));
      expect(googleMap.myLocationEnabled, false);
      expect(googleMap.myLocationButtonEnabled, false);
      expect(googleMap.zoomControlsEnabled, false);
      expect(googleMap.mapToolbarEnabled, false);
      expect(googleMap.compassEnabled, true);
    });

    testWidgets('should display control buttons with correct styling', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert
      final fabButtons = tester.widgetList<FloatingActionButton>(
        find.byType(FloatingActionButton),
      );

      expect(fabButtons.length, 2);
      for (final fab in fabButtons) {
        expect(fab.mini, true);
        expect(fab.backgroundColor, Colors.white);
      }
    });

    testWidgets('should display ETA indicator with green background', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.arrivingSoonTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Assert - ETA container should have green background
      final container = tester.widget<Container>(
        find.ancestor(
          of: find.textContaining('Arriving in'),
          matching: find.byType(Container),
        ).first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, const Color(0xFF2D8659));
    });

    testWidgets('should handle rapid location updates without errors', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act - render initial
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderTrackingMap(
            orderId: testOrderId,
            trackingData: trackingData,
          ),
        ),
      );

      // Simulate rapid updates
      for (int i = 0; i < 5; i++) {
        final updatedData = trackingData.copyWith(
          rider: trackingData.rider.copyWith(
            currentLocation: Location(
              latitude: 3.8550 + (i * 0.001),
              longitude: 11.5115 + (i * 0.001),
            ),
          ),
        );

        await tester.pumpWidget(
          WidgetTestHelpers.createTestableWidget(
            child: OrderTrackingMap(
              orderId: testOrderId,
              trackingData: updatedData,
            ),
          ),
        );

        await tester.pump();
      }

      // Assert - should not throw errors
      expect(find.byType(GoogleMap), findsOneWidget);
    });
  });
}

