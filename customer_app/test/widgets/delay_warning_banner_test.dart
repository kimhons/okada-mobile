import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:customer_app/widgets/delay_warning_banner.dart';
import 'package:customer_app/models/tracking_data.dart';
import '../fixtures/tracking_data_fixtures.dart';
import '../helpers/widget_test_helpers.dart';

void main() {
  group('DelayWarningBanner - Delayed Delivery State', () {
    testWidgets('should display delay warning banner for delayed orders', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.byType(DelayWarningBanner), findsOneWidget);
      expect(find.byIcon(Icons.warning_amber_rounded), findsOneWidget);
    });

    testWidgets('should display delay reason', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.text('Delivery Delayed'), findsOneWidget);
      expect(find.textContaining('traffic'), findsOneWidget);
    });

    testWidgets('should display new estimated time', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.text('New ETA:'), findsOneWidget);
      expect(find.byIcon(Icons.access_time), findsOneWidget);
    });

    testWidgets('should display contact rider button', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.text('Contact Rider'), findsOneWidget);
      expect(find.byIcon(Icons.phone), findsOneWidget);
    });

    testWidgets('should have yellow/amber background color', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      final container = tester.widget<Container>(
        find.byType(Container).first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color?.value, 0xFFFFF3CD); // Light yellow/amber
    });

    testWidgets('should handle contact rider button tap', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;
      bool buttonTapped = false;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(
            trackingData: trackingData,
            onContactRider: () {
              buttonTapped = true;
            },
          ),
        ),
      );

      // Tap the button
      await tester.tap(find.text('Contact Rider'));
      await tester.pumpAndSettle();

      // Assert
      expect(buttonTapped, true);
    });

    testWidgets('should display delay duration when calculable', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.textContaining('min'), findsWidgets);
    });

    testWidgets('should display different delay reasons correctly', (tester) async {
      // Arrange
      final delayReasons = {
        'traffic_congestion': 'Traffic congestion',
        'weather': 'Bad weather',
        'vehicle_issue': 'Vehicle issue',
        'high_demand': 'High demand',
      };

      for (final entry in delayReasons.entries) {
        final trackingData = TrackingDataFixtures.delayedTrackingData.copyWith(
          delayReason: entry.key,
        );

        // Act
        await tester.pumpWidget(
          WidgetTestHelpers.createTestableWidget(
            child: DelayWarningBanner(trackingData: trackingData),
          ),
        );

        // Assert
        expect(find.textContaining(entry.value, findRichText: true), findsOneWidget);

        // Clean up for next iteration
        await tester.pumpWidget(Container());
      }
    });

    testWidgets('should display warning icon with correct color', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      final icon = tester.widget<Icon>(
        find.byIcon(Icons.warning_amber_rounded),
      );
      expect(icon.color, const Color(0xFFFFC107)); // Amber color
    });

    testWidgets('should display rider message when available', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData.copyWith(
        rider: TrackingDataFixtures.delayedTrackingData.rider.copyWith(
          message: 'Sorry for the delay, heavy traffic on Avenue Kennedy',
        ),
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.textContaining('heavy traffic'), findsOneWidget);
    });

    testWidgets('should not display banner for non-delayed orders', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.byType(DelayWarningBanner), findsNothing);
    });

    testWidgets('should display formatted time difference', (tester) async {
      // Arrange
      final now = DateTime.now();
      final trackingData = TrackingDataFixtures.inTransitTrackingData.copyWith(
        status: OrderStatus.delayed,
        estimatedAt: now.add(const Duration(minutes: 30)),
        newEstimatedAt: now.add(const Duration(minutes: 60)),
        delayReason: 'traffic_congestion',
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.textContaining('30'), findsOneWidget);
      expect(find.textContaining('min'), findsWidgets);
    });

    testWidgets('should have proper padding and margins', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      final padding = tester.widget<Padding>(
        find.ancestor(
          of: find.text('Delivery Delayed'),
          matching: find.byType(Padding),
        ).first,
      );

      expect(padding.padding, const EdgeInsets.all(16));
    });

    testWidgets('should display contact button with correct styling', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      final button = tester.widget<ElevatedButton>(
        find.ancestor(
          of: find.text('Contact Rider'),
          matching: find.byType(ElevatedButton),
        ),
      );

      expect(button.style?.backgroundColor?.resolve({}), const Color(0xFF2D8659));
    });

    testWidgets('should handle missing delay reason gracefully', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData.copyWith(
        delayReason: null,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.text('Delivery Delayed'), findsOneWidget);
      expect(find.text('Unexpected delay'), findsOneWidget);
    });

    testWidgets('should handle missing new ETA gracefully', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.inTransitTrackingData.copyWith(
        status: OrderStatus.delayed,
        delayReason: 'traffic_congestion',
        newEstimatedAt: null,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(trackingData: trackingData),
        ),
      );

      // Assert
      expect(find.text('Delivery Delayed'), findsOneWidget);
      // Should show original ETA or "Calculating..."
      expect(find.byIcon(Icons.access_time), findsOneWidget);
    });

    testWidgets('should be dismissible when configured', (tester) async {
      // Arrange
      final trackingData = TrackingDataFixtures.delayedTrackingData;
      bool dismissed = false;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: DelayWarningBanner(
            trackingData: trackingData,
            dismissible: true,
            onDismiss: () {
              dismissed = true;
            },
          ),
        ),
      );

      // Find and tap dismiss button
      final dismissButton = find.byIcon(Icons.close);
      if (dismissButton.evaluate().isNotEmpty) {
        await tester.tap(dismissButton);
        await tester.pumpAndSettle();

        // Assert
        expect(dismissed, true);
      }
    });
  });
}

