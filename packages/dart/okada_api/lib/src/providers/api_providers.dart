import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../client/api_client.dart';
import '../services/auth_service.dart';
import '../services/product_service.dart';
import '../services/store_service.dart';
import '../services/cart_service.dart';
import '../services/customer_order_service.dart';
import '../services/rider_order_service.dart';
import '../services/rider_earnings_service.dart';
import '../services/websocket/websocket_service.dart';
import '../services/payment/payment_service.dart';
import '../services/payment/mtn_momo_service.dart';
import '../services/payment/orange_money_service.dart';
import '../models/api_models.dart';
import 'package:okada_core/okada_core.dart';

// ============ API CLIENT PROVIDER ============

/// API Client singleton provider
final apiClientProvider = Provider<OkadaApiClient>((ref) {
  return OkadaApiClient.instance;
});

// ============ SERVICE PROVIDERS ============

/// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthService(client);
});

/// Rider auth service provider
final riderAuthServiceProvider = Provider<RiderAuthService>((ref) {
  final client = ref.watch(apiClientProvider);
  return RiderAuthService(client);
});

/// Product service provider
final productServiceProvider = Provider<ProductService>((ref) {
  final client = ref.watch(apiClientProvider);
  return ProductService(client);
});

/// Store service provider
final storeServiceProvider = Provider<StoreService>((ref) {
  final client = ref.watch(apiClientProvider);
  return StoreService(client);
});

/// Cart service provider
final cartServiceProvider = Provider<CartService>((ref) {
  final client = ref.watch(apiClientProvider);
  return CartService(client);
});

/// Customer order service provider
final customerOrderServiceProvider = Provider<CustomerOrderService>((ref) {
  final client = ref.watch(apiClientProvider);
  return CustomerOrderService(client);
});

/// Rider order service provider
final riderOrderServiceProvider = Provider<RiderOrderService>((ref) {
  final client = ref.watch(apiClientProvider);
  return RiderOrderService(client);
});

/// Rider earnings service provider
final riderEarningsServiceProvider = Provider<RiderEarningsService>((ref) {
  final client = ref.watch(apiClientProvider);
  return RiderEarningsService(client);
});

/// Payment service provider
final paymentServiceProvider = Provider<PaymentService>((ref) {
  final client = ref.watch(apiClientProvider);
  return PaymentService(client);
});

/// MTN MoMo service provider
final mtnMomoServiceProvider = Provider<MtnMomoService>((ref) {
  final client = ref.watch(apiClientProvider);
  return MtnMomoService(client);
});

/// Orange Money service provider
final orangeMoneyServiceProvider = Provider<OrangeMoneyService>((ref) {
  final client = ref.watch(apiClientProvider);
  return OrangeMoneyService(client);
});

// ============ WEBSOCKET PROVIDER ============

/// WebSocket service provider
final webSocketServiceProvider = Provider<WebSocketService>((ref) {
  final client = ref.watch(apiClientProvider);
  return WebSocketService.getInstance(
    baseUrl: client.baseUrl ?? '',
    authToken: client.accessToken,
  );
});

// ============ AUTH STATE PROVIDERS ============

/// Current user state
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) =>
      AuthState(
        user: user ?? this.user,
        isLoading: isLoading ?? this.isLoading,
        error: error,
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      );
}

/// Auth state notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState());

  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.getCurrentUser();
      state = AuthState(
        user: user,
        isAuthenticated: user != null,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
        isAuthenticated: false,
      );
    }
  }

  Future<bool> requestOtp(String phone) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final success = await _authService.requestOtp(phone);
      state = state.copyWith(isLoading: false);
      return success;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> verifyOtp(String phone, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.verifyOtp(OtpVerifyRequest(
        phone: phone,
        otp: otp,
      ));
      await checkAuthStatus();
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      await _authService.logout();
    } finally {
      state = const AuthState();
    }
  }

  Future<void> updateProfile({String? name, String? email}) async {
    if (state.user == null) return;
    state = state.copyWith(isLoading: true, error: null);
    try {
      final updatedUser = await _authService.updateProfile(
        ProfileUpdateRequest(name: name, email: email),
      );
      state = state.copyWith(user: updatedUser, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

/// Auth state provider
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

/// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authStateProvider).isAuthenticated;
});

/// Current user provider
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authStateProvider).user;
});

// ============ CART STATE PROVIDERS ============

/// Cart state
class CartState {
  final Cart? cart;
  final bool isLoading;
  final String? error;

  const CartState({
    this.cart,
    this.isLoading = false,
    this.error,
  });

  CartState copyWith({
    Cart? cart,
    bool? isLoading,
    String? error,
  }) =>
      CartState(
        cart: cart ?? this.cart,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );

  int get itemCount => cart?.itemCount ?? 0;
  double get total => cart?.total ?? 0;
  bool get isEmpty => cart?.isEmpty ?? true;
}

/// Cart state notifier
class CartNotifier extends StateNotifier<CartState> {
  final CartService _cartService;

  CartNotifier(this._cartService) : super(const CartState());

