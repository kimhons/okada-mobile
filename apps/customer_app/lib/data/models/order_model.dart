import 'package:hive/hive.dart';
import '../../domain/entities/order.dart';
import 'user_model.dart';
import 'product_model.dart';
import 'cart_model.dart';

part 'order_model.g.dart';

@HiveType(typeId: 11)
class OrderModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String orderNumber;

  @HiveField(2)
  final String userId;

  @HiveField(3)
  final int orderStatus; // OrderStatus enum as int

  @HiveField(4)
  final List<OrderItemModel> items;

  @HiveField(5)
  final OrderSummaryModel summary;

  @HiveField(6)
  final AddressModel deliveryAddress;

  @HiveField(7)
  final PaymentMethodModel paymentMethod;

  @HiveField(8)
  final DateTime orderDate;

  @HiveField(9)
  final DateTime? estimatedDeliveryTime;

  @HiveField(10)
  final DateTime? actualDeliveryTime;

  @HiveField(11)
  final List<OrderStatusUpdateModel> statusHistory;

  @HiveField(12)
  final OrderDeliveryInfoModel? deliveryInfo;

  @HiveField(13)
  final String? notes;

  @HiveField(14)
  final String? cancellationReason;

  @HiveField(15)
  final DateTime createdAt;

  @HiveField(16)
  final DateTime updatedAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.userId,
    required this.orderStatus,
    required this.items,
    required this.summary,
    required this.deliveryAddress,
    required this.paymentMethod,
    required this.orderDate,
    this.estimatedDeliveryTime,
    this.actualDeliveryTime,
    required this.statusHistory,
    this.deliveryInfo,
    this.notes,
    this.cancellationReason,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      userId: json['userId'] ?? '',
      orderStatus: _orderStatusToInt(json['status']),
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      summary: OrderSummaryModel.fromJson(json['summary'] ?? {}),
      deliveryAddress: AddressModel.fromJson(json['deliveryAddress'] ?? {}),
      paymentMethod: PaymentMethodModel.fromJson(json['paymentMethod'] ?? {}),
      orderDate: DateTime.parse(json['orderDate']),
      estimatedDeliveryTime: json['estimatedDeliveryTime'] != null
          ? DateTime.parse(json['estimatedDeliveryTime'])
          : null,
      actualDeliveryTime: json['actualDeliveryTime'] != null
          ? DateTime.parse(json['actualDeliveryTime'])
          : null,
      statusHistory: (json['statusHistory'] as List<dynamic>?)
          ?.map((e) => OrderStatusUpdateModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      deliveryInfo: json['deliveryInfo'] != null
          ? OrderDeliveryInfoModel.fromJson(json['deliveryInfo'])
          : null,
      notes: json['notes'],
      cancellationReason: json['cancellationReason'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderNumber': orderNumber,
      'userId': userId,
      'status': _intToOrderStatus(orderStatus),
      'items': items.map((e) => e.toJson()).toList(),
      'summary': summary.toJson(),
      'deliveryAddress': deliveryAddress.toJson(),
      'paymentMethod': paymentMethod.toJson(),
      'orderDate': orderDate.toIso8601String(),
      'estimatedDeliveryTime': estimatedDeliveryTime?.toIso8601String(),
      'actualDeliveryTime': actualDeliveryTime?.toIso8601String(),
      'statusHistory': statusHistory.map((e) => e.toJson()).toList(),
      'deliveryInfo': deliveryInfo?.toJson(),
      'notes': notes,
      'cancellationReason': cancellationReason,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Order toEntity() {
    return Order(
      id: id,
      orderNumber: orderNumber,
      userId: userId,
      status: _intToOrderStatusEnum(orderStatus),
      items: items.map((e) => e.toEntity()).toList(),
      summary: summary.toEntity(),
      deliveryAddress: deliveryAddress.toEntity(),
      paymentMethod: paymentMethod.toEntity(),
      orderDate: orderDate,
      estimatedDeliveryTime: estimatedDeliveryTime,
      actualDeliveryTime: actualDeliveryTime,
      statusHistory: statusHistory.map((e) => e.toEntity()).toList(),
      deliveryInfo: deliveryInfo?.toEntity(),
      notes: notes,
      cancellationReason: cancellationReason,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory OrderModel.fromEntity(Order order) {
    return OrderModel(
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      orderStatus: _orderStatusEnumToInt(order.status),
      items: order.items.map((e) => OrderItemModel.fromEntity(e)).toList(),
      summary: OrderSummaryModel.fromEntity(order.summary),
      deliveryAddress: AddressModel.fromEntity(order.deliveryAddress),
      paymentMethod: PaymentMethodModel.fromEntity(order.paymentMethod),
      orderDate: order.orderDate,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      statusHistory: order.statusHistory.map((e) => OrderStatusUpdateModel.fromEntity(e)).toList(),
      deliveryInfo: order.deliveryInfo != null
          ? OrderDeliveryInfoModel.fromEntity(order.deliveryInfo!)
          : null,
      notes: order.notes,
      cancellationReason: order.cancellationReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    );
  }

  static int _orderStatusToInt(String? status) {
    switch (status) {
      case 'PLACED':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'ON_THE_WAY':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
        return 5;
      default:
        return 0;
    }
  }

  static String _intToOrderStatus(int status) {
    switch (status) {
      case 0:
        return 'PLACED';
      case 1:
        return 'CONFIRMED';
      case 2:
        return 'PREPARING';
      case 3:
        return 'ON_THE_WAY';
      case 4:
        return 'DELIVERED';
      case 5:
        return 'CANCELLED';
      default:
        return 'PLACED';
    }
  }

  static OrderStatus _intToOrderStatusEnum(int status) {
    switch (status) {
      case 0:
        return OrderStatus.placed;
      case 1:
        return OrderStatus.confirmed;
      case 2:
        return OrderStatus.preparing;
      case 3:
        return OrderStatus.onTheWay;
      case 4:
        return OrderStatus.delivered;
      case 5:
        return OrderStatus.cancelled;
      default:
        return OrderStatus.placed;
    }
  }

  static int _orderStatusEnumToInt(OrderStatus status) {
    switch (status) {
      case OrderStatus.placed:
        return 0;
      case OrderStatus.confirmed:
        return 1;
      case OrderStatus.preparing:
        return 2;
      case OrderStatus.onTheWay:
        return 3;
      case OrderStatus.delivered:
        return 4;
      case OrderStatus.cancelled:
        return 5;
    }
  }
}

@HiveType(typeId: 12)
class OrderItemModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final ProductModel product;

  @HiveField(2)
  final int quantity;

  @HiveField(3)
  final double price;

  @HiveField(4)
  final Map<String, dynamic>? selectedOptions;

  @HiveField(5)
  final DateTime createdAt;

  OrderItemModel({
    required this.id,
    required this.product,
    required this.quantity,
    required this.price,
    this.selectedOptions,
    required this.createdAt,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] ?? '',
      product: ProductModel.fromJson(json['product'] ?? {}),
      quantity: json['quantity'] ?? 0,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      selectedOptions: json['selectedOptions'] != null
          ? Map<String, dynamic>.from(json['selectedOptions'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product': product.toJson(),
      'quantity': quantity,
      'price': price,
      'selectedOptions': selectedOptions,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  OrderItem toEntity() {
    return OrderItem(
      id: id,
      product: product.toEntity(),
      quantity: quantity,
      price: price,
      selectedOptions: selectedOptions,
      createdAt: createdAt,
    );
  }

  factory OrderItemModel.fromEntity(OrderItem orderItem) {
    return OrderItemModel(
      id: orderItem.id,
      product: ProductModel.fromEntity(orderItem.product),
      quantity: orderItem.quantity,
      price: orderItem.price,
      selectedOptions: orderItem.selectedOptions,
      createdAt: orderItem.createdAt,
    );
  }
}

@HiveType(typeId: 13)
class OrderSummaryModel extends HiveObject {
  @HiveField(0)
  final double subtotal;

  @HiveField(1)
  final double deliveryFee;

  @HiveField(2)
  final double discount;

  @HiveField(3)
  final double tax;

  @HiveField(4)
  final double total;

  @HiveField(5)
  final String currency;

  @HiveField(6)
  final List<CartDiscountModel> appliedDiscounts;

  OrderSummaryModel({
    required this.subtotal,
    this.deliveryFee = 0.0,
    this.discount = 0.0,
    this.tax = 0.0,
    required this.total,
    this.currency = 'XAF',
    this.appliedDiscounts = const [],
  });

  factory OrderSummaryModel.fromJson(Map<String, dynamic> json) {
    return OrderSummaryModel(
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      tax: (json['tax'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'XAF',
      appliedDiscounts: (json['appliedDiscounts'] as List<dynamic>?)
          ?.map((e) => CartDiscountModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subtotal': subtotal,
      'deliveryFee': deliveryFee,
      'discount': discount,
      'tax': tax,
      'total': total,
      'currency': currency,
      'appliedDiscounts': appliedDiscounts.map((e) => e.toJson()).toList(),
    };
  }

  OrderSummary toEntity() {
    return OrderSummary(
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      tax: tax,
      total: total,
      currency: currency,
      appliedDiscounts: appliedDiscounts.map((e) => e.toEntity()).toList(),
    );
  }

  factory OrderSummaryModel.fromEntity(OrderSummary summary) {
    return OrderSummaryModel(
      subtotal: summary.subtotal,
      deliveryFee: summary.deliveryFee,
      discount: summary.discount,
      tax: summary.tax,
      total: summary.total,
      currency: summary.currency,
      appliedDiscounts: summary.appliedDiscounts.map((e) => CartDiscountModel.fromEntity(e)).toList(),
    );
  }
}

@HiveType(typeId: 14)
class OrderStatusUpdateModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final int orderStatus; // OrderStatus enum as int

  @HiveField(2)
  final String title;

  @HiveField(3)
  final String description;

  @HiveField(4)
  final DateTime timestamp;

  @HiveField(5)
  final String? location;

  @HiveField(6)
  final Map<String, dynamic>? metadata;

  OrderStatusUpdateModel({
    required this.id,
    required this.orderStatus,
    required this.title,
    required this.description,
    required this.timestamp,
    this.location,
    this.metadata,
  });

  factory OrderStatusUpdateModel.fromJson(Map<String, dynamic> json) {
    return OrderStatusUpdateModel(
      id: json['id'] ?? '',
      orderStatus: OrderModel._orderStatusToInt(json['status']),
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      timestamp: DateTime.parse(json['timestamp']),
      location: json['location'],
      metadata: json['metadata'] != null
          ? Map<String, dynamic>.from(json['metadata'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status': OrderModel._intToOrderStatus(orderStatus),
      'title': title,
      'description': description,
      'timestamp': timestamp.toIso8601String(),
      'location': location,
      'metadata': metadata,
    };
  }

  OrderStatusUpdate toEntity() {
    return OrderStatusUpdate(
      id: id,
      status: OrderModel._intToOrderStatusEnum(orderStatus),
      title: title,
      description: description,
      timestamp: timestamp,
      location: location,
      metadata: metadata,
    );
  }

  factory OrderStatusUpdateModel.fromEntity(OrderStatusUpdate update) {
    return OrderStatusUpdateModel(
      id: update.id,
      orderStatus: OrderModel._orderStatusEnumToInt(update.status),
      title: update.title,
      description: update.description,
      timestamp: update.timestamp,
      location: update.location,
      metadata: update.metadata,
    );
  }
}

@HiveType(typeId: 15)
class OrderDeliveryInfoModel extends HiveObject {
  @HiveField(0)
  final String? riderId;

  @HiveField(1)
  final String? riderName;

  @HiveField(2)
  final String? riderPhone;

  @HiveField(3)
  final String? riderPhotoUrl;

  @HiveField(4)
  final double? riderLatitude;

  @HiveField(5)
  final double? riderLongitude;

  @HiveField(6)
  final String? riderVehicleType;

  @HiveField(7)
  final String? riderVehicleNumber;

  @HiveField(8)
  final DateTime? estimatedArrival;

  @HiveField(9)
  final double? distanceRemaining;

  @HiveField(10)
  final List<DeliveryTrackingPointModel> trackingPoints;

  OrderDeliveryInfoModel({
    this.riderId,
    this.riderName,
    this.riderPhone,
    this.riderPhotoUrl,
    this.riderLatitude,
    this.riderLongitude,
    this.riderVehicleType,
    this.riderVehicleNumber,
    this.estimatedArrival,
    this.distanceRemaining,
    this.trackingPoints = const [],
  });

  factory OrderDeliveryInfoModel.fromJson(Map<String, dynamic> json) {
    return OrderDeliveryInfoModel(
      riderId: json['riderId'],
      riderName: json['riderName'],
      riderPhone: json['riderPhone'],
      riderPhotoUrl: json['riderPhotoUrl'],
      riderLatitude: (json['riderLatitude'] as num?)?.toDouble(),
      riderLongitude: (json['riderLongitude'] as num?)?.toDouble(),
      riderVehicleType: json['riderVehicleType'],
      riderVehicleNumber: json['riderVehicleNumber'],
      estimatedArrival: json['estimatedArrival'] != null
          ? DateTime.parse(json['estimatedArrival'])
          : null,
      distanceRemaining: (json['distanceRemaining'] as num?)?.toDouble(),
      trackingPoints: (json['trackingPoints'] as List<dynamic>?)
          ?.map((e) => DeliveryTrackingPointModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'riderId': riderId,
      'riderName': riderName,
      'riderPhone': riderPhone,
      'riderPhotoUrl': riderPhotoUrl,
      'riderLatitude': riderLatitude,
      'riderLongitude': riderLongitude,
      'riderVehicleType': riderVehicleType,
      'riderVehicleNumber': riderVehicleNumber,
      'estimatedArrival': estimatedArrival?.toIso8601String(),
      'distanceRemaining': distanceRemaining,
      'trackingPoints': trackingPoints.map((e) => e.toJson()).toList(),
    };
  }

  OrderDeliveryInfo toEntity() {
    return OrderDeliveryInfo(
      riderId: riderId,
      riderName: riderName,
      riderPhone: riderPhone,
      riderPhotoUrl: riderPhotoUrl,
      riderLatitude: riderLatitude,
      riderLongitude: riderLongitude,
      riderVehicleType: riderVehicleType,
      riderVehicleNumber: riderVehicleNumber,
      estimatedArrival: estimatedArrival,
      distanceRemaining: distanceRemaining,
      trackingPoints: trackingPoints.map((e) => e.toEntity()).toList(),
    );
  }

  factory OrderDeliveryInfoModel.fromEntity(OrderDeliveryInfo info) {
    return OrderDeliveryInfoModel(
      riderId: info.riderId,
      riderName: info.riderName,
      riderPhone: info.riderPhone,
      riderPhotoUrl: info.riderPhotoUrl,
      riderLatitude: info.riderLatitude,
      riderLongitude: info.riderLongitude,
      riderVehicleType: info.riderVehicleType,
      riderVehicleNumber: info.riderVehicleNumber,
      estimatedArrival: info.estimatedArrival,
      distanceRemaining: info.distanceRemaining,
      trackingPoints: info.trackingPoints.map((e) => DeliveryTrackingPointModel.fromEntity(e)).toList(),
    );
  }
}

@HiveType(typeId: 16)
class DeliveryTrackingPointModel extends HiveObject {
  @HiveField(0)
  final double latitude;

  @HiveField(1)
  final double longitude;

  @HiveField(2)
  final DateTime timestamp;

  @HiveField(3)
  final String? description;

  DeliveryTrackingPointModel({
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.description,
  });

  factory DeliveryTrackingPointModel.fromJson(Map<String, dynamic> json) {
    return DeliveryTrackingPointModel(
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      timestamp: DateTime.parse(json['timestamp']),
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'timestamp': timestamp.toIso8601String(),
      'description': description,
    };
  }

  DeliveryTrackingPoint toEntity() {
    return DeliveryTrackingPoint(
      latitude: latitude,
      longitude: longitude,
      timestamp: timestamp,
      description: description,
    );
  }

  factory DeliveryTrackingPointModel.fromEntity(DeliveryTrackingPoint point) {
    return DeliveryTrackingPointModel(
      latitude: point.latitude,
      longitude: point.longitude,
      timestamp: point.timestamp,
      description: point.description,
    );
  }
}