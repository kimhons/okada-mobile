import '../client/api_client.dart';
import '../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// Store service for mobile apps
class StoreService {
  final OkadaApiClient _client;

  StoreService(this._client);

  /// Get all stores with pagination
  Future<PaginatedList<Store>> getStores({
    int page = 1,
    int pageSize = 20,
    String? search,
    String? category,
    double? latitude,
    double? longitude,
    double? radiusKm,
    String? sortBy,
    bool? isOpen,
  }) async {
    try {
      final response = await _client.get(
        ApiConstants.customerStores,
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (search != null && search.isNotEmpty) 'search': search,
          if (category != null) 'category': category,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (radiusKm != null) 'radiusKm': radiusKm,
          if (sortBy != null) 'sortBy': sortBy,
          if (isOpen != null) 'isOpen': isOpen,
        },
      );
      return PaginatedList.fromJson(response.data, Store.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Get store by ID
  Future<Store> getStoreById(int id) async {
    try {
      final response = await _client.get('${ApiConstants.customerStores}/$id');
      return Store.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get nearby stores
  Future<List<Store>> getNearbyStores({
    required double latitude,
    required double longitude,
    double radiusKm = 5.0,
    int limit = 10,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerStores}/nearby',
        queryParameters: {
          'latitude': latitude,
          'longitude': longitude,
          'radiusKm': radiusKm,
          'limit': limit,
        },
      );
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get store products
  Future<PaginatedList<Product>> getStoreProducts(
    int storeId, {
    int page = 1,
    int pageSize = 20,
    int? categoryId,
    String? search,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerStores}/$storeId/products',
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (categoryId != null) 'categoryId': categoryId,
          if (search != null && search.isNotEmpty) 'search': search,
        },
      );
      return PaginatedList.fromJson(response.data, Product.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Get store reviews
  Future<PaginatedList<Review>> getStoreReviews(
    int storeId, {
    int page = 1,
    int pageSize = 10,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerStores}/$storeId/reviews',
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
        },
      );
      return PaginatedList.fromJson(response.data, Review.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Add store to favorites
  Future<void> addToFavorites(int storeId) async {
    try {
      await _client.post('${ApiConstants.customerFavorites}/stores/$storeId');
    } catch (e) {
      rethrow;
    }
  }

  /// Remove store from favorites
  Future<void> removeFromFavorites(int storeId) async {
    try {
      await _client.delete('${ApiConstants.customerFavorites}/stores/$storeId');
    } catch (e) {
      rethrow;
    }
  }

  /// Get favorite stores
  Future<List<Store>> getFavoriteStores() async {
    try {
      final response = await _client.get('${ApiConstants.customerFavorites}/stores');
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Store.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }
}
