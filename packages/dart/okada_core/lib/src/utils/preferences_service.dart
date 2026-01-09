import 'package:shared_preferences/shared_preferences.dart';

/// Preferences service for non-sensitive app settings and data
class PreferencesService {
  late SharedPreferences _prefs;
  bool _isInitialized = false;

  /// Initialize the preferences service
  Future<void> init() async {
    if (_isInitialized) return;
    _prefs = await SharedPreferences.getInstance();
    _isInitialized = true;
  }

  void _checkInitialized() {
    if (!_isInitialized) {
      throw StateError('PreferencesService not initialized. Call init() first.');
    }
  }

  // String operations
  Future<bool> setString(String key, String value) async {
    _checkInitialized();
    return await _prefs.setString(key, value);
  }

  String? getString(String key) {
    _checkInitialized();
    return _prefs.getString(key);
  }

  // Int operations
  Future<bool> setInt(String key, int value) async {
    _checkInitialized();
    return await _prefs.setInt(key, value);
  }

  int? getInt(String key) {
    _checkInitialized();
    return _prefs.getInt(key);
  }

  // Double operations
  Future<bool> setDouble(String key, double value) async {
    _checkInitialized();
    return await _prefs.setDouble(key, value);
  }

  double? getDouble(String key) {
    _checkInitialized();
    return _prefs.getDouble(key);
  }

  // Bool operations
  Future<bool> setBool(String key, bool value) async {
    _checkInitialized();
    return await _prefs.setBool(key, value);
  }

  bool? getBool(String key) {
    _checkInitialized();
    return _prefs.getBool(key);
  }

  // String list operations
  Future<bool> setStringList(String key, List<String> value) async {
    _checkInitialized();
    return await _prefs.setStringList(key, value);
  }

  List<String>? getStringList(String key) {
    _checkInitialized();
    return _prefs.getStringList(key);
  }

  // Remove and clear
  Future<bool> remove(String key) async {
    _checkInitialized();
    return await _prefs.remove(key);
  }

  Future<bool> clear() async {
    _checkInitialized();
    return await _prefs.clear();
  }

  bool containsKey(String key) {
    _checkInitialized();
    return _prefs.containsKey(key);
  }

  Set<String> getKeys() {
    _checkInitialized();
    return _prefs.getKeys();
  }

  // Convenience methods for common preferences

  /// Get/Set selected language
  String getLanguage() {
    return getString(PreferenceKeys.language) ?? 'en';
  }

  Future<bool> setLanguage(String languageCode) async {
    return await setString(PreferenceKeys.language, languageCode);
  }

  /// Get/Set onboarding completed status
  bool isOnboardingCompleted() {
    return getBool(PreferenceKeys.onboardingCompleted) ?? false;
  }

  Future<bool> setOnboardingCompleted(bool completed) async {
    return await setBool(PreferenceKeys.onboardingCompleted, completed);
  }

  /// Get/Set notification preferences
  bool isPushNotificationsEnabled() {
    return getBool(PreferenceKeys.pushNotifications) ?? true;
  }

  Future<bool> setPushNotificationsEnabled(bool enabled) async {
    return await setBool(PreferenceKeys.pushNotifications, enabled);
  }

  bool isEmailNotificationsEnabled() {
    return getBool(PreferenceKeys.emailNotifications) ?? true;
  }

  Future<bool> setEmailNotificationsEnabled(bool enabled) async {
    return await setBool(PreferenceKeys.emailNotifications, enabled);
  }

  /// Get/Set theme preference
  String getTheme() {
    return getString(PreferenceKeys.theme) ?? 'light';
  }

  Future<bool> setTheme(String theme) async {
    return await setString(PreferenceKeys.theme, theme);
  }

  /// Get/Set last sync timestamp
  int? getLastSyncTimestamp() {
    return getInt(PreferenceKeys.lastSync);
  }

  Future<bool> setLastSyncTimestamp(int timestamp) async {
    return await setInt(PreferenceKeys.lastSync, timestamp);
  }

  /// Get/Set recent searches
  List<String> getRecentSearches() {
    return getStringList(PreferenceKeys.recentSearches) ?? [];
  }

  Future<bool> setRecentSearches(List<String> searches) async {
    return await setStringList(PreferenceKeys.recentSearches, searches);
  }

  Future<bool> addRecentSearch(String search, {int maxItems = 10}) async {
    final searches = getRecentSearches();
    searches.remove(search); // Remove if exists
    searches.insert(0, search); // Add to front
    if (searches.length > maxItems) {
      searches.removeLast();
    }
    return await setRecentSearches(searches);
  }

  /// Get/Set default address ID
  String? getDefaultAddressId() {
    return getString(PreferenceKeys.defaultAddressId);
  }

  Future<bool> setDefaultAddressId(String addressId) async {
    return await setString(PreferenceKeys.defaultAddressId, addressId);
  }

  /// Get/Set default payment method ID
  String? getDefaultPaymentMethodId() {
    return getString(PreferenceKeys.defaultPaymentMethod);
  }

  Future<bool> setDefaultPaymentMethodId(String methodId) async {
    return await setString(PreferenceKeys.defaultPaymentMethod, methodId);
  }

  /// Get/Set app launch count
  int getAppLaunchCount() {
    return getInt(PreferenceKeys.appLaunchCount) ?? 0;
  }

  Future<bool> incrementAppLaunchCount() async {
    return await setInt(PreferenceKeys.appLaunchCount, getAppLaunchCount() + 1);
  }

  /// Get/Set first launch date
  String? getFirstLaunchDate() {
    return getString(PreferenceKeys.firstLaunchDate);
  }

  Future<bool> setFirstLaunchDate(String date) async {
    if (getFirstLaunchDate() != null) return true; // Don't overwrite
    return await setString(PreferenceKeys.firstLaunchDate, date);
  }
}

/// Preference keys for shared preferences
abstract class PreferenceKeys {
  static const String language = 'pref_language';
  static const String theme = 'pref_theme';
  static const String onboardingCompleted = 'pref_onboarding_completed';
  static const String pushNotifications = 'pref_push_notifications';
  static const String emailNotifications = 'pref_email_notifications';
  static const String smsNotifications = 'pref_sms_notifications';
  static const String lastSync = 'pref_last_sync';
  static const String recentSearches = 'pref_recent_searches';
  static const String defaultAddressId = 'pref_default_address_id';
  static const String defaultPaymentMethod = 'pref_default_payment_method';
  static const String appLaunchCount = 'pref_app_launch_count';
  static const String firstLaunchDate = 'pref_first_launch_date';
  static const String lastAppVersion = 'pref_last_app_version';
  static const String ratingPromptShown = 'pref_rating_prompt_shown';
  static const String locationPermissionAsked = 'pref_location_permission_asked';
  static const String notificationPermissionAsked = 'pref_notification_permission_asked';
}
