import '../client/api_client.dart';
import '../models/order_models.dart';

/// Order service for customer app
class OrderService {
  final OkadaApiClient _client;
  
  OrderService(this._client);
  
  /// Get customer orders
  Future<OrderListResponse> getOrders({
    int page = 1,
    int pageSize = 20,
    OrderStatus? status,
    DateTime? fromDate,
    DateTime? toDate,
  }) async {
    try {
      final response = await _client.get('/api/mobile/orders', queryParameters: {
        'page': page,
        'pageSize': pageSize,
        if (status != null) 'status': status.name,
        if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
        if (toDate != null) 'toDate': toDate.toIso8601String(),
      });
      return OrderListResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Get order by ID
  Future<Order> getOrder(int orderId) async {
    try {
      final response = await _client.get('/api/mobile/orders/$orderId');
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Get active orders
  Future<List<Order>> getActiveOrders() async {
    try {
      final response = await _client.get('/api/mobile/orders/active');
      return (response.data as List<dynamic>)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      rethrow;
    }
  }
  
  /// Create new order
  Future<Order> createOrder(CreateOrderRequest request) async {
    try {
      final response = await _client.post(
        '/api/mobile/orders',
        data: request.toJson(),
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Cancel order
  Future<Order> cancelOrder(int orderId, {String? reason}) async {
    try {
      final response = await _client.post(
        '/api/mobile/orders/$orderId/cancel',
        data: {'reason': reason},
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Rate order
  Future<void> rateOrder(int orderId, {
    required int rating,
    String? review,
    int? riderRating,
    String? riderReview,
  }) async {
    try {
      await _client.post('/api/mobile/orders/$orderId/rate', data: {
        'rating': rating,
        if (review != null) 'review': review,
        if (riderRating != null) 'riderRating': riderRating,
        if (riderReview != null) 'riderReview': riderReview,
      });
    } catch (e) {
      rethrow;
    }
  }
  
  /// Reorder (create order from previous order)
  Future<Order> reorder(int orderId) async {
    try {
      final response = await _client.post('/api/mobile/orders/$orderId/reorder');
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Get order tracking info
  Future<OrderTrackingInfo> getOrderTracking(int orderId) async {
    try {
      final response = await _client.get('/api/mobile/orders/$orderId/tracking');
      return OrderTrackingInfo.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Apply promo code
  Future<PromoCodeResult> applyPromoCode(String code, double subtotal) async {
    try {
      final response = await _client.post('/api/mobile/promo/apply', data: {
        'code': code,
        'subtotal': subtotal,
      });
      return PromoCodeResult.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}

/// Rider order service
class RiderOrderService {
  final OkadaApiClient _client;
  
  RiderOrderService(this._client);
  
  /// Get available orders for rider
  Future<List<RiderAvailableOrder>> getAvailableOrders({
    double? latitude,
    double? longitude,
    double? radiusKm,
  }) async {
    try {
      final response = await _client.get('/api/mobile/rider/orders/available', 
        queryParameters: {
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (radiusKm != null) 'radiusKm': radiusKm,
        },
      );
      return (response.data as List<dynamic>)
          .map((e) => RiderAvailableOrder.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      rethrow;
    }
  }
  
  /// Get rider's active delivery
  Future<RiderActiveDelivery?> getActiveDelivery() async {
    try {
      final response = await _client.get('/api/mobile/rider/orders/active');
      if (response.data == null) return null;
      return RiderActiveDelivery.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Accept order
  Future<RiderActiveDelivery> acceptOrder(int orderId) async {
    try {
      final response = await _client.post('/api/mobile/rider/orders/$orderId/accept');
      return RiderActiveDelivery.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Reject order
  Future<void> rejectOrder(int orderId, {String? reason}) async {
    try {
      await _client.post('/api/mobile/rider/orders/$orderId/reject', data: {
        if (reason != null) 'reason': reason,
      });
    } catch (e) {
      rethrow;
    }
  }
  
  /// Update delivery status
  Future<RiderActiveDelivery> updateDeliveryStatus(
    int orderId, 
    String status, {
    String? notes,
    String? photoUrl,
  }) async {
    try {
      final response = await _client.post(
        '/api/mobile/rider/orders/$orderId/status',
        data: {
          'status': status,
          if (notes != null) 'notes': notes,
          if (photoUrl != null) 'photoUrl': photoUrl,
        },
      );
      return RiderActiveDelivery.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Confirm pickup
  Future<RiderActiveDelivery> confirmPickup(int orderId, {String? photoUrl}) async {
    return updateDeliveryStatus(orderId, 'pickedUp', photoUrl: photoUrl);
  }
  
  /// Confirm delivery
  Future<RiderActiveDelivery> confirmDelivery(int orderId, {
    required String photoUrl,
    String? notes,
  }) async {
    return updateDeliveryStatus(orderId, 'delivered', 
      photoUrl: photoUrl, 
      notes: notes,
    );
  }
  
  /// Get rider delivery history
  Future<RiderDeliveryHistory> getDeliveryHistory({
    int page = 1,
    int pageSize = 20,
    DateTime? fromDate,
    DateTime? toDate,
  }) async {
    try {
      final response = await _client.get('/api/mobile/rider/orders/history',
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
          if (toDate != null) 'toDate': toDate.toIso8601String(),
        },
      );
      return RiderDeliveryHistory.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Get rider earnings summary
  Future<RiderEarnings> getEarnings({
    String period = 'today',
  }) async {
    try {
      final response = await _client.get('/api/mobile/rider/earnings',
        queryParameters: {'period': period},
      );
      return RiderEarnings.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}

/// Order tracking info
class OrderTrackingInfo {
  final OrderStatus status;
  final double? riderLatitude;
  final double? riderLongitude;
  final int? estimatedMinutes;
  final List<OrderTimeline> timeline;
  
  OrderTrackingInfo({
    required this.status,
    this.riderLatitude,
    this.riderLongitude,
    this.estimatedMinutes,
    required this.timeline,
  });
  
  factory OrderTrackingInfo.fromJson(Map<String, dynamic> json) {
    return OrderTrackingInfo(
      status: OrderStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => OrderStatus.pending,
      ),
      riderLatitude: (json['riderLatitude'] as num?)?.toDouble(),
      riderLongitude: (json['riderLongitude'] as num?)?.toDouble(),
      estimatedMinutes: json['estimatedMinutes'] as int?,
      timeline: (json['timeline'] as List<dynamic>)
          .map((e) => OrderTimeline.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

/// Promo code result
class PromoCodeResult {
  final bool valid;
  final String? code;
  final String? discountType;
  final double? discountValue;
  final double? discountAmount;
  final String? message;
  
  PromoCodeResult({
    required this.valid,
    this.code,
    this.discountType,
    this.discountValue,
    this.discountAmount,
    this.message,
  });
  
  factory PromoCodeResult.fromJson(Map<String, dynamic> json) {
    return PromoCodeResult(
      valid: json['valid'] as bool,
      code: json['code'] as String?,
      discountType: json['discountType'] as String?,
      discountValue: (json['discountValue'] as num?)?.toDouble(),
      discountAmount: (json['discountAmount'] as num?)?.toDouble(),
      message: json['message'] as String?,
    );
  }
}

/// Rider available order
class RiderAvailableOrder {
  final int id;
  final String orderNumber;
  final String sellerName;
  final String sellerAddress;
  final double sellerLatitude;
  final double sellerLongitude;
  final String deliveryAddress;
  final double deliveryLatitude;
  final double deliveryLongitude;
  final double distanceKm;
  final double estimatedEarnings;
  final int itemCount;
  final DateTime createdAt;
  
  RiderAvailableOrder({
    required this.id,
    required this.orderNumber,
    required this.sellerName,
    required this.sellerAddress,
    required this.sellerLatitude,
    required this.sellerLongitude,
    required this.deliveryAddress,
    required this.deliveryLatitude,
    required this.deliveryLongitude,
    required this.distanceKm,
    required this.estimatedEarnings,
    required this.itemCount,
    required this.createdAt,
  });
  
  factory RiderAvailableOrder.fromJson(Map<String, dynamic> json) {
    return RiderAvailableOrder(
      id: json['id'] as int,
      orderNumber: json['orderNumber'] as String,
      sellerName: json['sellerName'] as String,
      sellerAddress: json['sellerAddress'] as String,
      sellerLatitude: (json['sellerLatitude'] as num).toDouble(),
      sellerLongitude: (json['sellerLongitude'] as num).toDouble(),
      deliveryAddress: json['deliveryAddress'] as String,
      deliveryLatitude: (json['deliveryLatitude'] as num).toDouble(),
      deliveryLongitude: (json['deliveryLongitude'] as num).toDouble(),
      distanceKm: (json['distanceKm'] as num).toDouble(),
      estimatedEarnings: (json['estimatedEarnings'] as num).toDouble(),
      itemCount: json['itemCount'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

/// Rider active delivery
class RiderActiveDelivery {
  final Order order;
  final String currentStep;
  final DateTime? pickedUpAt;
  final String? pickupPhotoUrl;
  
  RiderActiveDelivery({
    required this.order,
    required this.currentStep,
    this.pickedUpAt,
    this.pickupPhotoUrl,
  });
  
  factory RiderActiveDelivery.fromJson(Map<String, dynamic> json) {
    return RiderActiveDelivery(
      order: Order.fromJson(json['order'] as Map<String, dynamic>),
      currentStep: json['currentStep'] as String,
      pickedUpAt: json['pickedUpAt'] != null
          ? DateTime.parse(json['pickedUpAt'] as String)
          : null,
      pickupPhotoUrl: json['pickupPhotoUrl'] as String?,
    );
  }
  
  bool get isPickedUp => pickedUpAt != null;
}

/// Rider delivery history
class RiderDeliveryHistory {
  final List<Order> deliveries;
  final int total;
  final int page;
  final int pageSize;
  final bool hasMore;
  
  RiderDeliveryHistory({
    required this.deliveries,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.hasMore,
  });
  
  factory RiderDeliveryHistory.fromJson(Map<String, dynamic> json) {
    return RiderDeliveryHistory(
      deliveries: (json['deliveries'] as List<dynamic>)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int,
      page: json['page'] as int? ?? 1,
      pageSize: json['pageSize'] as int? ?? 20,
      hasMore: json['hasMore'] as bool? ?? false,
    );
  }
}

/// Rider earnings
class RiderEarnings {
  final double totalEarnings;
  final int totalDeliveries;
  final double averagePerDelivery;
  final double tips;
  final double bonuses;
  final List<EarningEntry> entries;
  
  RiderEarnings({
    required this.totalEarnings,
    required this.totalDeliveries,
    required this.averagePerDelivery,
    required this.tips,
    required this.bonuses,
    required this.entries,
  });
  
  factory RiderEarnings.fromJson(Map<String, dynamic> json) {
    return RiderEarnings(
      totalEarnings: (json['totalEarnings'] as num).toDouble(),
      totalDeliveries: json['totalDeliveries'] as int,
      averagePerDelivery: (json['averagePerDelivery'] as num).toDouble(),
      tips: (json['tips'] as num?)?.toDouble() ?? 0,
      bonuses: (json['bonuses'] as num?)?.toDouble() ?? 0,
      entries: (json['entries'] as List<dynamic>?)
          ?.map((e) => EarningEntry.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }
}

/// Earning entry
class EarningEntry {
  final int orderId;
  final String orderNumber;
  final double amount;
  final double? tip;
  final DateTime completedAt;
  
  EarningEntry({
    required this.orderId,
    required this.orderNumber,
    required this.amount,
    this.tip,
    required this.completedAt,
  });
  
  factory EarningEntry.fromJson(Map<String, dynamic> json) {
    return EarningEntry(
      orderId: json['orderId'] as int,
      orderNumber: json['orderNumber'] as String,
      amount: (json['amount'] as num).toDouble(),
      tip: (json['tip'] as num?)?.toDouble(),
      completedAt: DateTime.parse(json['completedAt'] as String),
    );
  }
}
