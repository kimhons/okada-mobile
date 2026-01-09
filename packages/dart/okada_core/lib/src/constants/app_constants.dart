/// Application-wide constants for Okada Platform
class AppConstants {
  AppConstants._();

  // ============================================
  // APP INFO
  // ============================================
  
  static const String appName = 'Okada';
  static const String appNameCustomer = 'Okada';
  static const String appNameRider = 'Okada Rider';
  static const String appVersion = '1.0.0';
  static const int appBuildNumber = 1;

  // ============================================
  // PAGINATION
  // ============================================
  
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  static const int searchResultsLimit = 50;

  // ============================================
  // TIMEOUTS
  // ============================================
  
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
  static const Duration otpTimeout = Duration(minutes: 5);
  static const Duration sessionTimeout = Duration(days: 7);
  static const Duration locationUpdateInterval = Duration(seconds: 10);
  static const Duration orderRefreshInterval = Duration(seconds: 30);

  // ============================================
  // CACHE DURATIONS
  // ============================================
  
  static const Duration categoryCacheDuration = Duration(hours: 24);
  static const Duration productCacheDuration = Duration(hours: 1);
  static const Duration userCacheDuration = Duration(minutes: 30);
  static const Duration locationCacheDuration = Duration(minutes: 5);

  // ============================================
  // LIMITS
  // ============================================
  
  static const int maxCartItems = 50;
  static const int maxAddresses = 10;
  static const int maxFavorites = 100;
  static const int maxSearchHistory = 20;
  static const int maxRecentOrders = 50;
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const int maxUploadRetries = 3;

  // ============================================
  // VALIDATION
  // ============================================
  
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int otpLength = 6;
  static const int phoneNumberLength = 9; // Cameroon format
  static const int minNameLength = 2;
  static const int maxNameLength = 50;
  static const int maxAddressLength = 200;
  static const int maxNoteLength = 500;

  // ============================================
  // CURRENCY (Default: Cameroon)
  // ============================================
  
  static const String defaultCurrencyCode = 'XAF';
  static const String defaultCurrencySymbol = 'FCFA';
  static const int defaultCurrencyDecimals = 0; // CFA has no decimals

  // ============================================
  // DELIVERY
  // ============================================
  
  static const double defaultDeliveryRadius = 10.0; // km
  static const double maxDeliveryRadius = 50.0; // km
  static const double minOrderAmount = 500.0; // XAF
  static const double freeDeliveryThreshold = 10000.0; // XAF
  static const double baseDeliveryFee = 500.0; // XAF
  static const double perKmDeliveryFee = 100.0; // XAF per km

  // ============================================
  // RIDER
  // ============================================
  
  static const double riderAcceptanceRadius = 5.0; // km
  static const Duration riderAcceptanceTimeout = Duration(seconds: 60);
  static const int maxActiveDeliveries = 3;
  static const double minRiderRating = 3.0;

  // ============================================
  // RATINGS
  // ============================================
  
  static const double minRating = 1.0;
  static const double maxRating = 5.0;
  static const double defaultRating = 5.0;

  // ============================================
  // LOCATION
  // ============================================
  
  // Cameroon center coordinates (Yaoundé)
  static const double defaultLatitude = 3.8480;
  static const double defaultLongitude = 11.5021;
  static const double defaultZoom = 12.0;
  static const double minZoom = 5.0;
  static const double maxZoom = 20.0;

  // ============================================
  // ANIMATION DURATIONS
  // ============================================
  
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  static const Duration pageTransition = Duration(milliseconds: 300);

  // ============================================
  // SUPPORT
  // ============================================
  
  static const String supportEmail = 'support@okada.cm';
  static const String supportPhone = '+237 6XX XXX XXX';
  static const String websiteUrl = 'https://okada.cm';
  static const String privacyPolicyUrl = 'https://okada.cm/privacy';
  static const String termsOfServiceUrl = 'https://okada.cm/terms';
}
