import 'package:equatable/equatable.dart';
import 'user.dart';
import 'product.dart';
import 'cart.dart';

class Order extends Equatable {
  final String id;
  final String orderNumber;
  final String userId;
  final OrderStatus status;
  final List<OrderItem> items;
  final OrderSummary summary;
  final Address deliveryAddress;
  final PaymentMethod paymentMethod;
  final DateTime orderDate;
  final DateTime? estimatedDeliveryTime;
  final DateTime? actualDeliveryTime;
  final List<OrderStatusUpdate> statusHistory;
  final OrderDeliveryInfo? deliveryInfo;
  final String? notes;
  final String? cancellationReason;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.userId,
    required this.status,
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

  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  bool get canBeCancelled => status == OrderStatus.placed || status == OrderStatus.confirmed;

  bool get canBeTracked => status == OrderStatus.preparing ||
                          status == OrderStatus.onTheWay ||
                          status == OrderStatus.delivered;

  bool get isCompleted => status == OrderStatus.delivered || status == OrderStatus.cancelled;

  Duration? get estimatedTimeRemaining {
    if (estimatedDeliveryTime == null) return null;
    final now = DateTime.now();
    if (estimatedDeliveryTime!.isBefore(now)) return null;
    return estimatedDeliveryTime!.difference(now);
  }

  String get formattedOrderNumber => '#$orderNumber';

  OrderStatusUpdate? get currentStatusUpdate {
    if (statusHistory.isEmpty) return null;
    return statusHistory.where((update) => update.status == status).lastOrNull;
  }

