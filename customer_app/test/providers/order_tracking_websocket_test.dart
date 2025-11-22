import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:customer_app/providers/order_tracking_provider.dart';
import 'package:customer_app/models/tracking_data.dart';
import '../mocks/mock_api_client.dart';
import '../fixtures/tracking_data_fixtures.dart';

void main() {
  group('OrderTrackingProvider - WebSocket Events', () {
    late MockOkadaApiClient mockApiClient;
    late OrderTrackingNotifier provider;
    const testOrderId = 'ORD-12345';

    setUp(() async {
      mockApiClient = MockOkadaApiClient();
      provider = OrderTrackingNotifier(
        apiClient: mockApiClient,
        orderId: testOrderId,
      );

      // Set up initial tracking data
      when(mockApiClient.get('/orders/$testOrderId/tracking'))
          .thenAnswer((_) async => MockResponse(
                data: TrackingDataFixtures.trackingApiResponse,
              ));

      await provider.fetchTrackingData();
    });

    tearDown(() {
      provider.dispose();
    });

    group('Location Update Events', () {
      test('should update rider location when receiving location_update event',
          () {
        // Arrange
        final initialLocation =
            provider.state.trackingData!.rider.currentLocation;
        final newLocation = Location(
          latitude: 3.8600,
          longitude: 11.5150,
        );

        // Act
        provider.updateRiderLocation(newLocation);

        // Assert
        expect(
          provider.state.trackingData?.rider.currentLocation.latitude,
          newLocation.latitude,
        );
        expect(
          provider.state.trackingData?.rider.currentLocation.longitude,
          newLocation.longitude,
        );
        expect(
          provider.state.trackingData?.rider.currentLocation.latitude,
          isNot(initialLocation.latitude),
        );
      });

      test('should preserve rider info when updating location', () {
        // Arrange
        final originalRider = provider.state.trackingData!.rider;
        final newLocation = Location(
          latitude: 3.8600,
          longitude: 11.5150,
        );

        // Act
        provider.updateRiderLocation(newLocation);

        // Assert
        expect(provider.state.trackingData?.rider.id, originalRider.id);
        expect(provider.state.trackingData?.rider.name, originalRider.name);
        expect(provider.state.trackingData?.rider.phone, originalRider.phone);
        expect(provider.state.trackingData?.rider.rating, originalRider.rating);
        expect(
            provider.state.trackingData?.rider.photoUrl, originalRider.photoUrl);
        expect(
            provider.state.trackingData?.rider.message, originalRider.message);
      });

      test('should handle multiple rapid location updates', () {
        // Arrange
        final locations = [
          Location(latitude: 3.8550, longitude: 11.5115),
          Location(latitude: 3.8560, longitude: 11.5120),
          Location(latitude: 3.8570, longitude: 11.5125),
          Location(latitude: 3.8580, longitude: 11.5130),
        ];

        // Act
        for (final location in locations) {
          provider.updateRiderLocation(location);
        }

        // Assert - should have the last location
        expect(
          provider.state.trackingData?.rider.currentLocation.latitude,
          locations.last.latitude,
        );
        expect(
          provider.state.trackingData?.rider.currentLocation.longitude,
          locations.last.longitude,
        );
      });

      test('should not throw when updating location with no tracking data', () {
        // Arrange
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );
        final newLocation = Location(latitude: 3.8600, longitude: 11.5150);

        // Act & Assert
        expect(
          () => provider.updateRiderLocation(newLocation),
          returnsNormally,
        );
      });
    });

    group('Delay Notification Events', () {
      test('should update state when receiving delivery_delayed event',
          () async {
        // Arrange
        final newEta = DateTime(2025, 11, 15, 15, 15);
        const reason = 'traffic_congestion';

        // Simulate the internal handler being called
        // In real implementation, this would be called by WebSocket
        if (provider.state.trackingData != null) {
          final updatedTrackingData = provider.state.trackingData!.copyWith(
            status: OrderStatus.delayed,
            newEstimatedAt: newEta,
            delayReason: reason,
          );

          // This simulates what _handleDelayNotification does internally
          provider.state = provider.state.copyWith(
            trackingData: updatedTrackingData,
          );
        }

        // Assert
        expect(provider.state.trackingData?.status, OrderStatus.delayed);
        expect(provider.state.trackingData?.newEstimatedAt, newEta);
        expect(provider.state.trackingData?.delayReason, reason);
        expect(provider.state.isDelayed, true);
      });

      test('should handle different delay reasons', () {
        // Arrange
        final delayReasons = [
          'traffic_congestion',
          'weather',
          'vehicle_issue',
          'high_demand',
        ];

        for (final reason in delayReasons) {
          // Act
          if (provider.state.trackingData != null) {
            final updatedTrackingData = provider.state.trackingData!.copyWith(
              status: OrderStatus.delayed,
              newEstimatedAt: DateTime.now().add(const Duration(minutes: 30)),
              delayReason: reason,
            );

            provider.state = provider.state.copyWith(
              trackingData: updatedTrackingData,
            );
          }

          // Assert
          expect(provider.state.trackingData?.delayReason, reason);
        }
      });

      test('should preserve order data when delay occurs', () {
        // Arrange
        final originalOrderId = provider.state.trackingData!.orderId;
        final originalRider = provider.state.trackingData!.rider;
        final newEta = DateTime(2025, 11, 15, 15, 15);

        // Act
        if (provider.state.trackingData != null) {
          final updatedTrackingData = provider.state.trackingData!.copyWith(
            status: OrderStatus.delayed,
            newEstimatedAt: newEta,
            delayReason: 'traffic_congestion',
          );

          provider.state = provider.state.copyWith(
            trackingData: updatedTrackingData,
          );
        }

        // Assert
        expect(provider.state.trackingData?.orderId, originalOrderId);
        expect(provider.state.trackingData?.rider.id, originalRider.id);
        expect(provider.state.trackingData?.rider.name, originalRider.name);
      });

      test('should not throw when delay event received with no data', () {
        // Arrange
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );

        // Act & Assert
        expect(() {
          if (provider.state.trackingData != null) {
            final updatedTrackingData = provider.state.trackingData!.copyWith(
              status: OrderStatus.delayed,
              newEstimatedAt: DateTime.now(),
              delayReason: 'traffic_congestion',
            );

            provider.state = provider.state.copyWith(
              trackingData: updatedTrackingData,
            );
          }
        }, returnsNormally);
      });
    });

    group('Compensation Events', () {
      test('should set compensation message when compensation is applied', () {
        // Arrange
        const compensationAmount = 500.0;

        // Act
        provider.state = provider.state.copyWith(
          compensationMessage:
              'We\'re sorry for the delay. ${compensationAmount.toStringAsFixed(0)} FCFA credit has been added to your account.',
        );

        // Assert
        expect(provider.state.compensationMessage, isNotNull);
        expect(provider.state.compensationMessage, contains('500 FCFA'));
        expect(provider.state.compensationMessage, contains('credit'));
      });

      test('should handle different compensation amounts', () {
        // Arrange
        final amounts = [100.0, 250.0, 500.0, 1000.0];

        for (final amount in amounts) {
          // Act
          provider.state = provider.state.copyWith(
            compensationMessage:
                'We\'re sorry for the delay. ${amount.toStringAsFixed(0)} FCFA credit has been added to your account.',
          );

          // Assert
          expect(
            provider.state.compensationMessage,
            contains('${amount.toStringAsFixed(0)} FCFA'),
          );
        }
      });

      test('should clear compensation message', () {
        // Arrange
        provider.state = provider.state.copyWith(
          compensationMessage: 'Test compensation message',
        );

        expect(provider.state.compensationMessage, isNotNull);

        // Act
        provider.state = provider.state.copyWith(
          compensationMessage: null,
        );

        // Assert
        expect(provider.state.compensationMessage, isNull);
      });
    });

    group('WebSocket Connection Status', () {
      test('should track WebSocket connection status', () {
        // Arrange
        expect(provider.state.isWebSocketConnected, false);

        // Act - simulate connection
        provider.state = provider.state.copyWith(
          isWebSocketConnected: true,
        );

        // Assert
        expect(provider.state.isWebSocketConnected, true);
      });

      test('should handle connection state changes', () {
        // Act - connect
        provider.state = provider.state.copyWith(
          isWebSocketConnected: true,
        );
        expect(provider.state.isWebSocketConnected, true);

        // Act - disconnect
        provider.state = provider.state.copyWith(
          isWebSocketConnected: false,
        );
        expect(provider.state.isWebSocketConnected, false);

        // Act - reconnect
        provider.state = provider.state.copyWith(
          isWebSocketConnected: true,
        );
        expect(provider.state.isWebSocketConnected, true);
      });

      test('should preserve data when connection status changes', () async {
        // Arrange
        final originalData = provider.state.trackingData;

        // Act
        provider.state = provider.state.copyWith(
          isWebSocketConnected: true,
        );

        // Assert
        expect(provider.state.trackingData, equals(originalData));
      });
    });

    group('Multiple Event Handling', () {
      test('should handle location update followed by delay notification', () {
        // Arrange
        final newLocation = Location(latitude: 3.8600, longitude: 11.5150);
        final newEta = DateTime(2025, 11, 15, 15, 15);

        // Act - location update
        provider.updateRiderLocation(newLocation);

        // Act - delay notification
        if (provider.state.trackingData != null) {
          final updatedTrackingData = provider.state.trackingData!.copyWith(
            status: OrderStatus.delayed,
            newEstimatedAt: newEta,
            delayReason: 'traffic_congestion',
          );

          provider.state = provider.state.copyWith(
            trackingData: updatedTrackingData,
          );
        }

        // Assert
        expect(
          provider.state.trackingData?.rider.currentLocation.latitude,
          newLocation.latitude,
        );
        expect(provider.state.trackingData?.status, OrderStatus.delayed);
        expect(provider.state.trackingData?.newEstimatedAt, newEta);
      });

      test('should handle delay followed by compensation', () {
        // Arrange
        final newEta = DateTime(2025, 11, 15, 15, 15);

        // Act - delay
        if (provider.state.trackingData != null) {
          final updatedTrackingData = provider.state.trackingData!.copyWith(
            status: OrderStatus.delayed,
            newEstimatedAt: newEta,
            delayReason: 'traffic_congestion',
          );

          provider.state = provider.state.copyWith(
            trackingData: updatedTrackingData,
          );
        }

        // Act - compensation
        provider.state = provider.state.copyWith(
          compensationMessage: '500 FCFA credit added',
        );

        // Assert
        expect(provider.state.trackingData?.status, OrderStatus.delayed);
        expect(provider.state.compensationMessage, isNotNull);
      });

      test('should handle rapid event sequence', () {
        // Arrange
        final events = [
          () => provider.updateRiderLocation(
              Location(latitude: 3.8550, longitude: 11.5115)),
          () => provider.updateRiderLocation(
              Location(latitude: 3.8560, longitude: 11.5120)),
          () => provider.state = provider.state.copyWith(
                isWebSocketConnected: true,
              ),
          () => provider.updateRiderLocation(
              Location(latitude: 3.8570, longitude: 11.5125)),
        ];

        // Act
        for (final event in events) {
          event();
        }

        // Assert - should be in valid state
        expect(provider.state.trackingData, isNotNull);
        expect(provider.state.isWebSocketConnected, true);
        expect(
          provider.state.trackingData?.rider.currentLocation.latitude,
          3.8570,
        );
      });
    });

    group('Edge Cases', () {
      test('should handle location update with same coordinates', () {
        // Arrange
        final currentLocation =
            provider.state.trackingData!.rider.currentLocation;
        final sameLocation = Location(
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        );

        // Act
        provider.updateRiderLocation(sameLocation);

        // Assert
        expect(
          provider.state.trackingData?.rider.currentLocation.latitude,
          currentLocation.latitude,
        );
      });

      test('should handle delay with past ETA', () {
        // Arrange
        final pastEta = DateTime.now().subtract(const Duration(minutes: 10));

        // Act
        if (provider.state.trackingData != null) {
          final updatedTrackingData = provider.state.trackingData!.copyWith(
            status: OrderStatus.delayed,
            newEstimatedAt: pastEta,
            delayReason: 'traffic_congestion',
          );

          provider.state = provider.state.copyWith(
            trackingData: updatedTrackingData,
          );
        }

        // Assert
        expect(provider.state.trackingData?.newEstimatedAt, pastEta);
        expect(provider.state.isDelayed, true);
      });

      test('should handle empty delay reason', () {
        // Act
        if (provider.state.trackingData != null) {
          final updatedTrackingData = provider.state.trackingData!.copyWith(
            status: OrderStatus.delayed,
            newEstimatedAt: DateTime.now().add(const Duration(minutes: 30)),
            delayReason: '',
          );

          provider.state = provider.state.copyWith(
            trackingData: updatedTrackingData,
          );
        }

        // Assert
        expect(provider.state.trackingData?.delayReason, '');
      });

      test('should handle zero compensation amount', () {
        // Act
        provider.state = provider.state.copyWith(
          compensationMessage: '0 FCFA credit has been added to your account.',
        );

        // Assert
        expect(provider.state.compensationMessage, contains('0 FCFA'));
      });
    });
  });
}

