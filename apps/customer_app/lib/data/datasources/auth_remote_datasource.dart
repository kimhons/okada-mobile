import 'package:dio/dio.dart';
import '../../core/constants/app_constants.dart';
import '../../core/errors/exceptions.dart';
import '../../core/network/dio_client.dart';
import '../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  });

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  });

  Future<bool> verifyOtp({
    required String email,
    required String otp,
  });

  Future<bool> resendOtp({
    required String email,
  });

  Future<bool> forgotPassword({
    required String email,
  });

  Future<bool> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  });

  Future<Map<String, dynamic>> refreshToken({
    required String refreshToken,
  });

  Future<bool> logout();

  Future<UserModel> getProfile();

  Future<UserModel> updateProfile({
    required String firstName,
    required String lastName,
    required String phoneNumber,
    String? profileImageUrl,
  });

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<bool> updatePreferences(UserPreferencesModel preferences);

  Future<bool> deleteAccount();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final DioClient _dioClient;

  AuthRemoteDataSourceImpl(this._dioClient);

  @override
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      final data = response.data as Map<String, dynamic>;
      if (response.statusCode == 200) {
        return data;
      } else {
        throw ServerException(
          data['message'] ?? 'Login failed',
          code: data['code']?.toString(),
          details: data,
        );
      }
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Login failed: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.register,
        data: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'phoneNumber': phoneNumber,
        },
      );

      final data = response.data as Map<String, dynamic>;
      if (response.statusCode == 201) {
        return data;
      } else {
        throw ServerException(
          data['message'] ?? 'Registration failed',
          code: data['code']?.toString(),
          details: data,
        );
      }
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Registration failed: $e');
    }
  }

  @override
  Future<bool> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.verifyOtp,
        data: {
          'email': email,
          'otp': otp,
        },
      );

      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('OTP verification failed: $e');
    }
  }

  @override
  Future<bool> resendOtp({
    required String email,
  }) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.verifyOtp,
        data: {
          'email': email,
          'action': 'resend',
        },
      );

      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Resend OTP failed: $e');
    }
  }

  @override
  Future<bool> forgotPassword({
    required String email,
  }) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.forgotPassword,
        data: {
          'email': email,
        },
      );

      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Forgot password failed: $e');
    }
  }

  @override
  Future<bool> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.resetPassword,
        data: {
          'email': email,
          'otp': otp,
          'newPassword': newPassword,
        },
      );

      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Reset password failed: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> refreshToken({
    required String refreshToken,
  }) async {
    try {
      final response = await _dioClient.post(
        ApiEndpoints.refreshToken,
        data: {
          'refreshToken': refreshToken,
        },
      );

      final data = response.data as Map<String, dynamic>;
      if (response.statusCode == 200) {
        return data;
      } else {
        throw ServerException(
          data['message'] ?? 'Token refresh failed',
          code: data['code']?.toString(),
          details: data,
        );
      }
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Token refresh failed: $e');
    }
  }

  @override
  Future<bool> logout() async {
    try {
      final response = await _dioClient.post(ApiEndpoints.logout);
      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Logout failed: $e');
    }
  }

  @override
  Future<UserModel> getProfile() async {
    try {
      final response = await _dioClient.get(ApiEndpoints.profile);

      final data = response.data as Map<String, dynamic>;
      if (response.statusCode == 200) {
        return UserModel.fromJson(data);
      } else {
        throw ServerException(
          data['message'] ?? 'Failed to get profile',
          code: data['code']?.toString(),
          details: data,
        );
      }
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Get profile failed: $e');
    }
  }

  @override
  Future<UserModel> updateProfile({
    required String firstName,
    required String lastName,
    required String phoneNumber,
    String? profileImageUrl,
  }) async {
    try {
      final response = await _dioClient.put(
        ApiEndpoints.updateProfile,
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'phoneNumber': phoneNumber,
          if (profileImageUrl != null) 'profileImageUrl': profileImageUrl,
        },
      );

      final data = response.data as Map<String, dynamic>;
      if (response.statusCode == 200) {
        return UserModel.fromJson(data);
      } else {
        throw ServerException(
          data['message'] ?? 'Profile update failed',
          code: data['code']?.toString(),
          details: data,
        );
      }
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Profile update failed: $e');
    }
  }

  @override
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _dioClient.put(
        '${ApiEndpoints.profile}/password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Change password failed: $e');
    }
  }

  @override
  Future<bool> updatePreferences(UserPreferencesModel preferences) async {
    try {
      final response = await _dioClient.put(
        '${ApiEndpoints.profile}/preferences',
        data: preferences.toJson(),
      );

      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Update preferences failed: $e');
    }
  }

  @override
  Future<bool> deleteAccount() async {
    try {
      final response = await _dioClient.delete(ApiEndpoints.profile);
      return response.statusCode == 200;
    } on AppException {
      rethrow;
    } catch (e) {
      throw ServerException('Delete account failed: $e');
    }
  }
}