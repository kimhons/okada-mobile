import 'environment.dart';
import 'api_config.dart';

/// Application-wide configuration
class AppConfig {
  final Environment environment;
  late final ApiConfig apiConfig;

  AppConfig({required this.environment}) {
    apiConfig = ApiConfig(environment: environment);
  }

  /// App name
  String get appName => 'Okada';

  /// App version (should be loaded from package info)
  String get appVersion => '1.0.0';

  /// Build number (should be loaded from package info)
  String get buildNumber => '1';

  /// Full version string
  String get fullVersion => '$appVersion+$buildNumber';

  /// Support email
  String get supportEmail => 'support@okadaplatform.com';

  /// Support phone number
  String get supportPhone => '+237600000000';

  /// Terms of service URL
  String get termsUrl => 'https://okadaplatform.com/terms';

  /// Privacy policy URL
  String get privacyUrl => 'https://okadaplatform.com/privacy';

  /// Help center URL
  String get helpUrl => 'https://help.okadaplatform.com';

  /// Default language code
  String get defaultLanguage => 'en';

  /// Supported languages
  List<String> get supportedLanguages => ['en', 'fr'];

  /// Default country code for phone numbers
  String get defaultCountryCode => '+237';

  /// Default currency code
  String get defaultCurrency => 'XAF';

  /// Currency symbol
  String get currencySymbol => 'FCFA';

  /// Minimum order amount in XAF
  int get minimumOrderAmount => 1000;

  /// Maximum order amount in XAF
  int get maximumOrderAmount => 500000;

  /// Delivery fee base amount in XAF
  int get deliveryFeeBase => 500;

  /// Delivery fee per kilometer in XAF
  int get deliveryFeePerKm => 100;

  /// Maximum delivery distance in kilometers
  double get maxDeliveryDistance => 20.0;

  /// OTP expiry time in seconds
  int get otpExpirySeconds => 300; // 5 minutes

  /// OTP resend cooldown in seconds
  int get otpResendCooldown => 60; // 1 minute

  /// Session timeout in seconds
  int get sessionTimeout => 86400; // 24 hours

  /// Token refresh threshold in seconds (refresh when less than this remaining)
  int get tokenRefreshThreshold => 300; // 5 minutes

  /// Maximum cart items
  int get maxCartItems => 50;

  /// Maximum quantity per item
  int get maxItemQuantity => 99;

  /// Search debounce duration in milliseconds
  int get searchDebounceMs => 300;

  /// Pagination page size
  int get pageSize => 20;

  /// Image quality for uploads (0-100)
  int get imageUploadQuality => 80;

  /// Maximum image size in bytes (5MB)
  int get maxImageSize => 5 * 1024 * 1024;

  /// Supported image formats
  List<String> get supportedImageFormats => ['jpg', 'jpeg', 'png', 'webp'];

  /// Whether to enable biometric authentication
  bool get enableBiometrics => true;

  /// Whether to enable push notifications
  bool get enablePushNotifications => true;

  /// Whether to enable in-app messaging
  bool get enableInAppMessaging => true;

  /// Whether to enable offline mode
  bool get enableOfflineMode => true;

  /// Offline sync interval in seconds
  int get offlineSyncInterval => 30;

  /// Maximum offline queue size
  int get maxOfflineQueueSize => 100;

  /// Feature flags
  FeatureFlags get features => FeatureFlags(environment: environment);
}

/// Feature flags for enabling/disabling features
class FeatureFlags {
  final Environment environment;

  const FeatureFlags({required this.environment});

  /// Whether AI-powered search is enabled
  bool get aiSearch => true;

  /// Whether voice search is enabled
  bool get voiceSearch => true;

  /// Whether product recommendations are enabled
  bool get recommendations => true;

  /// Whether scheduled delivery is enabled
  bool get scheduledDelivery => true;

  /// Whether express delivery is enabled
  bool get expressDelivery => true;

  /// Whether guest checkout is enabled
  bool get guestCheckout => true;

  /// Whether social login is enabled
  bool get socialLogin => false; // Coming soon

  /// Whether referral program is enabled
  bool get referralProgram => true;

  /// Whether loyalty points are enabled
  bool get loyaltyPoints => true;

  /// Whether dark mode is enabled
  bool get darkMode => false; // Coming soon

  /// Whether multi-language is enabled
  bool get multiLanguage => true;

  /// Whether order tracking is enabled
  bool get orderTracking => true;

  /// Whether live chat support is enabled
  bool get liveChatSupport => environment.isProd;

  /// Whether beta features are enabled
  bool get betaFeatures => environment.isDev || environment.isStaging;
}
