import 'dart:async';
import 'dart:math';

/// Service for managing guest (anonymous) browsing sessions
class GuestSessionService {
  /// Maximum duration for a guest session
  static const Duration maxSessionDuration = Duration(hours: 24);
  
  /// Features available to guest users
  static const Set<GuestFeature> availableFeatures = {
    GuestFeature.browseProducts,
    GuestFeature.viewProductDetails,
    GuestFeature.searchProducts,
    GuestFeature.viewCategories,
    GuestFeature.viewStores,
    GuestFeature.viewPromotions,
    GuestFeature.addToCart,
    GuestFeature.viewCart,
  };
  
  /// Features restricted for guest users
  static const Set<GuestFeature> restrictedFeatures = {
    GuestFeature.checkout,
    GuestFeature.orderHistory,
    GuestFeature.savedAddresses,
    GuestFeature.paymentMethods,
    GuestFeature.favorites,
    GuestFeature.reviews,
    GuestFeature.notifications,
    GuestFeature.loyaltyPoints,
    GuestFeature.referrals,
  };
  
  /// Current guest session
  GuestSession? _currentSession;
  
  /// Session change stream controller
  final _sessionController = StreamController<GuestSession?>.broadcast();
  
  /// Stream of session changes
  Stream<GuestSession?> get sessionStream => _sessionController.stream;
  
  /// Get current session
  GuestSession? get currentSession => _currentSession;
  
  /// Whether there is an active guest session
  bool get hasActiveSession => _currentSession != null && !_currentSession!.isExpired;
  
  /// Start a new guest session
  GuestSession startSession({
    String? deviceId,
    String? countryCode,
    String? languageCode,
  }) {
    // End existing session if any
    if (_currentSession != null) {
      endSession();
    }
    
    _currentSession = GuestSession(
      sessionId: _generateSessionId(),
      deviceId: deviceId ?? _generateDeviceId(),
      countryCode: countryCode ?? 'CM', // Default to Cameroon
      languageCode: languageCode ?? 'en',
      createdAt: DateTime.now(),
      expiresAt: DateTime.now().add(maxSessionDuration),
      cart: GuestCart.empty(),
    );
    
    _sessionController.add(_currentSession);
    return _currentSession!;
  }
  
  /// End current guest session
  void endSession() {
    _currentSession = null;
    _sessionController.add(null);
  }
  
  /// Extend session expiry
  void extendSession() {
    if (_currentSession != null) {
      _currentSession = _currentSession!.copyWith(
        expiresAt: DateTime.now().add(maxSessionDuration),
      );
      _sessionController.add(_currentSession);
    }
  }
  
  /// Check if a feature is available for guest users
  bool isFeatureAvailable(GuestFeature feature) {
    return availableFeatures.contains(feature);
  }
  
  /// Get restriction message for a feature
  GuestRestriction? getRestriction(GuestFeature feature) {
    if (availableFeatures.contains(feature)) {
      return null;
    }
    
    return GuestRestriction(
      feature: feature,
      message: _getRestrictionMessage(feature),
      localizedMessage: _getRestrictionMessageFr(feature),
      ctaText: 'Create Account',
      ctaTextFr: 'Créer un compte',
    );
  }
  
  /// Add item to guest cart
  void addToCart(GuestCartItem item) {
    if (_currentSession == null) return;
    
    final updatedCart = _currentSession!.cart.addItem(item);
    _currentSession = _currentSession!.copyWith(cart: updatedCart);
    _sessionController.add(_currentSession);
  }
  
  /// Remove item from guest cart
  void removeFromCart(String productId) {
    if (_currentSession == null) return;
    
    final updatedCart = _currentSession!.cart.removeItem(productId);
    _currentSession = _currentSession!.copyWith(cart: updatedCart);
    _sessionController.add(_currentSession);
  }
  
  /// Update cart item quantity
  void updateCartQuantity(String productId, int quantity) {
    if (_currentSession == null) return;
    
    final updatedCart = _currentSession!.cart.updateQuantity(productId, quantity);
    _currentSession = _currentSession!.copyWith(cart: updatedCart);
    _sessionController.add(_currentSession);
  }
  
