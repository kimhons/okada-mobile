import '../client/api_client.dart';
import '../models/auth_models.dart';
import '../exceptions/api_exceptions.dart';

/// Authentication service for mobile apps
class AuthService {
  final OkadaApiClient _client;
  
  AuthService(this._client);
  
  /// Request OTP for phone number
  Future<bool> requestOtp(String phone, {String countryCode = '+237'}) async {
    try {
      final response = await _client.post('/api/mobile/auth/request-otp', data: {
        'phone': phone,
        'countryCode': countryCode,
      });
      return response.statusCode == 200;
    } catch (e) {
      rethrow;
    }
  }
  
  /// Verify OTP and login
  Future<AuthResponse> verifyOtp(OtpVerifyRequest request) async {
    try {
      final response = await _client.post(
        '/api/mobile/auth/verify-otp',
        data: request.toJson(),
      );
      
      final authResponse = AuthResponse.fromJson(response.data);
      await _client.setAccessToken(authResponse.accessToken);
      return authResponse;
    } catch (e) {
      rethrow;
    }
  }
  
  /// Get current user profile
  Future<User?> getCurrentUser() async {
    if (!_client.isAuthenticated) return null;
    
    try {
      final response = await _client.get('/api/mobile/auth/me');
      return User.fromJson(response.data);
    } on UnauthorizedException {
      await _client.clearAccessToken();
      return null;
    } catch (e) {
      rethrow;
    }
  }
  
  /// Update user profile
  Future<User> updateProfile(ProfileUpdateRequest request) async {
    try {
      final response = await _client.patch(
        '/api/mobile/auth/profile',
        data: request.toJson(),
      );
      return User.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Upload profile avatar
  Future<String> uploadAvatar(String filePath) async {
    try {
      final response = await _client.uploadFile(
        '/api/mobile/auth/avatar',
        filePath: filePath,
        fieldName: 'avatar',
      );
      return response.data['url'] as String;
    } catch (e) {
      rethrow;
    }
  }
  
  /// Logout
  Future<void> logout() async {
    try {
      await _client.post('/api/mobile/auth/logout');
    } finally {
      await _client.clearAccessToken();
    }
  }
  
  /// Delete account
  Future<void> deleteAccount() async {
    try {
      await _client.delete('/api/mobile/auth/account');
      await _client.clearAccessToken();
    } catch (e) {
      rethrow;
    }
  }
  
  /// Register push notification token
  Future<void> registerPushToken(String token, String platform) async {
    try {
      await _client.post('/api/mobile/auth/push-token', data: {
        'token': token,
        'platform': platform,
      });
    } catch (e) {
      // Silently fail for push token registration
    }
  }
  
  /// Check if user is authenticated
  bool get isAuthenticated => _client.isAuthenticated;
}

/// Rider-specific auth service
class RiderAuthService extends AuthService {
  RiderAuthService(OkadaApiClient client) : super(client);
  
  /// Get rider profile
  Future<RiderProfile?> getRiderProfile() async {
    try {
      final response = await _client.get('/api/mobile/rider/profile');
      return RiderProfile.fromJson(response.data);
    } on NotFoundException {
      return null;
    } catch (e) {
      rethrow;
    }
  }
  
  /// Register as rider
  Future<RiderProfile> registerAsRider({
    required String vehicleType,
    required String vehiclePlate,
    required String licenseNumber,
  }) async {
    try {
      final response = await _client.post('/api/mobile/rider/register', data: {
        'vehicleType': vehicleType,
        'vehiclePlate': vehiclePlate,
        'licenseNumber': licenseNumber,
      });
      return RiderProfile.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
  
  /// Upload rider document
  Future<String> uploadDocument({
    required String filePath,
    required String documentType,
  }) async {
    try {
      final response = await _client.uploadFile(
        '/api/mobile/rider/documents',
        filePath: filePath,
        fieldName: 'document',
        additionalData: {'type': documentType},
      );
      return response.data['url'] as String;
    } catch (e) {
      rethrow;
    }
  }
  
  /// Update rider online status
  Future<void> setOnlineStatus(bool isOnline) async {
    try {
      await _client.patch('/api/mobile/rider/status', data: {
        'isOnline': isOnline,
      });
    } catch (e) {
      rethrow;
    }
  }
  
  /// Update rider location
  Future<void> updateLocation(double latitude, double longitude) async {
    try {
      await _client.post('/api/mobile/rider/location', data: {
        'latitude': latitude,
        'longitude': longitude,
      });
    } catch (e) {
      // Silently fail for location updates
    }
  }
}
