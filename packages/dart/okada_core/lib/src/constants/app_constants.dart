/// Application-wide constants for Okada Platform
class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Okada';
  static const String appVersion = '1.0.0';
  static const String appBuildNumber = '1';
  static const String appPackageName = 'cm.okada.customer';
  static const String riderAppPackageName = 'cm.okada.rider';

  // Supported Locales
  static const String defaultLocale = 'fr';
  static const List<String> supportedLocales = ['fr', 'en'];

  // Currency
  static const String currencyCode = 'XAF';
  static const String currencySymbol = 'FCFA';
  static const int currencyDecimals = 0;

  // Phone Number
  static const String defaultCountryCode = '+237';
  static const int phoneNumberLength = 9;
  static const List<String> validPhonePrefixes = ['6', '2'];

  // OTP
  static const int otpLength = 6;
  static const int otpExpirySeconds = 300; // 5 minutes
  static const int otpResendDelaySeconds = 60;

  // Location
  static const double defaultLatitude = 4.0511; // Douala
  static const double defaultLongitude = 9.7679;
  static const double defaultZoom = 14.0;
  static const double maxDeliveryRadiusKm = 20.0;

  // Order
  static const int minOrderAmount = 500; // FCFA
  static const int maxOrderAmount = 500000; // FCFA
  static const int defaultDeliveryFee = 500; // FCFA
  static const int freeDeliveryThreshold = 10000; // FCFA
  static const int maxOrderItems = 50;

  // Cart
  static const int cartExpiryHours = 24;
  static const int maxCartItems = 50;
  static const int maxItemQuantity = 99;

  // Rider
  static const int minRiderAge = 18;
  static const int maxActiveOrders = 3;
  static const double minAcceptanceRate = 0.7; // 70%
  static const double minRating = 4.0;

  // Images
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp'];
  static const int thumbnailSize = 200;
  static const int mediumImageSize = 600;
  static const int largeImageSize = 1200;

  // Cache
  static const int cacheExpiryMinutes = 30;
  static const int maxCacheItems = 100;

  // Animation
  static const Duration shortAnimationDuration = Duration(milliseconds: 200);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 350);
  static const Duration longAnimationDuration = Duration(milliseconds: 500);

  // Debounce
  static const Duration searchDebounce = Duration(milliseconds: 500);
  static const Duration locationUpdateDebounce = Duration(seconds: 5);

  // Support
  static const String supportEmail = 'support@okada.cm';
  static const String supportPhone = '+237 6XX XXX XXX';
  static const String websiteUrl = 'https://okada.cm';
  static const String privacyPolicyUrl = 'https://okada.cm/privacy';
  static const String termsOfServiceUrl = 'https://okada.cm/terms';

  // Social
  static const String facebookUrl = 'https://facebook.com/okadacm';
  static const String instagramUrl = 'https://instagram.com/okadacm';
  static const String twitterUrl = 'https://twitter.com/okadacm';

  // Feature Flags
  static const bool enableDarkMode = true;
  static const bool enableBiometricAuth = true;
  static const bool enablePushNotifications = true;
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
}

/// Order status enum
enum OrderStatus {
  pending,
  confirmed,
  preparing,
  readyForPickup,
  pickedUp,
  inTransit,
  delivered,
  cancelled,
  failed;

  String get displayName {
    switch (this) {
      case OrderStatus.pending:
        return 'En attente';
      case OrderStatus.confirmed:
        return 'Confirmée';
      case OrderStatus.preparing:
        return 'En préparation';
      case OrderStatus.readyForPickup:
        return 'Prête';
      case OrderStatus.pickedUp:
        return 'Récupérée';
      case OrderStatus.inTransit:
        return 'En livraison';
      case OrderStatus.delivered:
        return 'Livrée';
      case OrderStatus.cancelled:
        return 'Annulée';
      case OrderStatus.failed:
        return 'Échouée';
    }
  }

  bool get isActive => [
        OrderStatus.pending,
        OrderStatus.confirmed,
        OrderStatus.preparing,
        OrderStatus.readyForPickup,
        OrderStatus.pickedUp,
        OrderStatus.inTransit,
      ].contains(this);

  bool get isCompleted => [
        OrderStatus.delivered,
        OrderStatus.cancelled,
        OrderStatus.failed,
      ].contains(this);
}

/// Payment method enum
enum PaymentMethod {
  mtnMomo,
  orangeMoney,
  cash,
  card,
  wallet;

  String get displayName {
    switch (this) {
      case PaymentMethod.mtnMomo:
        return 'MTN Mobile Money';
      case PaymentMethod.orangeMoney:
        return 'Orange Money';
      case PaymentMethod.cash:
        return 'Espèces';
      case PaymentMethod.card:
        return 'Carte bancaire';
      case PaymentMethod.wallet:
        return 'Portefeuille Okada';
    }
  }

  String get iconAsset {
    switch (this) {
      case PaymentMethod.mtnMomo:
        return 'assets/icons/mtn_momo.svg';
      case PaymentMethod.orangeMoney:
        return 'assets/icons/orange_money.svg';
      case PaymentMethod.cash:
        return 'assets/icons/cash.svg';
      case PaymentMethod.card:
        return 'assets/icons/card.svg';
      case PaymentMethod.wallet:
        return 'assets/icons/wallet.svg';
    }
  }
}

/// Vehicle type enum
enum VehicleType {
  motorcycle,
  bicycle,
  car;

  String get displayName {
    switch (this) {
      case VehicleType.motorcycle:
        return 'Moto';
      case VehicleType.bicycle:
        return 'Vélo';
      case VehicleType.car:
        return 'Voiture';
    }
  }
}
