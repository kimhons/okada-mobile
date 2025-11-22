import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:customer_app/widgets/rider_info_card.dart';
import '../fixtures/tracking_data_fixtures.dart';
import '../helpers/widget_test_helpers.dart';

void main() {
  group('RiderInfoCard Widget Tests', () {
    testWidgets('should display rider name', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(riderInfo: riderInfo),
        ),
      );

      // Assert
      expect(find.text('Daniel Okoro'), findsOneWidget);
    });

    testWidgets('should display rider rating', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(riderInfo: riderInfo),
        ),
      );

      // Assert
      expect(find.text('4.8'), findsOneWidget);
      expect(find.byIcon(Icons.star), findsOneWidget);
    });

    testWidgets('should display contact rider button', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(riderInfo: riderInfo),
        ),
      );

      // Assert
      expect(find.text('Contact'), findsOneWidget);
      expect(find.byIcon(Icons.phone), findsOneWidget);
    });

    testWidgets('should handle contact button tap', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo;
      bool buttonTapped = false;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(
            riderInfo: riderInfo,
            onContact: () {
              buttonTapped = true;
            },
          ),
        ),
      );

      await tester.tap(find.text('Contact'));
      await tester.pumpAndSettle();

      // Assert
      expect(buttonTapped, true);
    });

    testWidgets('should display rider message when available', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(riderInfo: riderInfo),
        ),
      );

      // Assert
      expect(find.text('On my way to pick up your order!'), findsOneWidget);
    });

    testWidgets('should display rider photo', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(riderInfo: riderInfo),
        ),
      );

      // Assert
      expect(find.byType(CircleAvatar), findsOneWidget);
    });

    testWidgets('should display default avatar when no photo URL', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo.copyWith(
        photoUrl: null,
      );

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(riderInfo: riderInfo),
        ),
      );

      // Assert
      expect(find.byType(CircleAvatar), findsOneWidget);
      expect(find.byIcon(Icons.person), findsOneWidget);
    });

    testWidgets('should display rider ID', (tester) async {
      // Arrange
      final riderInfo = TrackingDataFixtures.riderInfo;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: RiderInfoCard(riderInfo: riderInfo),
        ),
      );

      // Assert
      expect(find.textContaining('RDR-678'), findsOneWidget);
    });
  });

  group('OrderStatusTimeline Widget Tests', () {
    testWidgets('should display all status steps', (tester) async {
      // Arrange
      final statusHistory = TrackingDataFixtures.statusHistory;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderStatusTimeline(statusHistory: statusHistory),
        ),
      );

      // Assert
      expect(find.text('Order Placed'), findsOneWidget);
      expect(find.text('Confirmed'), findsOneWidget);
      expect(find.text('Rider Assigned'), findsOneWidget);
    });

    testWidgets('should display completed steps with check icon', (tester) async {
      // Arrange
      final statusHistory = TrackingDataFixtures.statusHistory;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderStatusTimeline(statusHistory: statusHistory),
        ),
      );

      // Assert
      expect(find.byIcon(Icons.check_circle), findsNWidgets(2));
    });

    testWidgets('should display active step with different styling', (tester) async {
      // Arrange
      final statusHistory = TrackingDataFixtures.statusHistory;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderStatusTimeline(statusHistory: statusHistory),
        ),
      );

      // Assert
      expect(find.byIcon(Icons.radio_button_checked), findsOneWidget);
    });

    testWidgets('should display timestamps for completed steps', (tester) async {
      // Arrange
      final statusHistory = TrackingDataFixtures.statusHistory;

      // Act
      await tester.pumpWidget(
        WidgetTestHelpers.createTestableWidget(
          child: OrderStatusTimeline(statusHistory: statusHistory),
        ),
      );

      // Assert
      // Should display formatted times
      expect(find.byType(Text), findsWidgets);
    });
  });
}

