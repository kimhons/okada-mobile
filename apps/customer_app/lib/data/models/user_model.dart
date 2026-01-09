import 'package:hive/hive.dart';
import '../../domain/entities/user.dart';

part 'user_model.g.dart';

@HiveType(typeId: 0)
class UserModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String email;

  @HiveField(2)
  final String firstName;

  @HiveField(3)
  final String lastName;

  @HiveField(4)
  final String phoneNumber;

  @HiveField(5)
  final String? profileImageUrl;

  @HiveField(6)
  final bool isEmailVerified;

  @HiveField(7)
  final bool isPhoneVerified;

  @HiveField(8)
  final DateTime createdAt;

  @HiveField(9)
  final DateTime? updatedAt;

  @HiveField(10)
  final UserPreferencesModel preferences;

  @HiveField(11)
  final List<AddressModel> addresses;

  @HiveField(12)
  final List<PaymentMethodModel> paymentMethods;

  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    this.profileImageUrl,
    required this.isEmailVerified,
    required this.isPhoneVerified,
    required this.createdAt,
    this.updatedAt,
    required this.preferences,
    required this.addresses,
    required this.paymentMethods,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      profileImageUrl: json['profileImageUrl'],
      isEmailVerified: json['isEmailVerified'] ?? false,
      isPhoneVerified: json['isPhoneVerified'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
      preferences: UserPreferencesModel.fromJson(json['preferences'] ?? {}),
      addresses: (json['addresses'] as List<dynamic>?)
          ?.map((e) => AddressModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      paymentMethods: (json['paymentMethods'] as List<dynamic>?)
          ?.map((e) => PaymentMethodModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': phoneNumber,
      'profileImageUrl': profileImageUrl,
      'isEmailVerified': isEmailVerified,
      'isPhoneVerified': isPhoneVerified,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'preferences': preferences.toJson(),
      'addresses': addresses.map((e) => e.toJson()).toList(),
      'paymentMethods': paymentMethods.map((e) => e.toJson()).toList(),
    };
  }

  User toEntity() {
    return User(
      id: id,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      profileImageUrl: profileImageUrl,
      isEmailVerified: isEmailVerified,
      isPhoneVerified: isPhoneVerified,
      createdAt: createdAt,
      updatedAt: updatedAt,
      preferences: preferences.toEntity(),
      addresses: addresses.map((e) => e.toEntity()).toList(),
      paymentMethods: paymentMethods.map((e) => e.toEntity()).toList(),
    );
  }

  factory UserModel.fromEntity(User user) {
    return UserModel(
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profileImageUrl: user.profileImageUrl,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: UserPreferencesModel.fromEntity(user.preferences),
      addresses: user.addresses.map((e) => AddressModel.fromEntity(e)).toList(),
      paymentMethods: user.paymentMethods.map((e) => PaymentMethodModel.fromEntity(e)).toList(),
    );
  }
}

@HiveType(typeId: 1)
class UserPreferencesModel extends HiveObject {
  @HiveField(0)
  final String language;

  @HiveField(1)
  final String currency;

  @HiveField(2)
  final bool notificationsEnabled;

  @HiveField(3)
  final bool locationEnabled;

  @HiveField(4)
  final bool biometricsEnabled;

  @HiveField(5)
  final String theme;

  UserPreferencesModel({
    this.language = 'en',
    this.currency = 'XAF',
    this.notificationsEnabled = true,
    this.locationEnabled = true,
    this.biometricsEnabled = false,
    this.theme = 'system',
  });

  factory UserPreferencesModel.fromJson(Map<String, dynamic> json) {
    return UserPreferencesModel(
      language: json['language'] ?? 'en',
      currency: json['currency'] ?? 'XAF',
      notificationsEnabled: json['notificationsEnabled'] ?? true,
      locationEnabled: json['locationEnabled'] ?? true,
      biometricsEnabled: json['biometricsEnabled'] ?? false,
      theme: json['theme'] ?? 'system',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'language': language,
      'currency': currency,
      'notificationsEnabled': notificationsEnabled,
      'locationEnabled': locationEnabled,
      'biometricsEnabled': biometricsEnabled,
      'theme': theme,
    };
  }