  Order copyWith({
    String? id,
    String? orderNumber,
    String? userId,
    OrderStatus? status,
    List<OrderItem>? items,
    OrderSummary? summary,
    Address? deliveryAddress,
    PaymentMethod? paymentMethod,
    DateTime? orderDate,
    DateTime? estimatedDeliveryTime,
    DateTime? actualDeliveryTime,
    List<OrderStatusUpdate>? statusHistory,
    OrderDeliveryInfo? deliveryInfo,
    String? notes,
    String? cancellationReason,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Order(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      userId: userId ?? this.userId,
      status: status ?? this.status,
      items: items ?? this.items,
      summary: summary ?? this.summary,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      orderDate: orderDate ?? this.orderDate,
      estimatedDeliveryTime: estimatedDeliveryTime ?? this.estimatedDeliveryTime,
      actualDeliveryTime: actualDeliveryTime ?? this.actualDeliveryTime,
      statusHistory: statusHistory ?? this.statusHistory,
      deliveryInfo: deliveryInfo ?? this.deliveryInfo,
      notes: notes ?? this.notes,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        orderNumber,
        userId,
        status,
        items,
        summary,
        deliveryAddress,
        paymentMethod,
        orderDate,
        estimatedDeliveryTime,
        actualDeliveryTime,
        statusHistory,
        deliveryInfo,
        notes,
        cancellationReason,
        createdAt,
        updatedAt,
      ];
}

class OrderItem extends Equatable {
  final String id;
  final Product product;
  final int quantity;
  final double price; // Price at the time of order
  final Map<String, dynamic>? selectedOptions;
  final DateTime createdAt;

  const OrderItem({
    required this.id,
    required this.product,
    required this.quantity,
    required this.price,
    this.selectedOptions,
    required this.createdAt,
  });

  double get totalPrice => price * quantity;

  String get formattedPrice => '${price.toStringAsFixed(0)} ${product.currency}';

  String get formattedTotalPrice => '${totalPrice.toStringAsFixed(0)} ${product.currency}';

  // Create from CartItem
  factory OrderItem.fromCartItem(CartItem cartItem) {
    return OrderItem(
      id: cartItem.id,
      product: cartItem.product,
      quantity: cartItem.quantity,
      price: cartItem.price,
      selectedOptions: cartItem.selectedOptions,
      createdAt: DateTime.now(),
    );
  }

  OrderItem copyWith({
    String? id,
    Product? product,
    int? quantity,
    double? price,
    Map<String, dynamic>? selectedOptions,
    DateTime? createdAt,
  }) {
    return OrderItem(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      price: price ?? this.price,
      selectedOptions: selectedOptions ?? this.selectedOptions,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        product,
        quantity,
        price,
        selectedOptions,
        createdAt,
      ];
}

class OrderSummary extends Equatable {
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double tax;
  final double total;
  final String currency;
  final List<CartDiscount> appliedDiscounts;

  const OrderSummary({
    required this.subtotal,
    this.deliveryFee = 0.0,
    this.discount = 0.0,
    this.tax = 0.0,
    required this.total,
    this.currency = 'XAF',
    this.appliedDiscounts = const [],
  });

  String get formattedSubtotal => '${subtotal.toStringAsFixed(0)} $currency';

  String get formattedDeliveryFee => '${deliveryFee.toStringAsFixed(0)} $currency';

  String get formattedDiscount => '${discount.toStringAsFixed(0)} $currency';

  String get formattedTax => '${tax.toStringAsFixed(0)} $currency';

  String get formattedTotal => '${total.toStringAsFixed(0)} $currency';

  // Create from CartSummary
  factory OrderSummary.fromCartSummary(CartSummary cartSummary, {double tax = 0.0}) {
    return OrderSummary(
      subtotal: cartSummary.subtotal,
      deliveryFee: cartSummary.deliveryFee,
      discount: cartSummary.discount,
      tax: tax,
      total: cartSummary.total + tax,
      currency: cartSummary.currency,
      appliedDiscounts: cartSummary.appliedDiscounts,
    );
  }

  OrderSummary copyWith({
    double? subtotal,
    double? deliveryFee,
    double? discount,
    double? tax,
    double? total,
    String? currency,
    List<CartDiscount>? appliedDiscounts,
  }) {
    return OrderSummary(
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      discount: discount ?? this.discount,
      tax: tax ?? this.tax,
      total: total ?? this.total,
      currency: currency ?? this.currency,
      appliedDiscounts: appliedDiscounts ?? this.appliedDiscounts,
    );
  }

  @override
  List<Object?> get props => [
        subtotal,
        deliveryFee,
        discount,
        tax,
        total,
        currency,
        appliedDiscounts,
      ];
}

class OrderStatusUpdate extends Equatable {
  final String id;
  final OrderStatus status;
  final String title;
  final String description;
  final DateTime timestamp;
  final String? location;
  final Map<String, dynamic>? metadata;

  const OrderStatusUpdate({
    required this.id,
    required this.status,
    required this.title,
    required this.description,
    required this.timestamp,
    this.location,
    this.metadata,
  });

  OrderStatusUpdate copyWith({
    String? id,
    OrderStatus? status,
    String? title,
    String? description,
    DateTime? timestamp,
    String? location,
    Map<String, dynamic>? metadata,
  }) {
    return OrderStatusUpdate(
      id: id ?? this.id,
      status: status ?? this.status,
      title: title ?? this.title,
      description: description ?? this.description,
      timestamp: timestamp ?? this.timestamp,
      location: location ?? this.location,
      metadata: metadata ?? this.metadata,
    );
  }

  @override
  List<Object?> get props => [
        id,
        status,
        title,
        description,
        timestamp,
        location,
        metadata,
      ];
}

class OrderDeliveryInfo extends Equatable {
  final String? riderId;
  final String? riderName;
  final String? riderPhone;
  final String? riderPhotoUrl;
  final double? riderLatitude;
  final double? riderLongitude;
  final String? riderVehicleType;
  final String? riderVehicleNumber;
  final DateTime? estimatedArrival;
  final double? distanceRemaining;
  final List<DeliveryTrackingPoint> trackingPoints;

  const OrderDeliveryInfo({
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

  bool get hasRiderInfo => riderId != null;

  bool get hasLocation => riderLatitude != null && riderLongitude != null;

  Duration? get estimatedTimeRemaining {
    if (estimatedArrival == null) return null;
    final now = DateTime.now();
    if (estimatedArrival!.isBefore(now)) return null;
    return estimatedArrival!.difference(now);
  }

  String get formattedDistance {
    if (distanceRemaining == null) return '';
    if (distanceRemaining! < 1000) {
      return '${distanceRemaining!.toStringAsFixed(0)}m away';
    }
    return '${(distanceRemaining! / 1000).toStringAsFixed(1)}km away';
  }

  OrderDeliveryInfo copyWith({
    String? riderId,
    String? riderName,
    String? riderPhone,
    String? riderPhotoUrl,
    double? riderLatitude,
    double? riderLongitude,
    String? riderVehicleType,
    String? riderVehicleNumber,
    DateTime? estimatedArrival,
    double? distanceRemaining,
    List<DeliveryTrackingPoint>? trackingPoints,
  }) {
    return OrderDeliveryInfo(
      riderId: riderId ?? this.riderId,
      riderName: riderName ?? this.riderName,
      riderPhone: riderPhone ?? this.riderPhone,
      riderPhotoUrl: riderPhotoUrl ?? this.riderPhotoUrl,
      riderLatitude: riderLatitude ?? this.riderLatitude,
      riderLongitude: riderLongitude ?? this.riderLongitude,
      riderVehicleType: riderVehicleType ?? this.riderVehicleType,
      riderVehicleNumber: riderVehicleNumber ?? this.riderVehicleNumber,
      estimatedArrival: estimatedArrival ?? this.estimatedArrival,
      distanceRemaining: distanceRemaining ?? this.distanceRemaining,
      trackingPoints: trackingPoints ?? this.trackingPoints,
    );
  }

  @override
  List<Object?> get props => [
        riderId,
        riderName,
        riderPhone,
        riderPhotoUrl,
        riderLatitude,
        riderLongitude,
        riderVehicleType,
        riderVehicleNumber,
        estimatedArrival,
        distanceRemaining,
        trackingPoints,
      ];
}

class DeliveryTrackingPoint extends Equatable {
  final double latitude;
  final double longitude;
  final DateTime timestamp;
  final String? description;

  const DeliveryTrackingPoint({
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.description,
  });

  DeliveryTrackingPoint copyWith({
    double? latitude,
    double? longitude,
    DateTime? timestamp,
    String? description,
  }) {
    return DeliveryTrackingPoint(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      timestamp: timestamp ?? this.timestamp,
      description: description ?? this.description,
    );
  }

  @override
  List<Object?> get props => [latitude, longitude, timestamp, description];
}

enum OrderStatus {
  placed('PLACED', 'Order Placed'),
  confirmed('CONFIRMED', 'Order Confirmed'),
  preparing('PREPARING', 'Preparing'),
  onTheWay('ON_THE_WAY', 'On the Way'),
  delivered('DELIVERED', 'Delivered'),
  cancelled('CANCELLED', 'Cancelled');

  const OrderStatus(this.value, this.displayName);

  final String value;
  final String displayName;

  static OrderStatus fromString(String value) {
    return OrderStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => OrderStatus.placed,
    );
  }
}

// Order query parameters for filtering and searching
class OrderQuery extends Equatable {
  final OrderStatus? status;
  final DateTime? fromDate;
  final DateTime? toDate;
  final int page;
  final int pageSize;
  final OrderSortBy sortBy;
  final bool ascending;

  const OrderQuery({
    this.status,
    this.fromDate,
    this.toDate,
    this.page = 1,
    this.pageSize = 20,
    this.sortBy = OrderSortBy.orderDate,
    this.ascending = false,
  });

  OrderQuery copyWith({
    OrderStatus? status,
    DateTime? fromDate,
    DateTime? toDate,
    int? page,
    int? pageSize,
    OrderSortBy? sortBy,
    bool? ascending,
  }) {
    return OrderQuery(
      status: status ?? this.status,
      fromDate: fromDate ?? this.fromDate,
      toDate: toDate ?? this.toDate,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
      sortBy: sortBy ?? this.sortBy,
      ascending: ascending ?? this.ascending,
    );
  }

  @override
  List<Object?> get props => [
        status,
        fromDate,
        toDate,
        page,
        pageSize,
        sortBy,
        ascending,
      ];
}

enum OrderSortBy {
  orderDate,
  status,
  total,
  orderNumber,
}

// Order factory for creating instances
class OrderFactory {
  static Order fromCart(
    Cart cart,
    Address deliveryAddress,
    PaymentMethod paymentMethod, {
    String? notes,
  }) {
    final now = DateTime.now();
    final orderNumber = _generateOrderNumber();

    final orderItems = cart.items.map(OrderItem.fromCartItem).toList();
    final orderSummary = OrderSummary.fromCartSummary(
      CartSummary(
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        discount: cart.discount,
        total: cart.total,
        currency: cart.currency,
      ),
    );

    final initialStatus = OrderStatusUpdate(
      id: 'status_${now.millisecondsSinceEpoch}',
      status: OrderStatus.placed,
      title: 'Order Placed',
      description: 'Your order has been successfully placed.',
      timestamp: now,
    );

    return Order(
      id: 'order_${now.millisecondsSinceEpoch}',
      orderNumber: orderNumber,
      userId: cart.userId ?? '',
      status: OrderStatus.placed,
      items: orderItems,
      summary: orderSummary,
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod,
      orderDate: now,
      statusHistory: [initialStatus],
      notes: notes,
      createdAt: now,
      updatedAt: now,
    );
  }

  static String _generateOrderNumber() {
    final now = DateTime.now();
    final year = now.year.toString().substring(2);
    final month = now.month.toString().padLeft(2, '0');
    final day = now.day.toString().padLeft(2, '0');
    final time = now.millisecondsSinceEpoch.toString().substring(8);
    return '$year$month$day$time';
  }
}

extension ListExtension<T> on List<T> {
  T? get lastOrNull => isEmpty ? null : last;
}