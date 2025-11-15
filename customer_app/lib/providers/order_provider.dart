import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/api/okada_api_client.dart';

/// Order State
class OrderState {
  final List<Order> orders;
  final Order? selectedOrder;
  final bool isLoading;
  final String? error;
  final Map<String, List<String>> qualityPhotos; // orderId -> photo URLs

  const OrderState({
    this.orders = const [],
    this.selectedOrder,
    this.isLoading = false,
    this.error,
    this.qualityPhotos = const {},
  });

  OrderState copyWith({
    List<Order>? orders,
    Order? selectedOrder,
    bool? isLoading,
    String? error,
    Map<String, List<String>>? qualityPhotos,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      selectedOrder: selectedOrder ?? this.selectedOrder,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      qualityPhotos: qualityPhotos ?? this.qualityPhotos,
    );
  }
}

/// Order Notifier
class OrderNotifier extends StateNotifier<OrderState> {
  final OkadaApiClient _apiClient;

  OrderNotifier(this._apiClient) : super(const OrderState());

  /// Fetch all orders for the current user
  Future<void> fetchOrders() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.getOrders();
      
      if (response.statusCode == 200 && response.data != null) {
        final ordersData = response.data as List;
        final orders = ordersData
            .map((json) => Order.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(
          orders: orders,
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Failed to fetch orders',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Fetch a specific order by ID
  Future<void> fetchOrderById(String orderId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.getOrderById(orderId);
      
      if (response.statusCode == 200 && response.data != null) {
        final order = Order.fromJson(response.data as Map<String, dynamic>);

        state = state.copyWith(
          selectedOrder: order,
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Failed to fetch order details',
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Fetch quality verification photos for an order
  Future<List<String>> fetchQualityPhotos(String orderId) async {
    try {
      // Get quality verification by order ID
      final data = await _apiClient.getQualityVerification(int.parse(orderId));
      
      final photos = (data['photos'] as List?)
              ?.map((photo) => photo['url'] as String)
              .toList() ??
          [];

      // Update state with photos
      final updatedPhotos = Map<String, List<String>>.from(state.qualityPhotos);
      updatedPhotos[orderId] = photos;

      state = state.copyWith(qualityPhotos: updatedPhotos);

      return photos;
    } catch (e) {
      throw Exception('Error fetching quality photos: $e');
    }
  }

  /// Approve quality verification for an order
  Future<void> approveQualityVerification(String orderId) async {
    try {
      await _apiClient.approveQualityVerification(int.parse(orderId));
      
      // Update order status in state
      final updatedOrders = state.orders.map((order) {
        if (order.id == orderId) {
          return order.copyWith(status: 'approved');
        }
        return order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);

      // Refresh the selected order if it matches
      if (state.selectedOrder?.id == orderId) {
        await fetchOrderById(orderId);
      }
    } catch (e) {
      throw Exception('Error approving order: $e');
    }
  }

  /// Reject quality verification for an order
  Future<void> rejectQualityVerification(
    String orderId, {
    required String reason,
  }) async {
    try {
      await _apiClient.rejectQualityVerification(
        int.parse(orderId),
        reason: reason,
      );
      
      // Update order status in state
      final updatedOrders = state.orders.map((order) {
        if (order.id == orderId) {
          return order.copyWith(status: 'rejected');
        }
        return order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);

      // Refresh the selected order if it matches
      if (state.selectedOrder?.id == orderId) {
        await fetchOrderById(orderId);
      }
    } catch (e) {
      throw Exception('Error rejecting order: $e');
    }
  }

  /// Create a new order
  Future<Order?> createOrder({
    required List<OrderItem> items,
    required String deliveryAddressId,
    required String paymentMethod,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiClient.createOrder(
        items: items.map((item) => item.toJson()).toList(),
        deliveryAddressId: deliveryAddressId,
        paymentMethod: paymentMethod,
      );
      
      if (response.statusCode == 201 && response.data != null) {
        final order = Order.fromJson(response.data as Map<String, dynamic>);

        // Add to orders list
        final updatedOrders = [...state.orders, order];

        state = state.copyWith(
          orders: updatedOrders,
          selectedOrder: order,
          isLoading: false,
        );

        return order;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Failed to create order',
        );
        return null;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      return null;
    }
  }

  /// Cancel an order
  Future<void> cancelOrder(String orderId, {String? reason}) async {
    try {
      final response = await _apiClient.cancelOrder(orderId, reason: reason);
      
      if (response.statusCode == 200) {
        // Update order status in state
        final updatedOrders = state.orders.map((order) {
          if (order.id == orderId) {
            return order.copyWith(status: 'cancelled');
          }
          return order;
        }).toList();

        state = state.copyWith(orders: updatedOrders);

        // Refresh the selected order if it matches
        if (state.selectedOrder?.id == orderId) {
          await fetchOrderById(orderId);
        }
      } else {
        throw Exception('Failed to cancel order');
      }
    } catch (e) {
      throw Exception('Error cancelling order: $e');
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Order Provider
final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return OrderNotifier(apiClient);
});

/// Selected Order Provider (for convenience)
final selectedOrderProvider = Provider<Order?>((ref) {
  return ref.watch(orderProvider).selectedOrder;
});

/// Order Models
class Order {
  final String id;
  final String userId;
  final String status;
  final double totalAmount;
  final String currency;
  final List<OrderItem> items;
  final DeliveryAddress? deliveryAddress;
  final String? riderId;
  final DateTime createdAt;
  final DateTime? deliveredAt;
  final String? paymentMethod;
  final String? paymentStatus;

  const Order({
    required this.id,
    required this.userId,
    required this.status,
    required this.totalAmount,
    this.currency = 'FCFA',
    required this.items,
    this.deliveryAddress,
    this.riderId,
    required this.createdAt,
    this.deliveredAt,
    this.paymentMethod,
    this.paymentStatus,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      status: json['status'] as String,
      totalAmount: (json['total_amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'FCFA',
      items: (json['items'] as List?)
              ?.map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      deliveryAddress: json['delivery_address'] != null
          ? DeliveryAddress.fromJson(
              json['delivery_address'] as Map<String, dynamic>)
          : null,
      riderId: json['rider_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      deliveredAt: json['delivered_at'] != null
          ? DateTime.parse(json['delivered_at'] as String)
          : null,
      paymentMethod: json['payment_method'] as String?,
      paymentStatus: json['payment_status'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'status': status,
      'total_amount': totalAmount,
      'currency': currency,
      'items': items.map((item) => item.toJson()).toList(),
      'delivery_address': deliveryAddress?.toJson(),
      'rider_id': riderId,
      'created_at': createdAt.toIso8601String(),
      'delivered_at': deliveredAt?.toIso8601String(),
      'payment_method': paymentMethod,
      'payment_status': paymentStatus,
    };
  }

  Order copyWith({
    String? id,
    String? userId,
    String? status,
    double? totalAmount,
    String? currency,
    List<OrderItem>? items,
    DeliveryAddress? deliveryAddress,
    String? riderId,
    DateTime? createdAt,
    DateTime? deliveredAt,
    String? paymentMethod,
    String? paymentStatus,
  }) {
    return Order(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      status: status ?? this.status,
      totalAmount: totalAmount ?? this.totalAmount,
      currency: currency ?? this.currency,
      items: items ?? this.items,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      riderId: riderId ?? this.riderId,
      createdAt: createdAt ?? this.createdAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentStatus: paymentStatus ?? this.paymentStatus,
    );
  }
}

class OrderItem {
  final String productId;
  final String productName;
  final int quantity;
  final double price;
  final String? imageUrl;

  const OrderItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.price,
    this.imageUrl,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['product_id'] as String,
      productName: json['product_name'] as String,
      quantity: json['quantity'] as int,
      price: (json['price'] as num).toDouble(),
      imageUrl: json['image_url'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'product_name': productName,
      'quantity': quantity,
      'price': price,
      'image_url': imageUrl,
    };
  }
}

class DeliveryAddress {
  final String id;
  final String street;
  final String city;
  final String? state;
  final String? postalCode;
  final String country;
  final double? latitude;
  final double? longitude;

  const DeliveryAddress({
    required this.id,
    required this.street,
    required this.city,
    this.state,
    this.postalCode,
    this.country = 'Cameroon',
    this.latitude,
    this.longitude,
  });

  factory DeliveryAddress.fromJson(Map<String, dynamic> json) {
    return DeliveryAddress(
      id: json['id'] as String,
      street: json['street'] as String,
      city: json['city'] as String,
      state: json['state'] as String?,
      postalCode: json['postal_code'] as String?,
      country: json['country'] as String? ?? 'Cameroon',
      latitude: json['latitude'] as double?,
      longitude: json['longitude'] as double?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'street': street,
      'city': city,
      'state': state,
      'postal_code': postalCode,
      'country': country,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

