import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/api/okada_api_client.dart';

// User model
class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final DateTime? dateOfBirth;
  final String? avatarUrl;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.dateOfBirth,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      dateOfBirth: json['dateOfBirth'] != null
          ? DateTime.parse(json['dateOfBirth'] as String)
          : null,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'avatarUrl': avatarUrl,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    DateTime? dateOfBirth,
    String? avatarUrl,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }
}

// Profile state
class ProfileState {
  final User? user;
  final bool isLoading;
  final String? error;

  ProfileState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  ProfileState copyWith({
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return ProfileState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Profile provider
class ProfileNotifier extends StateNotifier<ProfileState> {
  final OkadaApiClient _apiClient;

  ProfileNotifier(this._apiClient) : super(ProfileState()) {
    loadProfile();
  }

  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 1));

      // Mock user data
      final user = User(
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+237 6XX XXX XXX',
        dateOfBirth: DateTime(1990, 1, 15),
      );

      state = state.copyWith(user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load profile: $e',
      );
    }
  }

  Future<void> updateProfile({
    required String name,
    required String email,
    required String phone,
    DateTime? dateOfBirth,
  }) async {
    if (state.user == null) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 1));

      final updatedUser = state.user!.copyWith(
        name: name,
        email: email,
        phone: phone,
        dateOfBirth: dateOfBirth,
      );

      state = state.copyWith(user: updatedUser, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to update profile: $e',
      );
    }
  }

  Future<void> updateAvatar(String avatarUrl) async {
    if (state.user == null) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 1));

      final updatedUser = state.user!.copyWith(avatarUrl: avatarUrl);

      state = state.copyWith(user: updatedUser, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to update avatar: $e',
      );
    }
  }

  Future<void> deleteAccount() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 1));

      state = ProfileState(); // Reset state
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to delete account: $e',
      );
    }
  }
}

// Provider instance
final profileProvider =
    StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  final apiClient = ref.watch(okadaApiClientProvider);
  return ProfileNotifier(apiClient);
});

