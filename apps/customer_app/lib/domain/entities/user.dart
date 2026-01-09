import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String phoneNumber;
  final String? profileImageUrl;
  final bool isEmailVerified;
  final bool isPhoneVerified;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final UserPreferences preferences;
  final List<Address> addresses;
  final List<PaymentMethod> paymentMethods;

  const User({
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

  String get fullName => '$firstName $lastName';

  String get displayName => fullName;

  Address? get defaultAddress =>
    addresses.where((address) => address.isDefault).firstOrNull;

  PaymentMethod? get defaultPaymentMethod =>
    paymentMethods.where((method) => method.isDefault).firstOrNull;

  User copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? phoneNumber,
    String? profileImageUrl,
    bool? isEmailVerified,
    bool? isPhoneVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
    UserPreferences? preferences,
    List<Address>? addresses,
    List<PaymentMethod>? paymentMethods,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      preferences: preferences ?? this.preferences,
      addresses: addresses ?? this.addresses,
      paymentMethods: paymentMethods ?? this.paymentMethods,
    );
  }

  @override
  List<Object?> get props => [
        id,
        email,
        firstName,
        lastName,
        phoneNumber,
        profileImageUrl,
        isEmailVerified,
        isPhoneVerified,
        createdAt,
        updatedAt,
        preferences,
        addresses,
        paymentMethods,
      ];
}

class UserPreferences extends Equatable {
  final String language; // 'en' or 'fr'
  final String currency; // 'XAF'
  final bool notificationsEnabled;
  final bool locationEnabled;
  final bool biometricsEnabled;
  final String theme; // 'light', 'dark', 'system'

  const UserPreferences({
    this.language = 'en',
    this.currency = 'XAF',
    this.notificationsEnabled = true,
    this.locationEnabled = true,
    this.biometricsEnabled = false,
    this.theme = 'system',
  });

  UserPreferences copyWith({
    String? language,
    String? currency,
    bool? notificationsEnabled,
    bool? locationEnabled,
    bool? biometricsEnabled,
    String? theme,
  }) {
    return UserPreferences(
      language: language ?? this.language,
      currency: currency ?? this.currency,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      locationEnabled: locationEnabled ?? this.locationEnabled,
      biometricsEnabled: biometricsEnabled ?? this.biometricsEnabled,
      theme: theme ?? this.theme,
    );
  }

  @override
  List<Object?> get props => [
        language,
        currency,
        notificationsEnabled,
        locationEnabled,
        biometricsEnabled,
        theme,
      ];
}

class Address extends Equatable {
  final String id;
  final String title;
  final String streetAddress;
  final String? landmark;
  final String city;
  final String region;
  final String? postalCode;
  final double latitude;
  final double longitude;
  final bool isDefault;
  final AddressType type;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Address({
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
    this.type = AddressType.other,
    required this.createdAt,
    this.updatedAt,
  });

  String get fullAddress {
    final parts = <String>[
      streetAddress,
      if (landmark != null) landmark!,
      city,
      region,
      if (postalCode != null) postalCode!,
    ];
    return parts.join(', ');
  }

  Address copyWith({
    String? id,
    String? title,
    String? streetAddress,
    String? landmark,
    String? city,
    String? region,
    String? postalCode,
    double? latitude,
    double? longitude,
    bool? isDefault,
    AddressType? type,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Address(
      id: id ?? this.id,
      title: title ?? this.title,
      streetAddress: streetAddress ?? this.streetAddress,
      landmark: landmark ?? this.landmark,
      city: city ?? this.city,
      region: region ?? this.region,
      postalCode: postalCode ?? this.postalCode,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isDefault: isDefault ?? this.isDefault,
      type: type ?? this.type,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        title,
        streetAddress,
        landmark,
        city,
        region,
        postalCode,
        latitude,
        longitude,
        isDefault,
        type,
        createdAt,
        updatedAt,
      ];
}

enum AddressType {
  home,
  work,
  other,
}

class PaymentMethod extends Equatable {
  final String id;
  final String title;
  final PaymentMethodType type;
  final String? phoneNumber; // For mobile money
  final String? cardNumber; // Masked for security
  final String? cardHolderName;
  final String? expiryMonth;
  final String? expiryYear;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const PaymentMethod({
    required this.id,
    required this.title,
    required this.type,
    this.phoneNumber,
    this.cardNumber,
    this.cardHolderName,
    this.expiryMonth,
    this.expiryYear,
    this.isDefault = false,
    required this.createdAt,
    this.updatedAt,
  });

  String get displayText {
    switch (type) {
      case PaymentMethodType.mtnMoney:
        return 'MTN Money ${phoneNumber?.replaceRange(3, 7, '****') ?? ''}';
      case PaymentMethodType.orangeMoney:
        return 'Orange Money ${phoneNumber?.replaceRange(3, 7, '****') ?? ''}';
      case PaymentMethodType.cashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethodType.card:
        return 'Card ****${cardNumber?.substring(cardNumber!.length - 4) ?? ''}';
    }
  }

  PaymentMethod copyWith({
    String? id,
    String? title,
    PaymentMethodType? type,
    String? phoneNumber,
    String? cardNumber,
    String? cardHolderName,
    String? expiryMonth,
    String? expiryYear,
    bool? isDefault,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PaymentMethod(
      id: id ?? this.id,
      title: title ?? this.title,
      type: type ?? this.type,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      cardNumber: cardNumber ?? this.cardNumber,
      cardHolderName: cardHolderName ?? this.cardHolderName,
      expiryMonth: expiryMonth ?? this.expiryMonth,
      expiryYear: expiryYear ?? this.expiryYear,
      isDefault: isDefault ?? this.isDefault,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        title,
        type,
        phoneNumber,
        cardNumber,
        cardHolderName,
        expiryMonth,
        expiryYear,
        isDefault,
        createdAt,
        updatedAt,
      ];
}

enum PaymentMethodType {
  mtnMoney,
  orangeMoney,
  cashOnDelivery,
  card,
}

extension ListExtension<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
}