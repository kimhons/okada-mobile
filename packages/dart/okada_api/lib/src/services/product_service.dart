import '../client/api_client.dart';
import '../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

/// Product and Category service for mobile apps
class ProductService {
  final OkadaApiClient _client;

  ProductService(this._client);

  /// Get all categories
  Future<List<Category>> getCategories({bool? activeOnly}) async {
    try {
      final response = await _client.get(
        ApiConstants.customerCategories,
        queryParameters: {
          if (activeOnly != null) 'activeOnly': activeOnly,
        },
      );
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get category by ID
  Future<Category> getCategoryById(int id) async {
    try {
      final response = await _client.get('${ApiConstants.customerCategories}/$id');
      return Category.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get products with pagination and filters
  Future<PaginatedList<Product>> getProducts({
    int page = 1,
    int pageSize = 20,
    int? categoryId,
    int? storeId,
    String? search,
    String? sortBy,
    bool? sortDesc,
    double? minPrice,
    double? maxPrice,
    bool? inStock,
    bool? featured,
  }) async {
    try {
      final response = await _client.get(
        ApiConstants.customerProducts,
        queryParameters: {
          'page': page,
          'pageSize': pageSize,
          if (categoryId != null) 'categoryId': categoryId,
          if (storeId != null) 'storeId': storeId,
          if (search != null && search.isNotEmpty) 'search': search,
          if (sortBy != null) 'sortBy': sortBy,
          if (sortDesc != null) 'sortDesc': sortDesc,
          if (minPrice != null) 'minPrice': minPrice,
          if (maxPrice != null) 'maxPrice': maxPrice,
          if (inStock != null) 'inStock': inStock,
          if (featured != null) 'featured': featured,
        },
      );
      return PaginatedList.fromJson(response.data, Product.fromJson);
    } catch (e) {
      rethrow;
    }
  }

  /// Get product by ID
  Future<Product> getProductById(int id) async {
    try {
      final response = await _client.get('${ApiConstants.customerProducts}/$id');
      return Product.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  /// Get featured products
  Future<List<Product>> getFeaturedProducts({int limit = 10}) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerProducts}/featured',
        queryParameters: {'limit': limit},
      );
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get deals/discounted products
  Future<List<Product>> getDeals({int limit = 10}) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerProducts}/deals',
        queryParameters: {'limit': limit},
      );
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get new arrivals
  Future<List<Product>> getNewArrivals({int limit = 10}) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerProducts}/new',
        queryParameters: {'limit': limit},
      );
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Get recommended products
  Future<List<Product>> getRecommendedProducts({int limit = 10}) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerProducts}/recommended',
        queryParameters: {'limit': limit},
      );
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      rethrow;
    }
  }

  /// Search products
  Future<PaginatedList<Product>> searchProducts(
    String query, {
    int page = 1,
    int pageSize = 20,
  }) async {
    return getProducts(page: page, pageSize: pageSize, search: query);
  }

  /// Get product reviews
  Future<PaginatedList<Review>> getProductReviews(
    int productId, {
    int page = 1,
    int pageSize = 10,
  }) async {
    try {
      final response = await _client.get(
        '${ApiConstants.customerProducts}/$productId/reviews',
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

  /// Add product review
  Future<Review> addProductReview({
    required int productId,
    required double rating,
    String? comment,
    List<String>? images,
  }) async {
    try {
      final response = await _client.post(
        '${ApiConstants.customerProducts}/$productId/reviews',
        data: {
          'rating': rating,
          if (comment != null) 'comment': comment,
          if (images != null) 'images': images,
        },
      );
      return Review.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
