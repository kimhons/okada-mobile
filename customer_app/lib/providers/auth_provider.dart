import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:okada_shared/api/okada_api_client.dart';

/// Authentication state
class AuthState {
  final bool isAuthenticated;
  final Map<String, dynamic>? user;
  final String? accessToken;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.user,
    this.accessToken,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    Map<String, dynamic>? user,
    String? accessToken,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Authentication state notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final OkadaApiClient apiClient;
  final FlutterSecureStorage secureStorage;

  AuthNotifier(this.apiClient, this.secureStorage) : super(const AuthState()) {
    _restoreSession();
  }

  /// Restore session from secure storage
  Future<void> _restoreSession() async {
    try {
      final token = await secureStorage.read(key: 'access_token');
      if (token != null) {
        apiClient.setAccessToken(token);
        
        // Verify token is still valid
        final user = await apiClient.getCurrentUser();
        
        state = state.copyWith(
          isAuthenticated: true,
          user: user,
          accessToken: token,
        );
      }
    } catch (e) {
      // Token expired or invalid, clear it
      await secureStorage.delete(key: 'access_token');
      apiClient.clearAccessToken();
    }
  }

  /// Login with phone number and OTP
  Future<void> loginWithPhone(String phoneNumber) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // In production, this would send OTP to phone
      // For now, we'll simulate with email/password
      // TODO: Implement actual OTP flow
      
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Login with email and password
  Future<void> loginWithEmail(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiClient.login(
        email: email,
        password: password,
      );

      final accessToken = response['access_token'] as String;
      final user = response['user'] as Map<String, dynamic>;

      // Save token to secure storage
      await secureStorage.write(key: 'access_token', value: accessToken);

      state = state.copyWith(
        isAuthenticated: true,
        user: user,
        accessToken: accessToken,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Register new user
  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    String language = 'fr',
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiClient.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: 'customer',
        language: language,
      );

      final accessToken = response['access_token'] as String;
      final user = response['user'] as Map<String, dynamic>;

      // Save token to secure storage
      await secureStorage.write(key: 'access_token', value: accessToken);

      state = state.copyWith(
        isAuthenticated: true,
        user: user,
        accessToken: accessToken,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await apiClient.logout();
    } catch (e) {
      if (kDebugMode) {
        print('Logout API call failed: $e');
      }
    }

    // Clear local state regardless of API call result
    await secureStorage.delete(key: 'access_token');
    apiClient.clearAccessToken();

    state = const AuthState();
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }
}

/// Secure storage provider
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// API client provider
final apiClientProvider = Provider<OkadaApiClient>((ref) {
  return OkadaApiClient();
});

/// Auth state provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  return AuthNotifier(apiClient, secureStorage);
});

