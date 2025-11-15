import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/api/okada_api_client.dart';
import 'auth_provider.dart';

/// Product list state
class ProductsState {
  final List<Map<String, dynamic>> products;
  final bool isLoading;
  final bool hasMore;
  final int currentPage;
  final String? error;

  const ProductsState({
    this.products = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.currentPage = 1,
    this.error,
  });

  ProductsState copyWith({
    List<Map<String, dynamic>>? products,
    bool? isLoading,
    bool? hasMore,
    int? currentPage,
    String? error,
  }) {
    return ProductsState(
      products: products ?? this.products,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      error: error,
    );
  }
}

/// Products state notifier
class ProductsNotifier extends StateNotifier<ProductsState> {
  final OkadaApiClient apiClient;

  ProductsNotifier(this.apiClient) : super(const ProductsState()) {
    loadProducts();
  }

  /// Load products (first page or refresh)
  Future<void> loadProducts({bool refresh = false}) async {
    if (state.isLoading) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      products: refresh ? [] : state.products,
      currentPage: refresh ? 1 : state.currentPage,
    );

    try {
      final response = await apiClient.listProducts(
        page: refresh ? 1 : state.currentPage,
        perPage: 20,
      );

      final products = response['data'] as List<dynamic>;
      final meta = response['meta'] as Map<String, dynamic>;
      final hasMore = meta['current_page'] < meta['last_page'];

      state = state.copyWith(
        products: refresh
            ? products.cast<Map<String, dynamic>>()
            : [...state.products, ...products.cast<Map<String, dynamic>>()],
        isLoading: false,
        hasMore: hasMore,
        currentPage: meta['current_page'] as int,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Load next page
  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoading) return;

    state = state.copyWith(currentPage: state.currentPage + 1);
    await loadProducts();
  }

  /// Search products
  Future<void> searchProducts(String query) async {
    if (query.isEmpty) {
      await loadProducts(refresh: true);
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiClient.searchProducts(
        query: query,
        page: 1,
        perPage: 20,
      );

      final products = response['data'] as List<dynamic>;
      final meta = response['meta'] as Map<String, dynamic>;
      final hasMore = meta['current_page'] < meta['last_page'];

      state = state.copyWith(
        products: products.cast<Map<String, dynamic>>(),
        isLoading: false,
        hasMore: hasMore,
        currentPage: 1,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Filter by category
  Future<void> filterByCategory(int categoryId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiClient.listProducts(
        page: 1,
        perPage: 20,
        categoryId: categoryId,
      );

      final products = response['data'] as List<dynamic>;
      final meta = response['meta'] as Map<String, dynamic>;
      final hasMore = meta['current_page'] < meta['last_page'];

      state = state.copyWith(
        products: products.cast<Map<String, dynamic>>(),
        isLoading: false,
        hasMore: hasMore,
        currentPage: 1,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

/// Products provider
final productsProvider = StateNotifierProvider<ProductsNotifier, ProductsState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProductsNotifier(apiClient);
});

/// Categories state
class CategoriesState {
  final List<Map<String, dynamic>> categories;
  final bool isLoading;
  final String? error;

  const CategoriesState({
    this.categories = const [],
    this.isLoading = false,
    this.error,
  });

  CategoriesState copyWith({
    List<Map<String, dynamic>>? categories,
    bool? isLoading,
    String? error,
  }) {
    return CategoriesState(
      categories: categories ?? this.categories,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Categories notifier
class CategoriesNotifier extends StateNotifier<CategoriesState> {
  final OkadaApiClient apiClient;

  CategoriesNotifier(this.apiClient) : super(const CategoriesState()) {
    loadCategories();
  }

  Future<void> loadCategories() async {
    if (state.isLoading) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final categories = await apiClient.listCategories();

      state = state.copyWith(
        categories: categories.cast<Map<String, dynamic>>(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
}

/// Categories provider
final categoriesProvider = StateNotifierProvider<CategoriesNotifier, CategoriesState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CategoriesNotifier(apiClient);
});

