import '../client/api_client.dart';
import '../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// Order service for customer mobile app
class CustomerOrderService {
  final OkadaApiClient _client;

  CustomerOrderService(this._client);

  /// Create new order
  Future<Order> createOrder({
    required DeliveryAddress deliveryAddress,
    required String paymentMethod,
    String? notes,
    DateTime? scheduledAt,
    double? tip,
  }) async {
    try {
      final response = await _client.post(
        ApiConstants.customerOrders,
        data: {
          'deliveryAddress': deliveryAddress.toJson(),
          'paymentMethod': paymentMethod,
          if (notes != null) 'notes': notes,
          if (scheduledAt != null) 'scheduledAt': scheduledAt.toIso8601String(),
          if (tip != null) 'tip': tip,
        },
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get orders with pagination
  Future<PaginatedList<Order>> getOrders({
    int page = 1,
    int pageSize = 10,
    String? status,
    DateTime? fromDate,
    DateTime? toDate,
  }) async {
    try {
      final response = await _client.get(
        ApiConstants.customerOrders,
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (status != null) 'status': status,
          if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
          if (toDate != null) 'toDate': toDate.toIso8601String(),
        },
      );
      return PaginatedList.fromJson(response.data, Order.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Get active orders
  Future<List<Order>> getActiveOrders() async {
    try {
      final response = await _client.get('${ApiConstants.customerOrders}/active');
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get order by ID
  Future<Order> getOrderById(int id) async {
    try {
      final response = await _client.get('${ApiConstants.customerOrders}/$id');
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get order by order number
  Future<Order> getOrderByNumber(String orderNumber) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerOrders}/number/$orderNumber',
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
        '${ApiConstants.customerOrders}/$orderId/cancel',
        data: {
          if (reason != null) 'reason': reason,
        },
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get order tracking
  Future<OrderTracking> getOrderTracking(int orderId) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerOrders}/$orderId/tracking',
      );
      return OrderTracking.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Rate order
  Future<void> rateOrder({
    required int orderId,
    required double rating,
    String? comment,
    double? riderRating,
    String? riderComment,
  }) async {
    try {
      await _client.post(
        '${ApiConstants.customerOrders}/$orderId/rate',
        data: {
          'rating': rating,
          if (comment != null) 'comment': comment,
          if (riderRating != null) 'riderRating': riderRating,
          if (riderComment != null) 'riderComment': riderComment,
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Report issue with order
  Future<void> reportIssue({
    required int orderId,
    required String issueType,
    required String description,
    List<String>? images,
  }) async {
    try {
      await _client.post(
        '${ApiConstants.customerOrders}/$orderId/issue',
        data: {
          'issueType': issueType,
          'description': description,
          if (images != null) 'images': images,
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Reorder from previous order
  Future<Cart> reorder(int orderId) async {
    try {
      final response = await _client.post(
        '${ApiConstants.customerOrders}/$orderId/reorder',
      );
      return Cart.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get order receipt/invoice
  Future<Map<String, dynamic>> getOrderReceipt(int orderId) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerOrders}/$orderId/receipt',
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  /// Get scheduled orders
  Future<List<Order>> getScheduledOrders() async {
    try {
      final response = await _client.get('${ApiConstants.customerOrders}/scheduled');
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Update scheduled order time
  Future<Order> updateScheduledTime(int orderId, DateTime newTime) async {
    try {
      final response = await _client.patch(
        '${ApiConstants.customerOrders}/$orderId/schedule',
        data: {'scheduledAt': newTime.toIso8601String()},
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
