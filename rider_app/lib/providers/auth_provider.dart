import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/api/okada_api_client.dart';

// Rider model
class Rider {
  final String id;
  final String fullName;
  final String phoneNumber;
  final String? email;
  final String city;
  final String vehicleType;
  final String licenseNumber;
  final bool isOnline;
  final double rating;

  Rider({
    required this.id,
    required this.fullName,
    required this.phoneNumber,
    this.email,
    required this.city,
    required this.vehicleType,
    required this.licenseNumber,
    this.isOnline = false,
    this.rating = 5.0,
  });

  factory Rider.fromJson(Map<String, dynamic> json) {
    return Rider(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String,
      email: json['email'] as String?,
      city: json['city'] as String,
      vehicleType: json['vehicleType'] as String,
      licenseNumber: json['licenseNumber'] as String,
      isOnline: json['isOnline'] as bool? ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'phoneNumber': phoneNumber,
      'email': email,
      'city': city,
      'vehicleType': vehicleType,
      'licenseNumber': licenseNumber,
      'isOnline': isOnline,
      'rating': rating,
    };
  }

  Rider copyWith({
    String? id,
    String? fullName,
    String? phoneNumber,
    String? email,
    String? city,
    String? vehicleType,
    String? licenseNumber,
    bool? isOnline,
    double? rating,
  }) {
    return Rider(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      email: email ?? this.email,
      city: city ?? this.city,
      vehicleType: vehicleType ?? this.vehicleType,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      isOnline: isOnline ?? this.isOnline,
      rating: rating ?? this.rating,
    );
  }
}

// Auth state
class AuthState {
  final Rider? rider;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  AuthState({
    this.rider,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    Rider? rider,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) {
    return AuthState(
      rider: rider ?? this.rider,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

// Auth provider
class AuthNotifier extends StateNotifier<AuthState> {
  final OkadaApiClient _apiClient;

  AuthNotifier(this._apiClient) : super(AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    // TODO: Check if user is logged in from local storage
    // For now, just set to not authenticated
    state = state.copyWith(isAuthenticated: false);
  }

  Future<void> login({
    required String phoneNumber,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 2));

      // Mock rider data
      final rider = Rider(
        id: '1',
        fullName: 'Jean Dupont',
        phoneNumber: phoneNumber,
        email: 'jean@example.com',
        city: 'Douala',
        vehicleType: 'Motorcycle',
        licenseNumber: 'ABC123',
        rating: 4.8,
      );

      state = state.copyWith(
        rider: rider,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Login failed: $e',
      );
    }
  }

  Future<void> register({
    required String fullName,
    required String phoneNumber,
    String? email,
    required String dateOfBirth,
    required String city,
    required String vehicleType,
    required String licenseNumber,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 2));

      final rider = Rider(
        id: DateTime.now().toString(),
        fullName: fullName,
        phoneNumber: phoneNumber,
        email: email,
        city: city,
        vehicleType: vehicleType,
        licenseNumber: licenseNumber,
      );

      state = state.copyWith(
        rider: rider,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Registration failed: $e',
      );
    }
  }

  Future<void> logout() async {
    state = AuthState();
  }

  Future<void> toggleOnlineStatus() async {
    if (state.rider == null) return;

    final updatedRider = state.rider!.copyWith(
      isOnline: !state.rider!.isOnline,
    );

    state = state.copyWith(rider: updatedRider);

    // TODO: Update online status on server
  }
}

// Provider instance
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(okadaApiClientProvider);
  return AuthNotifier(apiClient);
});

// Current rider provider
final currentRiderProvider = Provider<Rider?>((ref) {
  return ref.watch(authProvider).rider;
});

// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

