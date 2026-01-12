import '../client/api_client.dart';
import '../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// Order service for rider mobile app
class RiderOrderService {
  final OkadaApiClient _client;

  RiderOrderService(this._client);

  /// Get available orders for pickup
  Future<List<Order>> getAvailableOrders({
    double? latitude,
    double? longitude,
    double? radiusKm,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.riderOrders}/available',
        queryParameters: {
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (radiusKm != null) 'radiusKm': radiusKm,
        },
      );
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get rider's active orders
  Future<List<Order>> getActiveOrders() async {
    try {
      final response = await _client.get('${ApiConstants.riderOrders}/active');
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get order history
  Future<PaginatedList<Order>> getOrderHistory({
    int page = 1,
    int pageSize = 10,
    DateTime? fromDate,
    DateTime? toDate,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.riderOrders}/history',
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (fromDate != null) 'fromDate': fromDate.toIso8601String(),
          if (toDate != null) 'toDate': toDate.toIso8601String(),
        },
      );
      return PaginatedList.fromJson(response.data, Order.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Get order details
  Future<Order> getOrderById(int orderId) async {
    try {
      final response = await _client.get('${ApiConstants.riderOrders}/$orderId');
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Accept order
  Future<Order> acceptOrder(int orderId) async {
    try {
      final response = await _client.post(
        '${ApiConstants.riderOrders}/$orderId/accept',
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Reject order
  Future<void> rejectOrder(int orderId, {String? reason}) async {
    try {
      await _client.post(
        '${ApiConstants.riderOrders}/$orderId/reject',
        data: {
          if (reason != null) 'reason': reason,
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Confirm pickup
  Future<Order> confirmPickup(int orderId, {String? pickupCode}) async {
    try {
      final response = await _client.post(
        '${ApiConstants.riderOrders}/$orderId/pickup',
        data: {
          if (pickupCode != null) 'pickupCode': pickupCode,
        },
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Start delivery (in transit)
  Future<Order> startDelivery(int orderId) async {
    try {
      final response = await _client.post(
        '${ApiConstants.riderOrders}/$orderId/start-delivery',
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Confirm delivery
  Future<Order> confirmDelivery(
    int orderId, {
    String? deliveryCode,
    String? signature,
    String? photoProof,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.riderOrders}/$orderId/deliver',
        data: {
          if (deliveryCode != null) 'deliveryCode': deliveryCode,
          if (signature != null) 'signature': signature,
          if (photoProof != null) 'photoProof': photoProof,
        },
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Report delivery issue
  Future<void> reportIssue({
    required int orderId,
    required String issueType,
    required String description,
    List<String>? images,
  }) async {
    try {
      await _client.post(
        '${ApiConstants.riderOrders}/$orderId/issue',
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

  /// Mark delivery as failed
  Future<Order> markDeliveryFailed(
    int orderId, {
    required String reason,
    List<String>? images,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.riderOrders}/$orderId/failed',
        data: {
          'reason': reason,
          if (images != null) 'images': images,
        },
      );
      return Order.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Update rider location for order
  Future<void> updateLocation({
    required int orderId,
    required double latitude,
    required double longitude,
    double? heading,
    double? speed,
  }) async {
    try {
      await _client.post(
        '${ApiConstants.riderOrders}/$orderId/location',
        data: {
          'latitude': latitude,
          'longitude': longitude,
          if (heading != null) 'heading': heading,
          if (speed != null) 'speed': speed,
        },
      );
    } catch (e) {
      // Silently fail for location updates
    }
  }

  /// Get optimized route for batch orders
  Future<Map<String, dynamic>> getOptimizedRoute(List<int> orderIds) async {
    try {
      final response = await _client.post(
        '${ApiConstants.riderOrders}/optimize-route',
        data: {'orderIds': orderIds},
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  /// Get today's summary
  Future<Map<String, dynamic>> getTodaySummary() async {
    try {
      final response = await _client.get('${ApiConstants.riderOrders}/today-summary');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }
}
