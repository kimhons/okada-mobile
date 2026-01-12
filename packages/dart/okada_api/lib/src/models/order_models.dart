/// Order status enum
enum OrderStatus {
  pending,
  confirmed,
  preparing,
  readyForPickup,
  pickedUp,
  inTransit,
  delivered,
  cancelled,
  refunded;
  
  String get displayName {
    switch (this) {
      case OrderStatus.pending: return 'Pending';
      case OrderStatus.confirmed: return 'Confirmed';
      case OrderStatus.preparing: return 'Preparing';
      case OrderStatus.readyForPickup: return 'Ready for Pickup';
      case OrderStatus.pickedUp: return 'Picked Up';
      case OrderStatus.inTransit: return 'In Transit';
      case OrderStatus.delivered: return 'Delivered';
      case OrderStatus.cancelled: return 'Cancelled';
      case OrderStatus.refunded: return 'Refunded';
    }
  }
  
  bool get isActive => [
    OrderStatus.pending,
    OrderStatus.confirmed,
    OrderStatus.preparing,
    OrderStatus.readyForPickup,
    OrderStatus.pickedUp,
    OrderStatus.inTransit,
  ].contains(this);
  
  bool get isCompleted => this == OrderStatus.delivered;
  bool get isCancelled => this == OrderStatus.cancelled || this == OrderStatus.refunded;
}

/// Order item model
class OrderItem {
  final int id;
  final int productId;
  final String productName;
  final String? productImage;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final String? notes;
  final List<OrderItemModifier>? modifiers;
  
  OrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    this.productImage,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.notes,
    this.modifiers,
  });
  
  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as int,
      productId: json['productId'] as int,
      productName: json['productName'] as String,
      productImage: json['productImage'] as String?,
      quantity: json['quantity'] as int,
      unitPrice: (json['unitPrice'] as num).toDouble(),
      totalPrice: (json['totalPrice'] as num).toDouble(),
      notes: json['notes'] as String?,
      modifiers: (json['modifiers'] as List<dynamic>?)
          ?.map((e) => OrderItemModifier.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

/// Order item modifier
class OrderItemModifier {
  final String name;
  final double price;
  
  OrderItemModifier({required this.name, required this.price});
  
  factory OrderItemModifier.fromJson(Map<String, dynamic> json) {
    return OrderItemModifier(
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
    );
  }
}

/// Delivery address model
class DeliveryAddress {
  final int? id;
  final String label;
  final String address;
  final String? apartment;
  final String? instructions;
  final double latitude;
  final double longitude;
  final bool isDefault;
  
  DeliveryAddress({
    this.id,
    required this.label,
    required this.address,
    this.apartment,
    this.instructions,
    required this.latitude,
    required this.longitude,
    this.isDefault = false,
  });
  
  factory DeliveryAddress.fromJson(Map<String, dynamic> json) {
    return DeliveryAddress(
      id: json['id'] as int?,
      label: json['label'] as String? ?? 'Home',
      address: json['address'] as String,
      apartment: json['apartment'] as String?,
      instructions: json['instructions'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'label': label,
      'address': address,
      if (apartment != null) 'apartment': apartment,
      if (instructions != null) 'instructions': instructions,
      'latitude': latitude,
      'longitude': longitude,
      'isDefault': isDefault,
    };
  }
}

/// Order model
class Order {
  final int id;
  final String orderNumber;
  final int customerId;
  final int? riderId;
  final int sellerId;
  final String sellerName;
  final String? sellerImage;
  final OrderStatus status;
  final List<OrderItem> items;
  final DeliveryAddress deliveryAddress;
  final double subtotal;
  final double deliveryFee;
  final double serviceFee;
  final double discount;
  final double total;
  final String? promoCode;
  final String paymentMethod;
  final String paymentStatus;
  final String? notes;
  final DateTime createdAt;
  final DateTime? estimatedDelivery;
  final DateTime? deliveredAt;
  final RiderInfo? rider;
  final List<OrderTimeline>? timeline;
  
  Order({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    this.riderId,
    required this.sellerId,
    required this.sellerName,
    this.sellerImage,
    required this.status,
    required this.items,
    required this.deliveryAddress,
    required this.subtotal,
    required this.deliveryFee,
    required this.serviceFee,
    this.discount = 0,
    required this.total,
    this.promoCode,
    required this.paymentMethod,
    required this.paymentStatus,
    this.notes,
    required this.createdAt,
    this.estimatedDelivery,
    this.deliveredAt,
    this.rider,
    this.timeline,
  });
  
  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as int,
      orderNumber: json['orderNumber'] as String,
      customerId: json['customerId'] as int,
      riderId: json['riderId'] as int?,
      sellerId: json['sellerId'] as int,
      sellerName: json['sellerName'] as String,
      sellerImage: json['sellerImage'] as String?,
      status: OrderStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => OrderStatus.pending,
      ),
      items: (json['items'] as List<dynamic>)
          .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      deliveryAddress: DeliveryAddress.fromJson(
        json['deliveryAddress'] as Map<String, dynamic>,
      ),
      subtotal: (json['subtotal'] as num).toDouble(),
      deliveryFee: (json['deliveryFee'] as num).toDouble(),
      serviceFee: (json['serviceFee'] as num).toDouble(),
      discount: (json['discount'] as num?)?.toDouble() ?? 0,
      total: (json['total'] as num).toDouble(),
      promoCode: json['promoCode'] as String?,
      paymentMethod: json['paymentMethod'] as String,
      paymentStatus: json['paymentStatus'] as String,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      estimatedDelivery: json['estimatedDelivery'] != null
          ? DateTime.parse(json['estimatedDelivery'] as String)
          : null,
      deliveredAt: json['deliveredAt'] != null
          ? DateTime.parse(json['deliveredAt'] as String)
          : null,
      rider: json['rider'] != null
          ? RiderInfo.fromJson(json['rider'] as Map<String, dynamic>)
          : null,
      timeline: (json['timeline'] as List<dynamic>?)
          ?.map((e) => OrderTimeline.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
  
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  bool get canCancel => status == OrderStatus.pending || status == OrderStatus.confirmed;
  bool get canModify => status == OrderStatus.pending;
  bool get hasRider => riderId != null && rider != null;
}

/// Rider info for order
class RiderInfo {
  final int id;
  final String name;
  final String? phone;
  final String? avatar;
  final double rating;
  final String? vehicleType;
  final String? vehiclePlate;
  final double? latitude;
  final double? longitude;
  
  RiderInfo({
    required this.id,
    required this.name,
    this.phone,
    this.avatar,
    this.rating = 0.0,
    this.vehicleType,
    this.vehiclePlate,
    this.latitude,
    this.longitude,
  });
  
  factory RiderInfo.fromJson(Map<String, dynamic> json) {
    return RiderInfo(
      id: json['id'] as int,
      name: json['name'] as String,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      vehicleType: json['vehicleType'] as String?,
      vehiclePlate: json['vehiclePlate'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
}

/// Order timeline event
class OrderTimeline {
  final String status;
  final String title;
  final String? description;
  final DateTime timestamp;
  final bool isCompleted;
  
  OrderTimeline({
    required this.status,
    required this.title,
    this.description,
    required this.timestamp,
    this.isCompleted = false,
  });
  
  factory OrderTimeline.fromJson(Map<String, dynamic> json) {
    return OrderTimeline(
      status: json['status'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
      isCompleted: json['isCompleted'] as bool? ?? false,
    );
  }
}

/// Create order request
class CreateOrderRequest {
  final int sellerId;
  final List<CreateOrderItem> items;
  final DeliveryAddress deliveryAddress;
  final String paymentMethod;
  final String? promoCode;
  final String? notes;
  final DateTime? scheduledFor;
  
  CreateOrderRequest({
    required this.sellerId,
    required this.items,
    required this.deliveryAddress,
    required this.paymentMethod,
    this.promoCode,
    this.notes,
    this.scheduledFor,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'sellerId': sellerId,
      'items': items.map((e) => e.toJson()).toList(),
      'deliveryAddress': deliveryAddress.toJson(),
      'paymentMethod': paymentMethod,
      if (promoCode != null) 'promoCode': promoCode,
      if (notes != null) 'notes': notes,
      if (scheduledFor != null) 'scheduledFor': scheduledFor!.toIso8601String(),
    };
  }
}

/// Create order item
class CreateOrderItem {
  final int productId;
  final int quantity;
  final String? notes;
  final List<int>? modifierIds;
  
  CreateOrderItem({
    required this.productId,
    required this.quantity,
    this.notes,
    this.modifierIds,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'productId': productId,
      'quantity': quantity,
      if (notes != null) 'notes': notes,
      if (modifierIds != null) 'modifierIds': modifierIds,
    };
  }
}

/// Order list response
class OrderListResponse {
  final List<Order> orders;
  final int total;
  final int page;
  final int pageSize;
  final bool hasMore;
  
  OrderListResponse({
    required this.orders,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.hasMore,
  });
  
  factory OrderListResponse.fromJson(Map<String, dynamic> json) {
    return OrderListResponse(
      orders: (json['orders'] as List<dynamic>)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int,
      page: json['page'] as int? ?? 1,
      pageSize: json['pageSize'] as int? ?? 20,
      hasMore: json['hasMore'] as bool? ?? false,
    );
  }
}
