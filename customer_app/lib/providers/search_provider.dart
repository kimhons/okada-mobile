import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/api/okada_api_client.dart';

// Search state
class SearchState {
  final String query;
  final List<Product> results;
  final bool isLoading;
  final String? error;
  final String? selectedCategory;
  final String? selectedSort;
  final List<String> recentSearches;

  SearchState({
    this.query = '',
    this.results = const [],
    this.isLoading = false,
    this.error,
    this.selectedCategory,
    this.selectedSort = 'relevance',
    this.recentSearches = const [],
  });

  SearchState copyWith({
    String? query,
    List<Product>? results,
    bool? isLoading,
    String? error,
    String? selectedCategory,
    String? selectedSort,
    List<String>? recentSearches,
  }) {
    return SearchState(
      query: query ?? this.query,
      results: results ?? this.results,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      selectedSort: selectedSort ?? this.selectedSort,
      recentSearches: recentSearches ?? this.recentSearches,
    );
  }
}

// Product model (simplified)
class Product {
  final String id;
  final String name;
  final int price;
  final String seller;
  final String? imageUrl;
  final String category;
  final double? rating;
  final int? reviewCount;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.seller,
    this.imageUrl,
    required this.category,
    this.rating,
    this.reviewCount,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      price: json['price'] as int,
      seller: json['seller'] as String,
      imageUrl: json['image_url'] as String?,
      category: json['category'] as String,
      rating: json['rating'] as double?,
      reviewCount: json['review_count'] as int?,
    );
  }
}

// Search provider
class SearchNotifier extends StateNotifier<SearchState> {
  final OkadaApiClient _apiClient;

  SearchNotifier(this._apiClient) : super(SearchState());

  // Search products
  Future<void> search(String query) async {
    if (query.trim().isEmpty) {
      state = state.copyWith(query: '', results: []);
      return;
    }

    state = state.copyWith(
      query: query,
      isLoading: true,
      error: null,
    );

    try {
      final response = await _apiClient.get(
        '/products/search',
        queryParameters: {
          'q': query,
          if (state.selectedCategory != null && state.selectedCategory != 'All')
            'category': state.selectedCategory,
          if (state.selectedSort != null) 'sort': state.selectedSort,
        },
      );

      final products = (response['products'] as List)
          .map((json) => Product.fromJson(json as Map<String, dynamic>))
          .toList();

      state = state.copyWith(
        isLoading: false,
        results: products,
      );

      // Add to recent searches
      _addToRecentSearches(query);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Search failed: ${e.toString()}',
      );
    }
  }

  // Set category filter
  void setCategory(String? category) {
    state = state.copyWith(selectedCategory: category);
    if (state.query.isNotEmpty) {
      search(state.query);
    }
  }

  // Set sort option
  void setSort(String sort) {
    state = state.copyWith(selectedSort: sort);
    if (state.query.isNotEmpty) {
      search(state.query);
    }
  }

  // Get recent searches
  Future<void> loadRecentSearches() async {
    try {
      final response = await _apiClient.get('/users/me/recent-searches');
      final searches = (response['searches'] as List)
          .map((s) => s as String)
          .toList();
      
      state = state.copyWith(recentSearches: searches);
    } catch (e) {
      // Silently fail - recent searches are not critical
    }
  }

  // Add to recent searches
  Future<void> _addToRecentSearches(String query) async {
    try {
      await _apiClient.post(
        '/users/me/recent-searches',
        data: {'query': query},
      );

      // Update local state
      final updatedSearches = [query, ...state.recentSearches]
          .toSet()
          .take(10)
          .toList();
      
      state = state.copyWith(recentSearches: updatedSearches);
    } catch (e) {
      // Silently fail - recent searches are not critical
    }
  }

  // Clear recent searches
  Future<void> clearRecentSearches() async {
    try {
      await _apiClient.delete('/users/me/recent-searches');
      state = state.copyWith(recentSearches: []);
    } catch (e) {
      state = state.copyWith(error: 'Failed to clear searches: ${e.toString()}');
    }
  }

  // Clear search
  void clear() {
    state = state.copyWith(
      query: '',
      results: [],
      error: null,
    );
  }

  // Reset filters
  void resetFilters() {
    state = state.copyWith(
      selectedCategory: null,
      selectedSort: 'relevance',
    );
    if (state.query.isNotEmpty) {
      search(state.query);
    }
  }
}

// Provider
final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SearchNotifier(apiClient);
});

// API client provider (placeholder - should be defined in shared library)
final apiClientProvider = Provider<OkadaApiClient>((ref) {
  return OkadaApiClient(baseUrl: 'https://api.okada.cm/v1');
});

