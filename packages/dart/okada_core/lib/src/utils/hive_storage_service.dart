import 'package:hive_flutter/hive_flutter.dart';

/// Local storage service using Hive for non-sensitive data persistence
/// Use this for caching, offline data, and app state
class HiveStorageService {
  static const String _generalBox = 'okada_general';
  static const String _cacheBox = 'okada_cache';
  static const String _offlineBox = 'okada_offline';
  static const String _settingsBox = 'okada_settings';

  bool _isInitialized = false;

  late Box<dynamic> _generalBoxInstance;
  late Box<dynamic> _cacheBoxInstance;
  late Box<dynamic> _offlineBoxInstance;
  late Box<dynamic> _settingsBoxInstance;

  /// Initialize Hive and open required boxes
  Future<void> init() async {
    if (_isInitialized) return;

    // Initialize Hive for Flutter
    await Hive.initFlutter();

    // Open boxes
    _generalBoxInstance = await Hive.openBox(_generalBox);
    _cacheBoxInstance = await Hive.openBox(_cacheBox);
    _offlineBoxInstance = await Hive.openBox(_offlineBox);
    _settingsBoxInstance = await Hive.openBox(_settingsBox);

    _isInitialized = true;
  }

  void _checkInitialized() {
    if (!_isInitialized) {
      throw StateError('HiveStorageService not initialized. Call init() first.');
    }
  }

  // ============ General Storage ============

  /// Store a value in general storage
  Future<void> put(String key, dynamic value) async {
    _checkInitialized();
    await _generalBoxInstance.put(key, value);
  }

  /// Get a value from general storage
  T? get<T>(String key, {T? defaultValue}) {
    _checkInitialized();
    return _generalBoxInstance.get(key, defaultValue: defaultValue) as T?;
  }

  /// Delete a value from general storage
  Future<void> delete(String key) async {
    _checkInitialized();
    await _generalBoxInstance.delete(key);
  }

  /// Check if key exists in general storage
  bool containsKey(String key) {
    _checkInitialized();
    return _generalBoxInstance.containsKey(key);
  }

  // ============ Cache Storage ============

  /// Store cached data with optional expiry
  Future<void> cache(String key, dynamic value, {Duration? expiry}) async {
    _checkInitialized();
    final cacheEntry = {
      'data': value,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'expiry': expiry?.inMilliseconds,
    };
    await _cacheBoxInstance.put(key, cacheEntry);
  }

  /// Get cached data if not expired
  T? getCache<T>(String key) {
    _checkInitialized();
    final entry = _cacheBoxInstance.get(key);
    if (entry == null) return null;

    final Map<String, dynamic> cacheEntry = Map<String, dynamic>.from(entry);
    final timestamp = cacheEntry['timestamp'] as int;
    final expiry = cacheEntry['expiry'] as int?;

    // Check if cache has expired
    if (expiry != null) {
      final expiryTime = DateTime.fromMillisecondsSinceEpoch(timestamp + expiry);
      if (DateTime.now().isAfter(expiryTime)) {
        // Cache expired, delete it
        _cacheBoxInstance.delete(key);
        return null;
      }
    }

    return cacheEntry['data'] as T?;
  }

  /// Clear all cached data
  Future<void> clearCache() async {
    _checkInitialized();
    await _cacheBoxInstance.clear();
  }

  /// Clear expired cache entries
  Future<int> clearExpiredCache() async {
    _checkInitialized();
    int clearedCount = 0;
    final now = DateTime.now().millisecondsSinceEpoch;

    final keysToDelete = <dynamic>[];
    for (final key in _cacheBoxInstance.keys) {
      final entry = _cacheBoxInstance.get(key);
      if (entry != null) {
        final Map<String, dynamic> cacheEntry = Map<String, dynamic>.from(entry);
        final timestamp = cacheEntry['timestamp'] as int;
        final expiry = cacheEntry['expiry'] as int?;

        if (expiry != null && now > timestamp + expiry) {
          keysToDelete.add(key);
        }
      }
    }

    for (final key in keysToDelete) {
      await _cacheBoxInstance.delete(key);
      clearedCount++;
    }

    return clearedCount;
  }

  // ============ Offline Storage ============

  /// Store data for offline sync
  Future<void> storeOffline(String key, dynamic value) async {
    _checkInitialized();
    final offlineEntry = {
      'data': value,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'synced': false,
    };
    await _offlineBoxInstance.put(key, offlineEntry);
  }

  /// Get offline data
  T? getOffline<T>(String key) {
    _checkInitialized();
    final entry = _offlineBoxInstance.get(key);
    if (entry == null) return null;

    final Map<String, dynamic> offlineEntry = Map<String, dynamic>.from(entry);
    return offlineEntry['data'] as T?;
  }

