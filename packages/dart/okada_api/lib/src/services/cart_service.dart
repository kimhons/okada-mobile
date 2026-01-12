import '../client/api_client.dart';
import '../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// Cart service for mobile apps
class CartService {
  final OkadaApiClient _client;

  CartService(this._client);

  /// Get current cart
  Future<Cart> getCart() async {
    try {
      final response = await _client.get(ApiConstants.customerCart);
      return Cart.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Add item to cart
  Future<Cart> addToCart({
    required int productId,
    int quantity = 1,
    String? notes,
    Map<String, dynamic>? options,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.customerCart}/items',
        data: {
          'productId': productId,
          'quantity': quantity,
          if (notes != null) 'notes': notes,
          if (options != null) 'options': options,
        },
      );
      return Cart.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Update cart item quantity
  Future<Cart> updateCartItem({
    required int productId,
    required int quantity,
    String? notes,
  }) async {
    try {
      final response = await _client.patch(
        '${ApiConstants.customerCart}/items/$productId',
        data: {
          'quantity': quantity,
          if (notes != null) 'notes': notes,
        },
      );
      return Cart.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Remove item from cart
  Future<Cart> removeFromCart(int productId) async {
    try {
      final response = await _client.delete(
        '${ApiConstants.customerCart}/items/$productId',
      );
      return Cart.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Clear cart
  Future<void> clearCart() async {
    try {
      await _client.delete(ApiConstants.customerCart);
    } catch (e) {
      rethrow;
    }
  }

  /// Apply promo code
  Future<Cart> applyPromoCode(String code) async {
    try {
      final response = await _client.post(
        '${ApiConstants.customerCart}/promo',
        data: {'code': code},
      );
      return Cart.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Remove promo code
  Future<Cart> removePromoCode() async {
    try {
      final response = await _client.delete('${ApiConstants.customerCart}/promo');
      return Cart.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Calculate delivery fee for address
  Future<double> calculateDeliveryFee({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.customerCart}/delivery-fee',
        data: {
          'latitude': latitude,
          'longitude': longitude,
        },
      );
      return (response.data['deliveryFee'] as num).toDouble();
    } catch (e) {
      rethrow;
    }
  }

  /// Validate cart before checkout
  Future<Map<String, dynamic>> validateCart() async {
    try {
      final response = await _client.post('${ApiConstants.customerCart}/validate');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }
}
