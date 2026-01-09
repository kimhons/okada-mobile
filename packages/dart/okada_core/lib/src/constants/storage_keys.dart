/// Storage key constants for Okada Platform
/// Used for SharedPreferences and SecureStorage
class StorageKeys {
  StorageKeys._();

  // ============================================
  // AUTHENTICATION (Secure Storage)
  // ============================================
  
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String tokenExpiry = 'token_expiry';
  static const String userId = 'user_id';
  static const String userRole = 'user_role';
  static const String biometricEnabled = 'biometric_enabled';
  static const String biometricKey = 'biometric_key';
  static const String pinCode = 'pin_code';

  // ============================================
  // USER DATA (Secure Storage)
  // ============================================
  
  static const String userProfile = 'user_profile';
  static const String userPhone = 'user_phone';
  static const String userEmail = 'user_email';
  static const String userName = 'user_name';

  // ============================================
  // PREFERENCES (SharedPreferences)
  // ============================================
  
  static const String language = 'language';
  static const String country = 'country';
  static const String theme = 'theme';
  static const String notificationsEnabled = 'notifications_enabled';
  static const String soundEnabled = 'sound_enabled';
  static const String vibrationEnabled = 'vibration_enabled';
  static const String locationPermissionAsked = 'location_permission_asked';
  static const String notificationPermissionAsked = 'notification_permission_asked';

  // ============================================
  // ONBOARDING
  // ============================================
  
  static const String onboardingCompleted = 'onboarding_completed';
  static const String firstLaunch = 'first_launch';
  static const String lastVersionSeen = 'last_version_seen';
  static const String whatsNewSeen = 'whats_new_seen';

  // ============================================
  // CART
  // ============================================
  
  static const String cartItems = 'cart_items';
  static const String cartVendorId = 'cart_vendor_id';
  static const String cartLastUpdated = 'cart_last_updated';
  static const String appliedCoupon = 'applied_coupon';

  // ============================================
  // ADDRESSES
  // ============================================
  
  static const String savedAddresses = 'saved_addresses';
  static const String defaultAddressId = 'default_address_id';
  static const String lastUsedAddress = 'last_used_address';
  static const String currentLocation = 'current_location';

  // ============================================
  // SEARCH
  // ============================================
  
  static const String searchHistory = 'search_history';
  static const String recentProducts = 'recent_products';
  static const String recentVendors = 'recent_vendors';

  // ============================================
  // FAVORITES
  // ============================================
  
  static const String favoriteProducts = 'favorite_products';
  static const String favoriteVendors = 'favorite_vendors';

  // ============================================
  // RIDER SPECIFIC
  // ============================================
  
  static const String riderStatus = 'rider_status';
  static const String riderVehicleType = 'rider_vehicle_type';
  static const String riderActiveDelivery = 'rider_active_delivery';
  static const String riderLocationTracking = 'rider_location_tracking';
  static const String riderEarningsCache = 'rider_earnings_cache';
  static const String riderPerformanceCache = 'rider_performance_cache';

  // ============================================
  // OFFLINE SYNC
  // ============================================
  
  static const String offlineOrders = 'offline_orders';
  static const String offlineActions = 'offline_actions';
  static const String lastSyncTime = 'last_sync_time';
  static const String pendingSyncItems = 'pending_sync_items';
  static const String offlineCategories = 'offline_categories';
  static const String offlineProducts = 'offline_products';

  // ============================================
  // CACHE
  // ============================================
  
  static const String categoriesCache = 'categories_cache';
  static const String categoriesCacheTime = 'categories_cache_time';
  static const String vendorsCache = 'vendors_cache';
  static const String vendorsCacheTime = 'vendors_cache_time';
  static const String configCache = 'config_cache';
  static const String configCacheTime = 'config_cache_time';

  // ============================================
  // ANALYTICS
  // ============================================
  
  static const String analyticsUserId = 'analytics_user_id';
  static const String analyticsSessionId = 'analytics_session_id';
  static const String analyticsOptOut = 'analytics_opt_out';

  // ============================================
  // PUSH NOTIFICATIONS
  // ============================================
  
  static const String fcmToken = 'fcm_token';
  static const String fcmTokenLastUpdated = 'fcm_token_last_updated';
  static const String notificationChannels = 'notification_channels';

  // ============================================
  // APP STATE
  // ============================================
  
  static const String lastActiveTime = 'last_active_time';
  static const String appOpenCount = 'app_open_count';
  static const String rateAppPromptShown = 'rate_app_prompt_shown';
  static const String lastRateAppPrompt = 'last_rate_app_prompt';
}
