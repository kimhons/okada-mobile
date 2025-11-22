import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:customer_app/providers/order_tracking_provider.dart';
import 'package:customer_app/models/tracking_data.dart';
import '../mocks/mock_api_client.dart';
import '../fixtures/tracking_data_fixtures.dart';

void main() {
  group('OrderTrackingProvider', () {
    late MockOkadaApiClient mockApiClient;
    late OrderTrackingNotifier provider;
    const testOrderId = 'ORD-12345';

    setUp(() {
      mockApiClient = MockOkadaApiClient();
    });

    tearDown(() {
      provider.dispose();
    });

    group('Initialization', () {
      test('initial state should be loading', () {
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );

        expect(provider.state.isLoading, true);
        expect(provider.state.trackingData, isNull);
        expect(provider.state.error, isNull);
        expect(provider.state.isWebSocketConnected, false);
      });

      test('should fetch tracking data on initialization', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        // Act
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );

        // Wait for async initialization
        await Future.delayed(const Duration(milliseconds: 100));

        // Assert
        verify(mockApiClient.get('/orders/$testOrderId/tracking')).called(1);
        expect(provider.state.isLoading, false);
        expect(provider.state.trackingData, isNotNull);
        expect(provider.state.trackingData?.orderId, testOrderId);
        expect(provider.state.error, isNull);
      });

      test('should handle initialization error', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenThrow(Exception('Network error'));

        // Act
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );

        // Wait for async initialization
        await Future.delayed(const Duration(milliseconds: 100));

        // Assert
        expect(provider.state.isLoading, false);
        expect(provider.state.trackingData, isNull);
        expect(provider.state.error, contains('Failed to initialize tracking'));
      });
    });

    group('fetchTrackingData', () {
      setUp(() {
        // Skip initialization by not calling the constructor
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );
      });

      test('should fetch and parse tracking data successfully', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        // Act
        await provider.fetchTrackingData();

        // Assert
        expect(provider.state.isLoading, false);
        expect(provider.state.trackingData, isNotNull);
        expect(provider.state.trackingData?.orderId, testOrderId);
        expect(provider.state.trackingData?.status, OrderStatus.inTransit);
        expect(provider.state.trackingData?.rider.name, 'Daniel Okoro');
        expect(provider.state.error, isNull);
      });

      test('should set loading state while fetching', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async {
          await Future.delayed(const Duration(milliseconds: 50));
          return MockResponse(
            data: TrackingDataFixtures.trackingApiResponse,
          );
        });

        // Act
        final fetchFuture = provider.fetchTrackingData();

        // Assert - should be loading immediately
        expect(provider.state.isLoading, true);

        await fetchFuture;

        // Assert - should not be loading after completion
        expect(provider.state.isLoading, false);
      });

      test('should handle API error', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenThrow(Exception('API error'));

        // Act & Assert
        expect(
          () => provider.fetchTrackingData(),
          throwsException,
        );

        expect(provider.state.isLoading, false);
        expect(provider.state.error, contains('Failed to fetch tracking data'));
      });

      test('should parse delayed order data correctly', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.delayedApiResponse,
                ));

        // Act
        await provider.fetchTrackingData();

        // Assert
        expect(provider.state.trackingData?.status, OrderStatus.delayed);
        expect(provider.state.trackingData?.isDelayed, true);
        expect(provider.state.trackingData?.newEstimatedAt, isNotNull);
        expect(provider.state.trackingData?.delayReason, 'traffic_congestion');
      });
    });

    group('updateRiderLocation', () {
      setUp(() async {
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );

        // Set up initial data
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        await provider.fetchTrackingData();
      });

      test('should update rider location in state', () {
        // Arrange
        final newLocation = TrackingDataFixtures.updatedRiderLocation;
        final oldLocation = provider.state.trackingData!.rider.currentLocation;

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
          isNot(oldLocation.latitude),
        );
      });

      test('should preserve other rider data when updating location', () {
        // Arrange
        final newLocation = TrackingDataFixtures.updatedRiderLocation;
        final originalRider = provider.state.trackingData!.rider;

        // Act
        provider.updateRiderLocation(newLocation);

        // Assert
        expect(provider.state.trackingData?.rider.id, originalRider.id);
        expect(provider.state.trackingData?.rider.name, originalRider.name);
        expect(provider.state.trackingData?.rider.phone, originalRider.phone);
        expect(provider.state.trackingData?.rider.rating, originalRider.rating);
      });

      test('should handle location update when no data exists', () {
        // Arrange
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );
        final newLocation = TrackingDataFixtures.updatedRiderLocation;

        // Act & Assert - should not throw
        expect(
          () => provider.updateRiderLocation(newLocation),
          returnsNormally,
        );
      });
    });

    group('refresh', () {
      setUp(() {
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );
      });

      test('should refetch tracking data', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        // Act
        await provider.refresh();

        // Assert
        verify(mockApiClient.get('/orders/$testOrderId/tracking')).called(1);
        expect(provider.state.trackingData, isNotNull);
      });

      test('should update state with new data on refresh', () async {
        // Arrange - first fetch
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        await provider.fetchTrackingData();
        final firstStatus = provider.state.trackingData?.status;

        // Arrange - second fetch with updated data
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.delayedApiResponse,
                ));

        // Act
        await provider.refresh();

        // Assert
        expect(provider.state.trackingData?.status, isNot(firstStatus));
        expect(provider.state.trackingData?.status, OrderStatus.delayed);
      });
    });

    group('cancelOrder', () {
      setUp(() async {
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );

        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        await provider.fetchTrackingData();
      });

      test('should call cancel API endpoint', () async {
        // Arrange
        const reason = 'Customer cancelled due to delay';
        when(mockApiClient.post(
          '/orders/$testOrderId/cancel',
          data: anyNamed('data'),
        )).thenAnswer((_) async => MockResponse(data: {'success': true}));

        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: {
                    ...TrackingDataFixtures.trackingApiResponse,
                    'status': 'cancelled',
                  },
                ));

        // Act
        await provider.cancelOrder(reason);

        // Assert
        verify(mockApiClient.post(
          '/orders/$testOrderId/cancel',
          data: {'reason': reason},
        )).called(1);
      });

      test('should refresh tracking data after cancellation', () async {
        // Arrange
        when(mockApiClient.post(
          '/orders/$testOrderId/cancel',
          data: anyNamed('data'),
        )).thenAnswer((_) async => MockResponse(data: {'success': true}));

        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: {
                    ...TrackingDataFixtures.trackingApiResponse,
                    'status': 'cancelled',
                  },
                ));

        // Act
        await provider.cancelOrder('Customer request');

        // Assert
        verify(mockApiClient.get('/orders/$testOrderId/tracking')).called(1);
        expect(provider.state.trackingData?.status, OrderStatus.cancelled);
      });

      test('should handle cancellation error', () async {
        // Arrange
        when(mockApiClient.post(
          '/orders/$testOrderId/cancel',
          data: anyNamed('data'),
        )).thenThrow(Exception('Cancellation failed'));

        // Act & Assert
        expect(
          () => provider.cancelOrder('Test reason'),
          throwsException,
        );

        expect(provider.state.error, contains('Failed to cancel order'));
      });
    });

    group('contactSupport', () {
      setUp(() {
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );
      });

      test('should call support API endpoint', () async {
        // Arrange
        const message = 'Need help with my order';
        when(mockApiClient.post(
          '/support/tickets',
          data: anyNamed('data'),
        )).thenAnswer((_) async => MockResponse(data: {'ticketId': '123'}));

        // Act
        await provider.contactSupport(message);

        // Assert
        verify(mockApiClient.post(
          '/support/tickets',
          data: {
            'orderId': testOrderId,
            'message': message,
          },
        )).called(1);
      });

      test('should handle support contact error', () async {
        // Arrange
        when(mockApiClient.post(
          '/support/tickets',
          data: anyNamed('data'),
        )).thenThrow(Exception('Support unavailable'));

        // Act & Assert
        expect(
          () => provider.contactSupport('Help'),
          throwsException,
        );

        expect(provider.state.error, contains('Failed to contact support'));
      });
    });

    group('State Management', () {
      setUp(() {
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );
      });

      test('state should be immutable', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        await provider.fetchTrackingData();

        // Act
        final state1 = provider.state;
        provider.updateRiderLocation(
          TrackingDataFixtures.updatedRiderLocation,
        );
        final state2 = provider.state;

        // Assert
        expect(state1, isNot(same(state2)));
        expect(
          state1.trackingData?.rider.currentLocation.latitude,
          isNot(state2.trackingData?.rider.currentLocation.latitude),
        );
      });

      test('copyWith should preserve unmodified fields', () {
        // Arrange
        const initialState = OrderTrackingState(
          isLoading: false,
          isWebSocketConnected: true,
        );

        // Act
        final newState = initialState.copyWith(isLoading: true);

        // Assert
        expect(newState.isLoading, true);
        expect(newState.isWebSocketConnected, true);
      });

      test('hasError should return true when error exists', () {
        // Arrange
        final stateWithError = const OrderTrackingState(
          error: 'Test error',
        );

        final stateWithoutError = const OrderTrackingState();

        // Assert
        expect(stateWithError.hasError, true);
        expect(stateWithoutError.hasError, false);
      });

      test('hasData should return true when tracking data exists', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        // Act
        await provider.fetchTrackingData();

        // Assert
        expect(provider.state.hasData, true);
      });

      test('isDelayed should return true for delayed orders', () async {
        // Arrange
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.delayedApiResponse,
                ));

        // Act
        await provider.fetchTrackingData();

        // Assert
        expect(provider.state.isDelayed, true);
      });
    });

    group('Error Handling', () {
      setUp(() {
        provider = OrderTrackingNotifier(
          apiClient: mockApiClient,
          orderId: testOrderId,
        );
      });

      test('should clear previous error on successful fetch', () async {
        // Arrange - first fetch fails
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenThrow(Exception('Network error'));

        try {
          await provider.fetchTrackingData();
        } catch (_) {}

        expect(provider.state.error, isNotNull);

        // Arrange - second fetch succeeds
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        // Act
        await provider.fetchTrackingData();

        // Assert
        expect(provider.state.error, isNull);
      });

      test('should preserve data when error occurs', () async {
        // Arrange - first fetch succeeds
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenAnswer((_) async => MockResponse(
                  data: TrackingDataFixtures.trackingApiResponse,
                ));

        await provider.fetchTrackingData();
        final originalData = provider.state.trackingData;

        // Arrange - second fetch fails
        when(mockApiClient.get('/orders/$testOrderId/tracking'))
            .thenThrow(Exception('Network error'));

        // Act
        try {
          await provider.fetchTrackingData();
        } catch (_) {}

        // Assert - data should still be there
        expect(provider.state.trackingData, equals(originalData));
        expect(provider.state.error, isNotNull);
      });
    });
  });
}

