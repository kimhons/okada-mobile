import 'phone_number.dart';

/// Authenticated user model
class AuthUser {
  /// Unique user identifier
  final String id;
  
  /// User's phone number
  final PhoneNumber? phoneNumber;
  
  /// User's email address
  final String? email;
  
  /// User's first name
  final String? firstName;
  
  /// User's last name
  final String? lastName;
  
  /// Profile image URL
  final String? profileImageUrl;
  
  /// Whether email is verified
  final bool emailVerified;
  
  /// Whether phone is verified
  final bool phoneVerified;
  
  /// User's preferred language
  final String preferredLanguage;
  
  /// User's country code
  final String countryCode;
  
  /// Account creation date
  final DateTime createdAt;
  
  /// Last login date
  final DateTime? lastLoginAt;
  
  /// User role
  final UserRole role;
  
  /// Account status
  final AccountStatus status;
  
  /// User preferences
  final UserPreferences preferences;
  
  /// Authentication method used
  final AuthMethod authMethod;
  
  /// Whether biometric is enabled
  final bool biometricEnabled;
  
  const AuthUser({
    required this.id,
    this.phoneNumber,
    this.email,
    this.firstName,
    this.lastName,
    this.profileImageUrl,
    this.emailVerified = false,
    this.phoneVerified = false,
    this.preferredLanguage = 'en',
    this.countryCode = 'CM',
    required this.createdAt,
    this.lastLoginAt,
    this.role = UserRole.customer,
    this.status = AccountStatus.active,
    this.preferences = const UserPreferences(),
    this.authMethod = AuthMethod.phone,
    this.biometricEnabled = false,
  });
  
  /// Full name
  String get fullName {
    if (firstName == null && lastName == null) return '';
    return '${firstName ?? ''} ${lastName ?? ''}'.trim();
  }
  
  /// Display name (full name or phone/email)
  String get displayName {
    if (fullName.isNotEmpty) return fullName;
    if (phoneNumber != null) return phoneNumber!.displayFormat;
    if (email != null) return email!;
    return 'User';
  }
  
  /// Initials for avatar
  String get initials {
    if (firstName != null && lastName != null) {
      return '${firstName![0]}${lastName![0]}'.toUpperCase();
    }
    if (firstName != null) return firstName![0].toUpperCase();
    if (lastName != null) return lastName![0].toUpperCase();
    return 'U';
  }
  
  /// Whether profile is complete
  bool get isProfileComplete {
    return firstName != null && 
           lastName != null && 
           (phoneVerified || emailVerified);
  }
  
  /// Whether account is active
  bool get isActive => status == AccountStatus.active;
  
  /// Whether user is a customer
  bool get isCustomer => role == UserRole.customer;
  
  /// Whether user is a rider
  bool get isRider => role == UserRole.rider;
  
  /// Whether user is a vendor
  bool get isVendor => role == UserRole.vendor;
  
  /// Whether user is an admin
  bool get isAdmin => role == UserRole.admin;
  
  /// Create a guest user
  factory AuthUser.guest({
    required String deviceId,
    String countryCode = 'CM',
    String preferredLanguage = 'en',
  }) {
    return AuthUser(
      id: 'guest_$deviceId',
      countryCode: countryCode,
      preferredLanguage: preferredLanguage,
      createdAt: DateTime.now(),
      role: UserRole.guest,
      status: AccountStatus.active,
      authMethod: AuthMethod.guest,
    );
  }
  
  /// Copy with new values
  AuthUser copyWith({
    String? id,
    PhoneNumber? phoneNumber,
    String? email,
    String? firstName,
    String? lastName,
    String? profileImageUrl,
    bool? emailVerified,
    bool? phoneVerified,
    String? preferredLanguage,
    String? countryCode,
    DateTime? createdAt,
    DateTime? lastLoginAt,
    UserRole? role,
    AccountStatus? status,
    UserPreferences? preferences,
    AuthMethod? authMethod,
    bool? biometricEnabled,
  }) {
    return AuthUser(
      id: id ?? this.id,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      emailVerified: emailVerified ?? this.emailVerified,
      phoneVerified: phoneVerified ?? this.phoneVerified,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
      countryCode: countryCode ?? this.countryCode,
      createdAt: createdAt ?? this.createdAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      role: role ?? this.role,
      status: status ?? this.status,
      preferences: preferences ?? this.preferences,
      authMethod: authMethod ?? this.authMethod,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
    );
  }
  
  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phoneNumber': phoneNumber?.e164Format,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'profileImageUrl': profileImageUrl,
      'emailVerified': emailVerified,
      'phoneVerified': phoneVerified,
      'preferredLanguage': preferredLanguage,
      'countryCode': countryCode,
      'createdAt': createdAt.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
      'role': role.name,
      'status': status.name,
      'preferences': preferences.toJson(),
      'authMethod': authMethod.name,
      'biometricEnabled': biometricEnabled,
    };
  }
  
  /// Create from JSON
  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      phoneNumber: json['phoneNumber'] != null 
          ? PhoneNumber.fromE164(json['phoneNumber'] as String)
          : null,
      email: json['email'] as String?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      profileImageUrl: json['profileImageUrl'] as String?,
      emailVerified: json['emailVerified'] as bool? ?? false,
      phoneVerified: json['phoneVerified'] as bool? ?? false,
      preferredLanguage: json['preferredLanguage'] as String? ?? 'en',
      countryCode: json['countryCode'] as String? ?? 'CM',
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastLoginAt: json['lastLoginAt'] != null 
          ? DateTime.parse(json['lastLoginAt'] as String)
          : null,
      role: UserRole.values.firstWhere(
        (r) => r.name == json['role'],
        orElse: () => UserRole.customer,
      ),
      status: AccountStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => AccountStatus.active,
      ),
      preferences: json['preferences'] != null
          ? UserPreferences.fromJson(json['preferences'] as Map<String, dynamic>)
          : const UserPreferences(),
      authMethod: AuthMethod.values.firstWhere(
        (m) => m.name == json['authMethod'],
        orElse: () => AuthMethod.phone,
      ),
      biometricEnabled: json['biometricEnabled'] as bool? ?? false,
    );
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuthUser && other.id == id;
  }
  
  @override
  int get hashCode => id.hashCode;
}