  Future<void> loadCart() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cart = await _cartService.getCart();
      state = CartState(cart: cart, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addItem({
    required int productId,
    int quantity = 1,
    String? notes,
    Map<String, dynamic>? options,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cart = await _cartService.addToCart(
        productId: productId,
        quantity: quantity,
        notes: notes,
        options: options,
      );
      state = CartState(cart: cart, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> updateItem({
    required int productId,
    required int quantity,
    String? notes,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cart = await _cartService.updateCartItem(
        productId: productId,
        quantity: quantity,
        notes: notes,
      );
      state = CartState(cart: cart, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> removeItem(int productId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cart = await _cartService.removeFromCart(productId);
      state = CartState(cart: cart, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> clearCart() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _cartService.clearCart();
      state = const CartState();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> applyPromoCode(String code) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cart = await _cartService.applyPromoCode(code);
      state = CartState(cart: cart, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> removePromoCode() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final cart = await _cartService.removePromoCode();
      state = CartState(cart: cart, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

/// Cart state provider
final cartStateProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  final cartService = ref.watch(cartServiceProvider);
  return CartNotifier(cartService);
});

/// Cart item count provider
final cartItemCountProvider = Provider<int>((ref) {
  return ref.watch(cartStateProvider).itemCount;
});

// ============ PRODUCT PROVIDERS ============

/// Categories provider
final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final productService = ref.watch(productServiceProvider);
  return productService.getCategories(activeOnly: true);
});

/// Featured products provider
final featuredProductsProvider = FutureProvider<List<Product>>((ref) async {
  final productService = ref.watch(productServiceProvider);
  return productService.getFeaturedProducts(limit: 10);
});

/// Deals provider
final dealsProvider = FutureProvider<List<Product>>((ref) async {
  final productService = ref.watch(productServiceProvider);
  return productService.getDeals(limit: 10);
});

/// New arrivals provider
final newArrivalsProvider = FutureProvider<List<Product>>((ref) async {
  final productService = ref.watch(productServiceProvider);
  return productService.getNewArrivals(limit: 10);
});

/// Product by ID provider
final productByIdProvider = FutureProvider.family<Product, int>((ref, id) async {
  final productService = ref.watch(productServiceProvider);
  return productService.getProductById(id);
});

/// Products by category provider
final productsByCategoryProvider = FutureProvider.family<PaginatedList<Product>, int>((ref, categoryId) async {
  final productService = ref.watch(productServiceProvider);
  return productService.getProducts(categoryId: categoryId);
});

// ============ STORE PROVIDERS ============

/// Nearby stores provider
final nearbyStoresProvider = FutureProvider.family<List<Store>, ({double lat, double lng})>((ref, location) async {
  final storeService = ref.watch(storeServiceProvider);
  return storeService.getNearbyStores(
    latitude: location.lat,
    longitude: location.lng,
  );
});

/// Store by ID provider
final storeByIdProvider = FutureProvider.family<Store, int>((ref, id) async {
  final storeService = ref.watch(storeServiceProvider);
  return storeService.getStoreById(id);
});

/// Favorite stores provider
final favoriteStoresProvider = FutureProvider<List<Store>>((ref) async {
  final storeService = ref.watch(storeServiceProvider);
  return storeService.getFavoriteStores();
});

// ============ ORDER PROVIDERS ============

/// Active orders provider (customer)
final activeOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final orderService = ref.watch(customerOrderServiceProvider);
  return orderService.getActiveOrders();
});

/// Order by ID provider
final orderByIdProvider = FutureProvider.family<Order, int>((ref, id) async {
  final orderService = ref.watch(customerOrderServiceProvider);
  return orderService.getOrderById(id);
});

/// Order tracking provider
final orderTrackingProvider = FutureProvider.family<OrderTracking, int>((ref, orderId) async {
  final orderService = ref.watch(customerOrderServiceProvider);
  return orderService.getOrderTracking(orderId);
});

// ============ RIDER PROVIDERS ============

/// Rider available orders provider
final riderAvailableOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final orderService = ref.watch(riderOrderServiceProvider);
  return orderService.getAvailableOrders();
});

/// Rider active orders provider
final riderActiveOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final orderService = ref.watch(riderOrderServiceProvider);
  return orderService.getActiveOrders();
});

/// Rider earnings provider
final riderEarningsProvider = FutureProvider<RiderEarnings>((ref) async {
  final earningsService = ref.watch(riderEarningsServiceProvider);
  return earningsService.getEarningsSummary();
});

// ============ PAYMENT PROVIDERS ============

/// Payment methods provider
final paymentMethodsProvider = FutureProvider<List<PaymentMethod>>((ref) async {
  final paymentService = ref.watch(paymentServiceProvider);
  return paymentService.getPaymentMethods();
});

/// Wallet balance provider
final walletBalanceProvider = FutureProvider<double>((ref) async {
  final paymentService = ref.watch(paymentServiceProvider);
  return paymentService.getWalletBalance();
});

// ============ SEARCH PROVIDERS ============

/// Search query state
final searchQueryProvider = StateProvider<String>((ref) => '');

/// Search results provider
final searchResultsProvider = FutureProvider<PaginatedList<Product>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) {
    return PaginatedList.empty();
  }
  final productService = ref.watch(productServiceProvider);
  return productService.searchProducts(query);
});
