import 'package:customer_app/models/tracking_data.dart';

/// Test fixtures for tracking data
class TrackingDataFixtures {
  /// Sample pickup location in Yaoundé
  static final pickupLocation = Location(
    latitude: 3.8480,
    longitude: 11.5021,
    address: 'Market Fresh Store, Yaoundé',
  );

  /// Sample delivery location in Yaoundé
  static final deliveryLocation = Location(
    latitude: 3.8699,
    longitude: 11.5213,
    address: '123 Avenue Kennedy, Yaoundé',
  );

  /// Sample rider current location
  static final riderLocation = Location(
    latitude: 3.8550,
    longitude: 11.5115,
  );

  /// Sample rider information
  static final riderInfo = RiderInfo(
    id: 'RDR-678',
    name: 'Daniel Okoro',
    phone: '+237670123456',
    rating: 4.8,
    photoUrl: 'https://example.com/rider.jpg',
    currentLocation: riderLocation,
    message: 'On my way to pick up your order!',
  );

  /// Sample order status steps
  static final statusHistory = [
    OrderStatusStep(
      title: 'Order Placed',
      status: OrderStepStatus.completed,
      timestamp: DateTime(2025, 11, 15, 13, 0),
    ),
    OrderStatusStep(
      title: 'Confirmed',
      status: OrderStepStatus.completed,
      timestamp: DateTime(2025, 11, 15, 13, 5),
    ),
    OrderStatusStep(
      title: 'Rider Assigned',
      status: OrderStepStatus.active,
      timestamp: DateTime(2025, 11, 15, 13, 10),
    ),
  ];

  /// Complete tracking data for in-transit order
  static final inTransitTrackingData = TrackingData(
    orderId: 'ORD-12345',
    status: OrderStatus.inTransit,
    estimatedAt: DateTime(2025, 11, 15, 14, 30),
    pickupLocation: pickupLocation,
    deliveryLocation: deliveryLocation,
    rider: riderInfo,
    statusHistory: statusHistory,
  );

  /// Tracking data for delayed order
  static final delayedTrackingData = TrackingData(
    orderId: 'ORD-12345',
    status: OrderStatus.delayed,
    estimatedAt: DateTime(2025, 11, 15, 14, 30),
    newEstimatedAt: DateTime(2025, 11, 15, 15, 15),
    delayReason: 'traffic_congestion',
    pickupLocation: pickupLocation,
    deliveryLocation: deliveryLocation,
    rider: riderInfo,
    statusHistory: statusHistory,
  );

  /// Tracking data for arriving soon order
  static final arrivingSoonTrackingData = TrackingData(
    orderId: 'ORD-12345',
    status: OrderStatus.arrivingSoon,
    estimatedAt: DateTime.now().add(const Duration(minutes: 3)),
    pickupLocation: pickupLocation,
    deliveryLocation: deliveryLocation,
    rider: riderInfo,
    statusHistory: statusHistory,
  );

  /// Tracking data for delivered order
  static final deliveredTrackingData = TrackingData(
    orderId: 'ORD-12345',
    status: OrderStatus.delivered,
    estimatedAt: DateTime(2025, 11, 15, 14, 30),
    pickupLocation: pickupLocation,
    deliveryLocation: deliveryLocation,
    rider: riderInfo,
    statusHistory: [
      ...statusHistory,
      OrderStatusStep(
        title: 'Delivered',
        status: OrderStepStatus.completed,
        timestamp: DateTime(2025, 11, 15, 14, 25),
      ),
    ],
  );

  /// JSON response for tracking API
  static final trackingApiResponse = {
    'orderId': 'ORD-12345',
    'status': 'in_transit',
    'estimatedAt': '2025-11-15T14:30:00Z',
    'newEstimatedAt': null,
    'delayReason': null,
    'pickupLocation': {
      'latitude': 3.8480,
      'longitude': 11.5021,
      'address': 'Market Fresh Store, Yaoundé',
    },
    'deliveryLocation': {
      'latitude': 3.8699,
      'longitude': 11.5213,
      'address': '123 Avenue Kennedy, Yaoundé',
    },
    'rider': {
      'id': 'RDR-678',
      'name': 'Daniel Okoro',
      'phone': '+237670123456',
      'rating': 4.8,
      'photoUrl': 'https://example.com/rider.jpg',
      'currentLocation': {
        'latitude': 3.8550,
        'longitude': 11.5115,
      },
      'message': 'On my way to pick up your order!',
    },
    'statusHistory': [],
  };

  /// JSON response for delayed order
  static final delayedApiResponse = {
    ...trackingApiResponse,
    'status': 'delayed',
    'newEstimatedAt': '2025-11-15T15:15:00Z',
    'delayReason': 'traffic_congestion',
  };

  /// Updated rider location
  static final updatedRiderLocation = Location(
    latitude: 3.8600,
    longitude: 11.5150,
  );
}