/// User role
enum UserRole {
  /// Guest user (not authenticated)
  guest,
  
  /// Regular customer
  customer,
  
  /// Delivery rider
  rider,
  
  /// Store vendor
  vendor,
  
  /// Platform administrator
  admin,
}

/// Account status
enum AccountStatus {
  /// Account is active
  active,
  
  /// Account is pending verification
  pending,
  
  /// Account is suspended
  suspended,
  
  /// Account is deactivated
  deactivated,
  
  /// Account is banned
  banned,
}

/// Authentication method
enum AuthMethod {
  /// Phone number with OTP
  phone,
  
  /// Email with password
  email,
  
  /// Social login (Google, Facebook, Apple)
  social,
  
  /// Biometric authentication
  biometric,
  
  /// Guest mode
  guest,
}

/// User preferences
class UserPreferences {
  /// Push notifications enabled
  final bool pushNotificationsEnabled;
  
  /// Email notifications enabled
  final bool emailNotificationsEnabled;
  
  /// SMS notifications enabled
  final bool smsNotificationsEnabled;
  
  /// Order updates enabled
  final bool orderUpdatesEnabled;
  
  /// Promotional notifications enabled
  final bool promotionalNotificationsEnabled;
  
  /// Dark mode preference
  final ThemePreference themePreference;
  
  /// Default payment method ID
  final String? defaultPaymentMethodId;
  
  /// Default delivery address ID
  final String? defaultAddressId;
  
  const UserPreferences({
    this.pushNotificationsEnabled = true,
    this.emailNotificationsEnabled = true,
    this.smsNotificationsEnabled = true,
    this.orderUpdatesEnabled = true,
    this.promotionalNotificationsEnabled = false,
    this.themePreference = ThemePreference.system,
    this.defaultPaymentMethodId,
    this.defaultAddressId,
  });
  
  /// Copy with new values
  UserPreferences copyWith({
    bool? pushNotificationsEnabled,
    bool? emailNotificationsEnabled,
    bool? smsNotificationsEnabled,
    bool? orderUpdatesEnabled,
    bool? promotionalNotificationsEnabled,
    ThemePreference? themePreference,
    String? defaultPaymentMethodId,
    String? defaultAddressId,
  }) {
    return UserPreferences(
      pushNotificationsEnabled: pushNotificationsEnabled ?? this.pushNotificationsEnabled,
      emailNotificationsEnabled: emailNotificationsEnabled ?? this.emailNotificationsEnabled,
      smsNotificationsEnabled: smsNotificationsEnabled ?? this.smsNotificationsEnabled,
      orderUpdatesEnabled: orderUpdatesEnabled ?? this.orderUpdatesEnabled,
      promotionalNotificationsEnabled: promotionalNotificationsEnabled ?? this.promotionalNotificationsEnabled,
      themePreference: themePreference ?? this.themePreference,
      defaultPaymentMethodId: defaultPaymentMethodId ?? this.defaultPaymentMethodId,
      defaultAddressId: defaultAddressId ?? this.defaultAddressId,
    );
  }
  
  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'pushNotificationsEnabled': pushNotificationsEnabled,
      'emailNotificationsEnabled': emailNotificationsEnabled,
      'smsNotificationsEnabled': smsNotificationsEnabled,
      'orderUpdatesEnabled': orderUpdatesEnabled,
      'promotionalNotificationsEnabled': promotionalNotificationsEnabled,
      'themePreference': themePreference.name,
      'defaultPaymentMethodId': defaultPaymentMethodId,
      'defaultAddressId': defaultAddressId,
    };
  }
  
  /// Create from JSON
  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      pushNotificationsEnabled: json['pushNotificationsEnabled'] as bool? ?? true,
      emailNotificationsEnabled: json['emailNotificationsEnabled'] as bool? ?? true,
      smsNotificationsEnabled: json['smsNotificationsEnabled'] as bool? ?? true,
      orderUpdatesEnabled: json['orderUpdatesEnabled'] as bool? ?? true,
      promotionalNotificationsEnabled: json['promotionalNotificationsEnabled'] as bool? ?? false,
      themePreference: ThemePreference.values.firstWhere(
        (t) => t.name == json['themePreference'],
        orElse: () => ThemePreference.system,
      ),
      defaultPaymentMethodId: json['defaultPaymentMethodId'] as String?,
      defaultAddressId: json['defaultAddressId'] as String?,
    );
  }
}

/// Theme preference
enum ThemePreference {
  /// Follow system setting
  system,
  
  /// Always light mode
  light,
  
  /// Always dark mode
  dark,
}
