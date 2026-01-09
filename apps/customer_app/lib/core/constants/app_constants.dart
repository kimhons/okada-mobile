class AppConstants {
  static const String appName = 'Okada';
  static const String appVersion = '1.0.0';

  // API Configuration
  static const String baseUrl = 'https://api.okada.cm/v1';
  static const String wsBaseUrl = 'wss://ws.okada.cm/v1';

  // Storage Keys
  static const String userTokenKey = 'user_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String cartDataKey = 'cart_data';
  static const String addressesKey = 'addresses';
  static const String languageKey = 'language';
  static const String themeKey = 'theme';
  static const String onboardingKey = 'onboarding_completed';

  // Timeouts (in milliseconds)
  static const int connectionTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;

  // Cache Configuration
  static const Duration cacheMaxAge = Duration(hours: 1);
  static const Duration cacheMaxStale = Duration(days: 7);

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // File Upload
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];

  // Location
  static const double defaultLatitude = 3.848;
  static const double defaultLongitude = 11.502;
  static const String defaultCity = 'Yaoundé';
  static const String defaultCountry = 'Cameroon';

  // Currency
  static const String defaultCurrency = 'XAF';
  static const String currencySymbol = 'FCFA';

  // Payment Methods
  static const String mtnMoney = 'MTN_MONEY';
  static const String orangeMoney = 'ORANGE_MONEY';
  static const String cashOnDelivery = 'CASH_ON_DELIVERY';

  // Order Status
  static const String orderPlaced = 'PLACED';
  static const String orderConfirmed = 'CONFIRMED';
  static const String orderPreparing = 'PREPARING';
  static const String orderOnTheWay = 'ON_THE_WAY';
  static const String orderDelivered = 'DELIVERED';
  static const String orderCancelled = 'CANCELLED';

  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);

  // Debounce Durations
  static const Duration searchDebounce = Duration(milliseconds: 500);
  static const Duration scrollDebounce = Duration(milliseconds: 100);

  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double borderRadius = 12.0;
  static const double cardElevation = 2.0;

  // Phone Number Patterns
  static const String cameroonPhonePattern = r'^(6[5-9]|2[0-9])[0-9]{7}$';
  static const String mtnPrefixes = '67,68,65,66';
  static const String orangePrefixes = '69,65,66';

  // Deep Links
  static const String deepLinkScheme = 'okada';
  static const String deepLinkHost = 'app';

  // Firebase
  static const String firebaseAndroidAppId = '1:your-project:android:your-app-id';
  static const String firebaseIosAppId = '1:your-project:ios:your-app-id';

  // Error Messages
  static const String networkErrorMessage = 'Network error. Please check your connection.';
  static const String serverErrorMessage = 'Server error. Please try again later.';
  static const String unknownErrorMessage = 'An unexpected error occurred.';

  // Hive Box Names
  static const String userBox = 'user_box';
  static const String cartBox = 'cart_box';
  static const String productsBox = 'products_box';
  static const String ordersBox = 'orders_box';
  static const String addressesBox = 'addresses_box';
  static const String settingsBox = 'settings_box';
}

class ApiEndpoints {
  // Authentication
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyOtp = '/auth/verify-otp';

  // User
  static const String profile = '/user/profile';
  static const String updateProfile = '/user/profile';
  static const String addresses = '/user/addresses';
  static const String paymentMethods = '/user/payment-methods';

  // Products
  static const String products = '/products';
  static const String categories = '/categories';
  static const String search = '/products/search';
  static const String recommendations = '/products/recommendations';
  static const String popularProducts = '/products/popular';

  // Cart
  static const String cart = '/cart';
  static const String addToCart = '/cart/add';
  static const String updateCart = '/cart/update';
  static const String removeFromCart = '/cart/remove';
  static const String clearCart = '/cart/clear';

  // Orders
  static const String orders = '/orders';
  static const String placeOrder = '/orders/place';
  static const String orderDetails = '/orders/{id}';
  static const String trackOrder = '/orders/{id}/track';
  static const String cancelOrder = '/orders/{id}/cancel';

  // Delivery
  static const String deliveryEstimate = '/delivery/estimate';
  static const String deliveryTracking = '/delivery/track/{orderId}';

  // Notifications
  static const String notifications = '/notifications';
  static const String markAsRead = '/notifications/{id}/read';
  static const String fcmToken = '/notifications/fcm-token';

  // AI
  static const String aiRecommendations = '/ai/recommendations';
  static const String aiSearch = '/ai/search';
  static const String aiPricePredict = '/ai/price-predict';
}

class CameroonRegions {
  static const List<String> regions = [
    'Adamawa',
    'Centre',
    'East',
    'Far North',
    'Littoral',
    'North',
    'Northwest',
    'South',
    'Southwest',
    'West',
  ];

  static const Map<String, List<String>> cities = {
    'Centre': ['Yaoundé', 'Mbalmayo', 'Obala', 'Akonolinga'],
    'Littoral': ['Douala', 'Edéa', 'Nkongsamba', 'Loum'],
    'West': ['Bafoussam', 'Dschang', 'Mbouda', 'Bandjoun'],
    'Northwest': ['Bamenda', 'Kumbo', 'Wum', 'Ndop'],
    'Southwest': ['Buea', 'Limbe', 'Kumba', 'Tiko'],
    'North': ['Garoua', 'Ngaoundéré', 'Guider', 'Figuil'],
    'Far North': ['Maroua', 'Mokolo', 'Kousseri', 'Mora'],
    'Adamawa': ['Ngaoundéré', 'Meiganga', 'Tibati', 'Tignère'],
    'East': ['Bertoua', 'Batouri', 'Yokadouma', 'Abong-Mbang'],
    'South': ['Ebolowa', 'Kribi', 'Sangmélima', 'Ambam'],
  };
}