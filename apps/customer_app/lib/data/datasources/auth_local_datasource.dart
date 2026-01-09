import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_constants.dart';
import '../../core/errors/exceptions.dart';
import '../../core/storage/hive_storage.dart';
import '../models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<UserModel?> getCachedUser();
  Future<void> cacheUser(UserModel user);
  Future<void> clearCachedUser();

  Future<String?> getAccessToken();
  Future<String?> getRefreshToken();
  Future<void> saveTokens(String accessToken, String refreshToken);
  Future<void> clearTokens();

  Future<bool> getOnboardingStatus();
  Future<void> setOnboardingCompleted();

  Stream<UserModel?> get userStream;
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final HiveStorage _hiveStorage;
  final SharedPreferences _sharedPreferences;
  final StreamController<UserModel?> _userController = StreamController<UserModel?>.broadcast();

  AuthLocalDataSourceImpl(this._hiveStorage, this._sharedPreferences);

  @override
  Future<UserModel?> getCachedUser() async {
    try {
      return _hiveStorage.getUser();
    } catch (e) {
      throw CacheException('Failed to get cached user: $e');
    }
  }

  @override
  Future<void> cacheUser(UserModel user) async {
    try {
      await _hiveStorage.saveUser(user);
      _userController.add(user);
    } catch (e) {
      throw CacheException('Failed to cache user: $e');
    }
  }

  @override
  Future<void> clearCachedUser() async {
    try {
      await _hiveStorage.deleteUser();
      _userController.add(null);
    } catch (e) {
      throw CacheException('Failed to clear cached user: $e');
    }
  }

  @override
  Future<String?> getAccessToken() async {
    try {
      return _sharedPreferences.getString(AppConstants.userTokenKey);
    } catch (e) {
      throw StorageException('Failed to get access token: $e');
    }
  }

  @override
  Future<String?> getRefreshToken() async {
    try {
      return _sharedPreferences.getString(AppConstants.refreshTokenKey);
    } catch (e) {
      throw StorageException('Failed to get refresh token: $e');
    }
  }

  @override
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    try {
      await Future.wait([
        _sharedPreferences.setString(AppConstants.userTokenKey, accessToken),
        _sharedPreferences.setString(AppConstants.refreshTokenKey, refreshToken),
      ]);
    } catch (e) {
      throw StorageException('Failed to save tokens: $e');
    }
  }

  @override
  Future<void> clearTokens() async {
    try {
      await Future.wait([
        _sharedPreferences.remove(AppConstants.userTokenKey),
        _sharedPreferences.remove(AppConstants.refreshTokenKey),
      ]);
    } catch (e) {
      throw StorageException('Failed to clear tokens: $e');
    }
  }

  @override
  Future<bool> getOnboardingStatus() async {
    try {
      return _sharedPreferences.getBool(AppConstants.onboardingKey) ?? false;
    } catch (e) {
      throw StorageException('Failed to get onboarding status: $e');
    }
  }

  @override
  Future<void> setOnboardingCompleted() async {
    try {
      await _sharedPreferences.setBool(AppConstants.onboardingKey, true);
    } catch (e) {
      throw StorageException('Failed to set onboarding completed: $e');
    }
  }

  @override
  Stream<UserModel?> get userStream => _userController.stream;

  void dispose() {
    _userController.close();
  }
}