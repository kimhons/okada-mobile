/// Models for Order Tracking feature
/// Contains all data structures needed for real-time tracking

class TrackingData {
  final String orderId;
  final OrderStatus status;
  final DateTime estimatedAt;
  final DateTime? newEstimatedAt;
  final String? delayReason;
  final Location pickupLocation;
  final Location deliveryLocation;
  final RiderInfo rider;
  final List<OrderStatusStep> statusHistory;

  TrackingData({
    required this.orderId,
    required this.status,
    required this.estimatedAt,
    this.newEstimatedAt,
    this.delayReason,
    required this.pickupLocation,
    required this.deliveryLocation,
    required this.rider,
    required this.statusHistory,
  });

  factory TrackingData.fromJson(Map<String, dynamic> json) {
    return TrackingData(
      orderId: json['orderId'] as String,
      status: OrderStatus.fromString(json['status'] as String),
      estimatedAt: DateTime.parse(json['estimatedAt'] as String),
      newEstimatedAt: json['newEstimatedAt'] != null
          ? DateTime.parse(json['newEstimatedAt'] as String)
          : null,
      delayReason: json['delayReason'] as String?,
      pickupLocation: Location.fromJson(json['pickupLocation'] as Map<String, dynamic>),
      deliveryLocation: Location.fromJson(json['deliveryLocation'] as Map<String, dynamic>),
      rider: RiderInfo.fromJson(json['rider'] as Map<String, dynamic>),
      statusHistory: (json['statusHistory'] as List<dynamic>?)
              ?.map((e) => OrderStatusStep.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'orderId': orderId,
      'status': status.value,
      'estimatedAt': estimatedAt.toIso8601String(),
      'newEstimatedAt': newEstimatedAt?.toIso8601String(),
      'delayReason': delayReason,
      'pickupLocation': pickupLocation.toJson(),
      'deliveryLocation': deliveryLocation.toJson(),
      'rider': rider.toJson(),
      'statusHistory': statusHistory.map((e) => e.toJson()).toList(),
    };
  }

  bool get isDelayed => newEstimatedAt != null;

  TrackingData copyWith({
    String? orderId,
    OrderStatus? status,
    DateTime? estimatedAt,
    DateTime? newEstimatedAt,
    String? delayReason,
    Location? pickupLocation,
    Location? deliveryLocation,
    RiderInfo? rider,
    List<OrderStatusStep>? statusHistory,
  }) {
    return TrackingData(
      orderId: orderId ?? this.orderId,
      status: status ?? this.status,
      estimatedAt: estimatedAt ?? this.estimatedAt,
      newEstimatedAt: newEstimatedAt ?? this.newEstimatedAt,
      delayReason: delayReason ?? this.delayReason,
      pickupLocation: pickupLocation ?? this.pickupLocation,
      deliveryLocation: deliveryLocation ?? this.deliveryLocation,
      rider: rider ?? this.rider,
      statusHistory: statusHistory ?? this.statusHistory,
    );
  }
}

class Location {
  final double latitude;
  final double longitude;
  final String? address;

  Location({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }

  Location copyWith({
    double? latitude,
    double? longitude,
    String? address,
  }) {
    return Location(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
    );
  }
}

class RiderInfo {
  final String id;
  final String name;
  final String phone;
  final double rating;
  final String? photoUrl;
  final Location currentLocation;
  final String? message;

  RiderInfo({
    required this.id,
    required this.name,
    required this.phone,
    required this.rating,
    this.photoUrl,
    required this.currentLocation,
    this.message,
  });

  factory RiderInfo.fromJson(Map<String, dynamic> json) {
    return RiderInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      rating: (json['rating'] as num).toDouble(),
      photoUrl: json['photoUrl'] as String?,
      currentLocation: Location.fromJson(json['currentLocation'] as Map<String, dynamic>),
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'rating': rating,
      'photoUrl': photoUrl,
      'currentLocation': currentLocation.toJson(),
      'message': message,
    };
  }

  RiderInfo copyWith({
    String? id,
    String? name,
    String? phone,
    double? rating,
    String? photoUrl,
    Location? currentLocation,
    String? message,
  }) {
    return RiderInfo(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      rating: rating ?? this.rating,
      photoUrl: photoUrl ?? this.photoUrl,
      currentLocation: currentLocation ?? this.currentLocation,
      message: message ?? this.message,
    );
  }
}

class OrderStatusStep {
  final String title;
  final OrderStepStatus status;
  final DateTime? timestamp;

  OrderStatusStep({
    required this.title,
    required this.status,
    this.timestamp,
  });

  factory OrderStatusStep.fromJson(Map<String, dynamic> json) {
    return OrderStatusStep(
      title: json['title'] as String,
      status: OrderStepStatus.fromString(json['status'] as String),
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'status': status.value,
      'timestamp': timestamp?.toIso8601String(),
    };
  }
}

enum OrderStatus {
  orderPlaced('order_placed'),
  confirmed('confirmed'),
  riderAssigned('rider_assigned'),
  inTransit('in_transit'),
  delayed('delayed'),
  arrivingSoon('arriving_soon'),
  delivered('delivered'),
  cancelled('cancelled');

  final String value;
  const OrderStatus(this.value);

  static OrderStatus fromString(String value) {
    return OrderStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => OrderStatus.orderPlaced,
    );
  }
}

enum OrderStepStatus {
  completed('completed'),
  active('active'),
  pending('pending'),
  warning('warning'),
  error('error');

  final String value;
  const OrderStepStatus(this.value);

  static OrderStepStatus fromString(String value) {
    return OrderStepStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => OrderStepStatus.pending,
    );
  }
}

