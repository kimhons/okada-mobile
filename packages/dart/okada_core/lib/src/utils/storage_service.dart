import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/storage_keys.dart';

/// Secure storage service for sensitive data like tokens and credentials
class StorageService {
  late final FlutterSecureStorage _storage;
  bool _isInitialized = false;

  /// Initialize the storage service
  Future<void> init() async {
    if (_isInitialized) return;
    
    _storage = const FlutterSecureStorage(
      aOptions: AndroidOptions(
        encryptedSharedPreferences: true,
      ),
      iOptions: IOSOptions(
        accessibility: KeychainAccessibility.first_unlock_this_device,
      ),
    );
    _isInitialized = true;
  }

  void _checkInitialized() {
    if (!_isInitialized) {
      throw StateError('StorageService not initialized. Call init() first.');
    }
  }

  /// Write a value to secure storage
  Future<void> write({required String key, required String value}) async {
    _checkInitialized();
    await _storage.write(key: key, value: value);
  }

  /// Read a value from secure storage
  Future<String?> read({required String key}) async {
    _checkInitialized();
    return await _storage.read(key: key);
  }

  /// Delete a value from secure storage
  Future<void> delete({required String key}) async {
    _checkInitialized();
    await _storage.delete(key: key);
  }

  /// Delete all values from secure storage
  Future<void> deleteAll() async {
    _checkInitialized();
    await _storage.deleteAll();
  }

  /// Check if a key exists in secure storage
  Future<bool> containsKey({required String key}) async {
    _checkInitialized();
    return await _storage.containsKey(key: key);
  }

  /// Read all values from secure storage
  Future<Map<String, String>> readAll() async {
    _checkInitialized();
    return await _storage.readAll();
  }

  // Convenience methods for common operations

  /// Store access token
  Future<void> setAccessToken(String token) async {
    await write(key: StorageKeys.accessToken, value: token);
  }

  /// Get access token
  Future<String?> getAccessToken() async {
    return await read(key: StorageKeys.accessToken);
  }

  /// Store refresh token
  Future<void> setRefreshToken(String token) async {
    await write(key: StorageKeys.refreshToken, value: token);
  }

  /// Get refresh token
  Future<String?> getRefreshToken() async {
    return await read(key: StorageKeys.refreshToken);
  }

  /// Store user ID
  Future<void> setUserId(String userId) async {
    await write(key: StorageKeys.userId, value: userId);
  }

  /// Get user ID
  Future<String?> getUserId() async {
    return await read(key: StorageKeys.userId);
  }

  /// Clear all authentication data
  Future<void> clearAuthData() async {
    await delete(key: StorageKeys.accessToken);
    await delete(key: StorageKeys.refreshToken);
    await delete(key: StorageKeys.userId);
    await delete(key: StorageKeys.tokenExpiry);
  }

  /// Store biometric enabled status
  Future<void> setBiometricEnabled(bool enabled) async {
    await write(key: StorageKeys.biometricEnabled, value: enabled.toString());
  }

  /// Get biometric enabled status
  Future<bool> getBiometricEnabled() async {
    final value = await read(key: StorageKeys.biometricEnabled);
    return value == 'true';
  }
}