  /// Get all unsynced offline data
  List<Map<String, dynamic>> getUnsyncedData() {
    _checkInitialized();
    final unsyncedList = <Map<String, dynamic>>[];

    for (final key in _offlineBoxInstance.keys) {
      final entry = _offlineBoxInstance.get(key);
      if (entry != null) {
        final Map<String, dynamic> offlineEntry = Map<String, dynamic>.from(entry);
        if (offlineEntry['synced'] == false) {
          unsyncedList.add({
            'key': key,
            ...offlineEntry,
          });
        }
      }
    }

    return unsyncedList;
  }

  /// Mark offline data as synced
  Future<void> markAsSynced(String key) async {
    _checkInitialized();
    final entry = _offlineBoxInstance.get(key);
    if (entry != null) {
      final Map<String, dynamic> offlineEntry = Map<String, dynamic>.from(entry);
      offlineEntry['synced'] = true;
      offlineEntry['syncedAt'] = DateTime.now().millisecondsSinceEpoch;
      await _offlineBoxInstance.put(key, offlineEntry);
    }
  }

  /// Delete synced offline data
  Future<int> clearSyncedData() async {
    _checkInitialized();
    int clearedCount = 0;

    final keysToDelete = <dynamic>[];
    for (final key in _offlineBoxInstance.keys) {
      final entry = _offlineBoxInstance.get(key);
      if (entry != null) {
        final Map<String, dynamic> offlineEntry = Map<String, dynamic>.from(entry);
        if (offlineEntry['synced'] == true) {
          keysToDelete.add(key);
        }
      }
    }

    for (final key in keysToDelete) {
      await _offlineBoxInstance.delete(key);
      clearedCount++;
    }

    return clearedCount;
  }

  // ============ Settings Storage ============

  /// Store a setting
  Future<void> setSetting(String key, dynamic value) async {
    _checkInitialized();
    await _settingsBoxInstance.put(key, value);
  }

  /// Get a setting
  T? getSetting<T>(String key, {T? defaultValue}) {
    _checkInitialized();
    return _settingsBoxInstance.get(key, defaultValue: defaultValue) as T?;
  }

  /// Delete a setting
  Future<void> deleteSetting(String key) async {
    _checkInitialized();
    await _settingsBoxInstance.delete(key);
  }

  // ============ Common Settings ============

  /// Get selected language
  String getLanguage() {
    return getSetting<String>('language', defaultValue: 'en') ?? 'en';
  }

  /// Set selected language
  Future<void> setLanguage(String languageCode) async {
    await setSetting('language', languageCode);
  }

  /// Get selected country
  String getCountry() {
    return getSetting<String>('country', defaultValue: 'CM') ?? 'CM';
  }

  /// Set selected country
  Future<void> setCountry(String countryCode) async {
    await setSetting('country', countryCode);
  }

  /// Get theme mode (light, dark, system)
  String getThemeMode() {
    return getSetting<String>('themeMode', defaultValue: 'system') ?? 'system';
  }

  /// Set theme mode
  Future<void> setThemeMode(String mode) async {
    await setSetting('themeMode', mode);
  }

  /// Check if onboarding is completed
  bool isOnboardingCompleted() {
    return getSetting<bool>('onboardingCompleted', defaultValue: false) ?? false;
  }

  /// Set onboarding completed
  Future<void> setOnboardingCompleted(bool completed) async {
    await setSetting('onboardingCompleted', completed);
  }

  /// Get notification preferences
  Map<String, bool> getNotificationPreferences() {
    final prefs = getSetting<Map>('notificationPreferences');
    if (prefs == null) {
      return {
        'pushEnabled': true,
        'smsEnabled': true,
        'emailEnabled': true,
        'orderUpdates': true,
        'promotions': true,
      };
    }
    return Map<String, bool>.from(prefs);
  }

  /// Set notification preferences
  Future<void> setNotificationPreferences(Map<String, bool> prefs) async {
    await setSetting('notificationPreferences', prefs);
  }

  // ============ Cleanup ============

  /// Clear all storage (use with caution)
  Future<void> clearAll() async {
    _checkInitialized();
    await _generalBoxInstance.clear();
    await _cacheBoxInstance.clear();
    await _offlineBoxInstance.clear();
    await _settingsBoxInstance.clear();
  }

  /// Close all boxes
  Future<void> close() async {
    if (!_isInitialized) return;
    await Hive.close();
    _isInitialized = false;
  }

  /// Get storage statistics
  Map<String, int> getStorageStats() {
    _checkInitialized();
    return {
      'generalCount': _generalBoxInstance.length,
      'cacheCount': _cacheBoxInstance.length,
      'offlineCount': _offlineBoxInstance.length,
      'settingsCount': _settingsBoxInstance.length,
    };
  }
}