  /// Clear guest cart
  void clearCart() {
    if (_currentSession == null) return;
    
    _currentSession = _currentSession!.copyWith(cart: GuestCart.empty());
    _sessionController.add(_currentSession);
  }
  
  /// Convert guest session to authenticated session
  /// Returns cart items to be merged with user's cart
  GuestCart? convertToAuthenticated() {
    final cart = _currentSession?.cart;
    endSession();
    return cart;
  }
  
  /// Generate session ID
  String _generateSessionId() {
    final random = Random.secure();
    final bytes = List.generate(16, (_) => random.nextInt(256));
    return 'guest_${bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join()}';
  }
  
  /// Generate device ID
  String _generateDeviceId() {
    final random = Random.secure();
    final bytes = List.generate(8, (_) => random.nextInt(256));
    return 'device_${bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join()}';
  }
  
  /// Get restriction message for feature
  String _getRestrictionMessage(GuestFeature feature) {
    switch (feature) {
      case GuestFeature.checkout:
        return 'Create an account to complete your purchase';
      case GuestFeature.orderHistory:
        return 'Create an account to view your order history';
      case GuestFeature.savedAddresses:
        return 'Create an account to save delivery addresses';
      case GuestFeature.paymentMethods:
        return 'Create an account to save payment methods';
      case GuestFeature.favorites:
        return 'Create an account to save your favorites';
      case GuestFeature.reviews:
        return 'Create an account to write reviews';
      case GuestFeature.notifications:
        return 'Create an account to receive notifications';
      case GuestFeature.loyaltyPoints:
        return 'Create an account to earn loyalty points';
      case GuestFeature.referrals:
        return 'Create an account to refer friends';
      default:
        return 'Create an account to access this feature';
    }
  }
  
  /// Get restriction message in French
  String _getRestrictionMessageFr(GuestFeature feature) {
    switch (feature) {
      case GuestFeature.checkout:
        return 'Créez un compte pour finaliser votre achat';
      case GuestFeature.orderHistory:
        return 'Créez un compte pour voir votre historique de commandes';
      case GuestFeature.savedAddresses:
        return 'Créez un compte pour enregistrer vos adresses';
      case GuestFeature.paymentMethods:
        return 'Créez un compte pour enregistrer vos moyens de paiement';
      case GuestFeature.favorites:
        return 'Créez un compte pour enregistrer vos favoris';
      case GuestFeature.reviews:
        return 'Créez un compte pour écrire des avis';
      case GuestFeature.notifications:
        return 'Créez un compte pour recevoir des notifications';
      case GuestFeature.loyaltyPoints:
        return 'Créez un compte pour gagner des points de fidélité';
      case GuestFeature.referrals:
        return 'Créez un compte pour parrainer des amis';
      default:
        return 'Créez un compte pour accéder à cette fonctionnalité';
    }
  }
  
  /// Dispose resources
  void dispose() {
    _sessionController.close();
  }
}

/// Guest session data
class GuestSession {
  /// Unique session identifier
  final String sessionId;
  
  /// Device identifier
  final String deviceId;
  
  /// Country code for localization
  final String countryCode;
  
  /// Language code for localization
  final String languageCode;
  
  /// When session was created
  final DateTime createdAt;
  
  /// When session expires
  final DateTime expiresAt;
  
  /// Guest cart
  final GuestCart cart;
  
  /// Recently viewed product IDs
  final List<String> recentlyViewed;
  
  /// Search history
  final List<String> searchHistory;
  
  const GuestSession({
    required this.sessionId,
    required this.deviceId,
    required this.countryCode,
    required this.languageCode,
    required this.createdAt,
    required this.expiresAt,
    required this.cart,
    this.recentlyViewed = const [],
    this.searchHistory = const [],
  });
  
  /// Whether session has expired
  bool get isExpired => DateTime.now().isAfter(expiresAt);
  
  /// Time remaining until expiry
  Duration get timeRemaining {
    final remaining = expiresAt.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }
  
