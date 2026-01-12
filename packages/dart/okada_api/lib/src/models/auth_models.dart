/// User model
class User {
  final int id;
  final String openId;
  final String? name;
  final String? email;
  final String? phone;
  final String? avatar;
  final String role;
  final DateTime createdAt;
  final DateTime? lastSignedIn;
  
  User({
    required this.id,
    required this.openId,
    this.name,
    this.email,
    this.phone,
    this.avatar,
    required this.role,
    required this.createdAt,
    this.lastSignedIn,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      openId: json['openId'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      role: json['role'] as String? ?? 'user',
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastSignedIn: json['lastSignedIn'] != null 
          ? DateTime.parse(json['lastSignedIn'] as String) 
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'openId': openId,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'role': role,
      'createdAt': createdAt.toIso8601String(),
      'lastSignedIn': lastSignedIn?.toIso8601String(),
    };
  }
  
  bool get isAdmin => role == 'admin';
  bool get isRider => role == 'rider';
  bool get isCustomer => role == 'user' || role == 'customer';
}

/// Login request
class LoginRequest {
  final String phone;
  final String countryCode;
  
  LoginRequest({
    required this.phone,
    this.countryCode = '+237',
  });
  
  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      'countryCode': countryCode,
    };
  }
}

/// OTP verification request
class OtpVerifyRequest {
  final String phone;
  final String otp;
  final String? deviceId;
  final String? deviceType;
  
  OtpVerifyRequest({
    required this.phone,
    required this.otp,
    this.deviceId,
    this.deviceType,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      'otp': otp,
      if (deviceId != null) 'deviceId': deviceId,
      if (deviceType != null) 'deviceType': deviceType,
    };
  }
}

/// Auth response
class AuthResponse {
  final String accessToken;
  final String? refreshToken;
  final User user;
  final int expiresIn;
  
  AuthResponse({
    required this.accessToken,
    this.refreshToken,
    required this.user,
    required this.expiresIn,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String?,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      expiresIn: json['expiresIn'] as int? ?? 3600,
    );
  }
}

/// Profile update request
class ProfileUpdateRequest {
  final String? name;
  final String? email;
  final String? avatar;
  
  ProfileUpdateRequest({
    this.name,
    this.email,
    this.avatar,
  });
  
  Map<String, dynamic> toJson() {
    return {
      if (name != null) 'name': name,
      if (email != null) 'email': email,
      if (avatar != null) 'avatar': avatar,
    };
  }
}

/// Rider profile model
class RiderProfile {
  final int id;
  final int userId;
  final String? vehicleType;
  final String? vehiclePlate;
  final String? licenseNumber;
  final String status;
  final double rating;
  final int totalDeliveries;
  final double totalEarnings;
  final bool isOnline;
  final DateTime? lastLocationUpdate;
  
  RiderProfile({
    required this.id,
    required this.userId,
    this.vehicleType,
    this.vehiclePlate,
    this.licenseNumber,
    required this.status,
    this.rating = 0.0,
    this.totalDeliveries = 0,
    this.totalEarnings = 0.0,
    this.isOnline = false,
    this.lastLocationUpdate,
  });
  
  factory RiderProfile.fromJson(Map<String, dynamic> json) {
    return RiderProfile(
      id: json['id'] as int,
      userId: json['userId'] as int,
      vehicleType: json['vehicleType'] as String?,
      vehiclePlate: json['vehiclePlate'] as String?,
      licenseNumber: json['licenseNumber'] as String?,
      status: json['status'] as String? ?? 'pending',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      totalDeliveries: json['totalDeliveries'] as int? ?? 0,
      totalEarnings: (json['totalEarnings'] as num?)?.toDouble() ?? 0.0,
      isOnline: json['isOnline'] as bool? ?? false,
      lastLocationUpdate: json['lastLocationUpdate'] != null
          ? DateTime.parse(json['lastLocationUpdate'] as String)
          : null,
    );
  }
  
  bool get isApproved => status == 'approved';
  bool get isPending => status == 'pending';
  bool get isRejected => status == 'rejected';
}