  UserPreferences toEntity() {
    return UserPreferences(
      language: language,
      currency: currency,
      notificationsEnabled: notificationsEnabled,
      locationEnabled: locationEnabled,
      biometricsEnabled: biometricsEnabled,
      theme: theme,
    );
  }

  factory UserPreferencesModel.fromEntity(UserPreferences preferences) {
    return UserPreferencesModel(
      language: preferences.language,
      currency: preferences.currency,
      notificationsEnabled: preferences.notificationsEnabled,
      locationEnabled: preferences.locationEnabled,
      biometricsEnabled: preferences.biometricsEnabled,
      theme: preferences.theme,
    );
  }
}

@HiveType(typeId: 2)
class AddressModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String streetAddress;

  @HiveField(3)
  final String? landmark;

  @HiveField(4)
  final String city;

  @HiveField(5)
  final String region;

  @HiveField(6)
  final String? postalCode;

  @HiveField(7)
  final double latitude;

  @HiveField(8)
  final double longitude;

  @HiveField(9)
  final bool isDefault;

  @HiveField(10)
  final int addressType; // AddressType enum as int

  @HiveField(11)
  final DateTime createdAt;

  @HiveField(12)
  final DateTime? updatedAt;

  AddressModel({
    required this.id,
    required this.title,
    required this.streetAddress,
    this.landmark,
    required this.city,
    required this.region,
    this.postalCode,
    required this.latitude,
    required this.longitude,
    this.isDefault = false,
    this.addressType = 2, // AddressType.other
    required this.createdAt,
    this.updatedAt,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      streetAddress: json['streetAddress'] ?? '',
      landmark: json['landmark'],
      city: json['city'] ?? '',
      region: json['region'] ?? '',
      postalCode: json['postalCode'],
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      isDefault: json['isDefault'] ?? false,
      addressType: _addressTypeToInt(json['type']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'streetAddress': streetAddress,
      'landmark': landmark,
      'city': city,
      'region': region,
      'postalCode': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'isDefault': isDefault,
      'type': _intToAddressType(addressType),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Address toEntity() {
    return Address(
      id: id,
      title: title,
      streetAddress: streetAddress,
      landmark: landmark,
      city: city,
      region: region,
      postalCode: postalCode,
      latitude: latitude,
      longitude: longitude,
      isDefault: isDefault,
      type: _intToAddressTypeEnum(addressType),
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory AddressModel.fromEntity(Address address) {
    return AddressModel(
      id: address.id,
      title: address.title,
      streetAddress: address.streetAddress,
      landmark: address.landmark,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
      addressType: _addressTypeEnumToInt(address.type),
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    );
  }

  static int _addressTypeToInt(String? type) {
    switch (type) {
      case 'home':
        return 0;
      case 'work':
        return 1;
      case 'other':
      default:
        return 2;
    }
  }

  static String _intToAddressType(int type) {
    switch (type) {
      case 0:
        return 'home';
      case 1:
        return 'work';
      case 2:
      default:
        return 'other';
    }
  }

  static AddressType _intToAddressTypeEnum(int type) {
    switch (type) {
      case 0:
        return AddressType.home;
      case 1:
        return AddressType.work;
      case 2:
      default:
        return AddressType.other;
    }
  }

  static int _addressTypeEnumToInt(AddressType type) {
    switch (type) {
      case AddressType.home:
        return 0;
      case AddressType.work:
        return 1;
      case AddressType.other:
        return 2;
    }
  }
}

@HiveType(typeId: 3)
class PaymentMethodModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final int paymentType; // PaymentMethodType enum as int

  @HiveField(3)
  final String? phoneNumber;

  @HiveField(4)
  final String? cardNumber;

  @HiveField(5)
  final String? cardHolderName;

  @HiveField(6)
  final String? expiryMonth;

  @HiveField(7)
  final String? expiryYear;

  @HiveField(8)
  final bool isDefault;

  @HiveField(9)
  final DateTime createdAt;

  @HiveField(10)
  final DateTime? updatedAt;

  PaymentMethodModel({
    required this.id,
    required this.title,
    required this.paymentType,
    this.phoneNumber,
    this.cardNumber,
    this.cardHolderName,
    this.expiryMonth,
    this.expiryYear,
    this.isDefault = false,
    required this.createdAt,
    this.updatedAt,
  });

  factory PaymentMethodModel.fromJson(Map<String, dynamic> json) {
    return PaymentMethodModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      paymentType: _paymentTypeToInt(json['type']),
      phoneNumber: json['phoneNumber'],
      cardNumber: json['cardNumber'],
      cardHolderName: json['cardHolderName'],
      expiryMonth: json['expiryMonth'],
      expiryYear: json['expiryYear'],
      isDefault: json['isDefault'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'type': _intToPaymentType(paymentType),
      'phoneNumber': phoneNumber,
      'cardNumber': cardNumber,
      'cardHolderName': cardHolderName,
      'expiryMonth': expiryMonth,
      'expiryYear': expiryYear,
      'isDefault': isDefault,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  PaymentMethod toEntity() {
    return PaymentMethod(
      id: id,
      title: title,
      type: _intToPaymentTypeEnum(paymentType),
      phoneNumber: phoneNumber,
      cardNumber: cardNumber,
      cardHolderName: cardHolderName,
      expiryMonth: expiryMonth,
      expiryYear: expiryYear,
      isDefault: isDefault,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory PaymentMethodModel.fromEntity(PaymentMethod paymentMethod) {
    return PaymentMethodModel(
      id: paymentMethod.id,
      title: paymentMethod.title,
      paymentType: _paymentTypeEnumToInt(paymentMethod.type),
      phoneNumber: paymentMethod.phoneNumber,
      cardNumber: paymentMethod.cardNumber,
      cardHolderName: paymentMethod.cardHolderName,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      isDefault: paymentMethod.isDefault,
      createdAt: paymentMethod.createdAt,
      updatedAt: paymentMethod.updatedAt,
    );
  }

  static int _paymentTypeToInt(String? type) {
    switch (type) {
      case 'MTN_MONEY':
        return 0;
      case 'ORANGE_MONEY':
        return 1;
      case 'CASH_ON_DELIVERY':
        return 2;
      case 'CARD':
        return 3;
      default:
        return 2;
    }
  }

  static String _intToPaymentType(int type) {
    switch (type) {
      case 0:
        return 'MTN_MONEY';
      case 1:
        return 'ORANGE_MONEY';
      case 2:
        return 'CASH_ON_DELIVERY';
      case 3:
        return 'CARD';
      default:
        return 'CASH_ON_DELIVERY';
    }
  }

  static PaymentMethodType _intToPaymentTypeEnum(int type) {
    switch (type) {
      case 0:
        return PaymentMethodType.mtnMoney;
      case 1:
        return PaymentMethodType.orangeMoney;
      case 2:
        return PaymentMethodType.cashOnDelivery;
      case 3:
        return PaymentMethodType.card;
      default:
        return PaymentMethodType.cashOnDelivery;
    }
  }

  static int _paymentTypeEnumToInt(PaymentMethodType type) {
    switch (type) {
      case PaymentMethodType.mtnMoney:
        return 0;
      case PaymentMethodType.orangeMoney:
        return 1;
      case PaymentMethodType.cashOnDelivery:
        return 2;
      case PaymentMethodType.card:
        return 3;
    }
  }
}