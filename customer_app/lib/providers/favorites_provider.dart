import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/api/okada_api_client.dart';

// Product model (simplified for favorites)
class FavoriteProduct {
  final String id;
  final String name;
  final int price;
  final String seller;
  final String? imageUrl;

  FavoriteProduct({
    required this.id,
    required this.name,
    required this.price,
    required this.seller,
    this.imageUrl,
  });

  factory FavoriteProduct.fromJson(Map<String, dynamic> json) {
    return FavoriteProduct(
      id: json['id'] as String,
      name: json['name'] as String,
      price: json['price'] as int,
      seller: json['seller'] as String,
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'seller': seller,
      'imageUrl': imageUrl,
    };
  }
}

// Favorites state
class FavoritesState {
  final List<FavoriteProduct> favorites;
  final bool isLoading;
  final String? error;

  FavoritesState({
    this.favorites = const [],
    this.isLoading = false,
    this.error,
  });

  FavoritesState copyWith({
    List<FavoriteProduct>? favorites,
    bool? isLoading,
    String? error,
  }) {
    return FavoritesState(
      favorites: favorites ?? this.favorites,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  bool isFavorite(String productId) {
    return favorites.any((p) => p.id == productId);
  }
}

// Favorites provider
class FavoritesNotifier extends StateNotifier<FavoritesState> {
  final OkadaApiClient _apiClient;

  FavoritesNotifier(this._apiClient) : super(FavoritesState()) {
    loadFavorites();
  }

  Future<void> loadFavorites() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 1));

      // Mock favorites
      final favorites = [
        FavoriteProduct(
          id: '1',
          name: 'iPhone 13',
          price: 440000,
          seller: 'Mobitech',
        ),
        FavoriteProduct(
          id: '2',
          name: 'AirPods',
          price: 100000,
          seller: 'Sound Wave',
        ),
        FavoriteProduct(
          id: '3',
          name: 'Galaxy Z Fold3',
          price: 780000,
          seller: 'TechXpress',
        ),
        FavoriteProduct(
          id: '4',
          name: 'Leather Handbag',
          price: 45000,
          seller: 'Fashion Hub',
        ),
      ];

      state = state.copyWith(favorites: favorites, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load favorites: $e',
      );
    }
  }

  Future<void> addToFavorites(FavoriteProduct product) async {
    if (state.isFavorite(product.id)) {
      return; // Already in favorites
    }

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedFavorites = [...state.favorites, product];
      state = state.copyWith(favorites: updatedFavorites);
    } catch (e) {
      state = state.copyWith(error: 'Failed to add to favorites: $e');
    }
  }

  Future<void> removeFromFavorites(String productId) async {
    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedFavorites =
          state.favorites.where((p) => p.id != productId).toList();
      state = state.copyWith(favorites: updatedFavorites);
    } catch (e) {
      state = state.copyWith(error: 'Failed to remove from favorites: $e');
    }
  }

  Future<void> toggleFavorite(FavoriteProduct product) async {
    if (state.isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
  }
}

// Provider instance
final favoritesProvider =
    StateNotifierProvider<FavoritesNotifier, FavoritesState>((ref) {
  final apiClient = ref.watch(okadaApiClientProvider);
  return FavoritesNotifier(apiClient);
});

// Favorite status provider for a specific product
final isFavoriteProvider = Provider.family<bool, String>((ref, productId) {
  return ref.watch(favoritesProvider).isFavorite(productId);
});

// Favorites count provider
final favoritesCountProvider = Provider<int>((ref) {
  return ref.watch(favoritesProvider).favorites.length;
});

