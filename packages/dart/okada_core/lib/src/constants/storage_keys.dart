/// Storage key constants for secure and local storage
class StorageKeys {
  StorageKeys._();

  // Secure Storage Keys (encrypted)
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String userRole = 'user_role';
  static const String biometricEnabled = 'biometric_enabled';
  static const String pinCode = 'pin_code';

  // Hive Box Names
  static const String userBox = 'user_box';
  static const String cartBox = 'cart_box';
  static const String settingsBox = 'settings_box';
  static const String cacheBox = 'cache_box';
  static const String searchHistoryBox = 'search_history_box';
  static const String recentlyViewedBox = 'recently_viewed_box';
  static const String favoritesBox = 'favorites_box';
  static const String addressesBox = 'addresses_box';
  static const String notificationsBox = 'notifications_box';

  // User Preferences
  static const String locale = 'locale';
  static const String themeMode = 'theme_mode';
  static const String notificationsEnabled = 'notifications_enabled';
  static const String soundEnabled = 'sound_enabled';
  static const String vibrationEnabled = 'vibration_enabled';
  static const String locationEnabled = 'location_enabled';

  // Onboarding
  static const String onboardingCompleted = 'onboarding_completed';
  static const String firstLaunch = 'first_launch';
  static const String lastVersion = 'last_version';

  // Cache Keys
  static const String categoriesCache = 'categories_cache';
  static const String productsCache = 'products_cache';
  static const String storesCache = 'stores_cache';
  static const String promotionsCache = 'promotions_cache';
  static const String userProfileCache = 'user_profile_cache';

  // Rider Specific
  static const String riderOnlineStatus = 'rider_online_status';
  static const String riderLastLocation = 'rider_last_location';
  static const String riderActiveOrder = 'rider_active_order';
  static const String riderShiftStart = 'rider_shift_start';

  // Session
  static const String sessionExpiry = 'session_expiry';
  static const String lastActivity = 'last_activity';
  static const String deviceId = 'device_id';
  static const String fcmToken = 'fcm_token';

  // Analytics
  static const String analyticsUserId = 'analytics_user_id';
  static const String analyticsEnabled = 'analytics_enabled';
  static const String crashReportingEnabled = 'crash_reporting_enabled';
}