  /// Copy with new values
  GuestSession copyWith({
    String? sessionId,
    String? deviceId,
    String? countryCode,
    String? languageCode,
    DateTime? createdAt,
    DateTime? expiresAt,
    GuestCart? cart,
    List<String>? recentlyViewed,
    List<String>? searchHistory,
  }) {
    return GuestSession(
      sessionId: sessionId ?? this.sessionId,
      deviceId: deviceId ?? this.deviceId,
      countryCode: countryCode ?? this.countryCode,
      languageCode: languageCode ?? this.languageCode,
      createdAt: createdAt ?? this.createdAt,
      expiresAt: expiresAt ?? this.expiresAt,
      cart: cart ?? this.cart,
      recentlyViewed: recentlyViewed ?? this.recentlyViewed,
      searchHistory: searchHistory ?? this.searchHistory,
    );
  }
}

/// Guest cart
class GuestCart {
  /// Cart items
  final List<GuestCartItem> items;
  
  const GuestCart({required this.items});
  
  /// Create empty cart
  factory GuestCart.empty() => const GuestCart(items: []);
  
  /// Total number of items
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  
  /// Total price
  double get totalPrice => items.fold(0, (sum, item) => sum + item.totalPrice);
  
  /// Whether cart is empty
  bool get isEmpty => items.isEmpty;
  
  /// Add item to cart
  GuestCart addItem(GuestCartItem item) {
    final existingIndex = items.indexWhere((i) => i.productId == item.productId);
    
    if (existingIndex >= 0) {
      // Update quantity of existing item
      final updatedItems = List<GuestCartItem>.from(items);
      updatedItems[existingIndex] = updatedItems[existingIndex].copyWith(
        quantity: updatedItems[existingIndex].quantity + item.quantity,
      );
      return GuestCart(items: updatedItems);
    }
    
    // Add new item
    return GuestCart(items: [...items, item]);
  }
  
  /// Remove item from cart
  GuestCart removeItem(String productId) {
    return GuestCart(
      items: items.where((i) => i.productId != productId).toList(),
    );
  }
  
  /// Update item quantity
  GuestCart updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      return removeItem(productId);
    }
    
    return GuestCart(
      items: items.map((item) {
        if (item.productId == productId) {
          return item.copyWith(quantity: quantity);
        }
        return item;
      }).toList(),
    );
  }
}

/// Guest cart item
class GuestCartItem {
  /// Product ID
  final String productId;
  
  /// Product name
  final String name;
  
  /// Product image URL
  final String? imageUrl;
  
  /// Unit price
  final double price;
  
  /// Currency code
  final String currency;
  
  /// Quantity
  final int quantity;
  
  /// Selected variant (if any)
  final String? variant;
  
  const GuestCartItem({
    required this.productId,
    required this.name,
    this.imageUrl,
    required this.price,
    this.currency = 'XAF',
    this.quantity = 1,
    this.variant,
  });
  
  /// Total price for this item
  double get totalPrice => price * quantity;
  
  /// Copy with new values
  GuestCartItem copyWith({
    String? productId,
    String? name,
    String? imageUrl,
    double? price,
    String? currency,
    int? quantity,
    String? variant,
  }) {
    return GuestCartItem(
      productId: productId ?? this.productId,
      name: name ?? this.name,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      quantity: quantity ?? this.quantity,
      variant: variant ?? this.variant,
    );
  }
}

/// Features available in the app
enum GuestFeature {
  // Available features
  browseProducts,
  viewProductDetails,
  searchProducts,
  viewCategories,
  viewStores,
  viewPromotions,
  addToCart,
  viewCart,
  
  // Restricted features
  checkout,
  orderHistory,
  savedAddresses,
  paymentMethods,
  favorites,
  reviews,
  notifications,
  loyaltyPoints,
  referrals,
}

/// Restriction information for a feature
class GuestRestriction {
  /// The restricted feature
  final GuestFeature feature;
  
  /// Restriction message (English)
  final String message;
  
  /// Restriction message (French)
  final String localizedMessage;
  
  /// Call-to-action text (English)
  final String ctaText;
  
  /// Call-to-action text (French)
  final String ctaTextFr;
  
  const GuestRestriction({
    required this.feature,
    required this.message,
    required this.localizedMessage,
    required this.ctaText,
    required this.ctaTextFr,
  });
}
