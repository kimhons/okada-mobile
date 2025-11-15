/// Okada Platform - Cameroon-Specific Constants
/// Localization constants for Cameroon market
/// Version: 1.0.0

class CameroonConstants {
  CameroonConstants._(); // Private constructor

  // ============================================================================
  // CURRENCY
  // ============================================================================

  /// Currency code (use FCFA, not XAF!)
  static const String currencyCode = 'FCFA';

  /// Currency symbol
  static const String currencySymbol = 'FCFA';

  /// Currency format (e.g., "1,500 FCFA")
  static String formatCurrency(double amount) {
    final formatted = amount.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
    return '$formatted $currencySymbol';
  }

  /// Parse currency string to double
  static double parseCurrency(String value) {
    final cleaned = value.replaceAll(RegExp(r'[^\d.]'), '');
    return double.tryParse(cleaned) ?? 0.0;
  }

  // ============================================================================
  // PHONE NUMBERS
  // ============================================================================

  /// Country code
  static const String countryCode = '+237';

  /// Phone number format (e.g., "+237 6 XX XX XX XX")
  static String formatPhoneNumber(String phone) {
    // Remove all non-digits
    final digits = phone.replaceAll(RegExp(r'\D'), '');

    // Handle different input formats
    String cleaned = digits;
    if (cleaned.startsWith('237')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('00237')) {
      cleaned = cleaned.substring(5);
    }

    // Format: +237 6 XX XX XX XX
    if (cleaned.length == 9) {
      return '$countryCode ${cleaned[0]} ${cleaned.substring(1, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7)}';
    }

    return phone; // Return original if format doesn't match
  }

  /// Validate Cameroon phone number
  static bool isValidPhoneNumber(String phone) {
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    // Cameroon mobile numbers start with 6 and are 9 digits long
    return RegExp(r'^(237)?6\d{8}$').hasMatch(digits);
  }

  // ============================================================================
  // TAX
  // ============================================================================

  /// VAT rate in Cameroon (19.25%)
  static const double vatRate = 0.1925;

  /// Calculate VAT amount
  static double calculateVAT(double amount) {
    return amount * vatRate;
  }

  /// Calculate total with VAT
  static double calculateTotalWithVAT(double amount) {
    return amount * (1 + vatRate);
  }

  /// Calculate amount before VAT
  static double calculateAmountBeforeVAT(double totalWithVAT) {
    return totalWithVAT / (1 + vatRate);
  }

  // ============================================================================
  // LOCATIONS
  // ============================================================================

  /// Major cities in Cameroon
  static const List<String> majorCities = [
    'Douala',
    'Yaoundé',
    'Bamenda',
    'Garoua',
    'Bafoussam',
    'Maroua',
    'Ngaoundéré',
    'Bertoua',
    'Loum',
    'Kumba',
  ];

  /// Default city (Douala - economic capital)
  static const String defaultCity = 'Douala';

  /// Default coordinates (Douala)
  static const double defaultLatitude = 4.0511;
  static const double defaultLongitude = 9.7679;

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /// MTN Mobile Money
  static const String mtnMobileMoney = 'MTN Mobile Money';
  static const String mtnShortCode = '*126#';

  /// Orange Money
  static const String orangeMoney = 'Orange Money';
  static const String orangeShortCode = '#150#';

  /// Payment method list
  static const List<String> paymentMethods = [
    mtnMobileMoney,
    orangeMoney,
    'Cash on Delivery',
  ];

  // ============================================================================
  // LANGUAGES
  // ============================================================================

  /// Official languages
  static const String languageEnglish = 'English';
  static const String languageFrench = 'Français';

  /// Language codes
  static const String languageCodeEnglish = 'en';
  static const String languageCodeFrench = 'fr';

  /// Available languages
  static const Map<String, String> availableLanguages = {
    languageCodeEnglish: languageEnglish,
    languageCodeFrench: languageFrench,
  };

  // ============================================================================
  // BUSINESS HOURS
  // ============================================================================

  /// Default business hours
  static const String businessHoursWeekdays = '8:00 AM - 8:00 PM';
  static const String businessHoursWeekends = '9:00 AM - 6:00 PM';

  /// Support hours
  static const String supportHours = 'Monday - Sunday: 6:00 AM - 10:00 PM';

  // ============================================================================
  // CONTACT INFORMATION
  // ============================================================================

  /// Support phone number
  static const String supportPhone = '+237 650 123 456';

  /// Support email
  static const String supportEmail = 'support@okada.cm';

  /// WhatsApp support
  static const String whatsappSupport = '+237 650 123 456';

  // ============================================================================
  // DELIVERY
  // ============================================================================

  /// Delivery zones with fees (in FCFA)
  static const Map<String, int> deliveryFees = {
    'Douala Central': 1500,
    'Douala Port': 2000,
    'Yaoundé Downtown': 1500,
    'Yaoundé East': 2000,
    'Bamenda': 2500,
  };

  /// Average delivery time (in minutes)
  static const int averageDeliveryTime = 28;

  /// Delivery time range
  static const String deliveryTimeRange = '20-35 minutes';

  // ============================================================================
  // PLATFORM COMMISSION
  // ============================================================================

  /// Platform commission rate (10%)
  static const double platformCommissionRate = 0.10;

  /// Rider earnings percentage (80% of delivery fee)
  static const double riderEarningsRate = 0.80;

  /// Calculate platform commission
  static double calculateCommission(double amount) {
    return amount * platformCommissionRate;
  }

  /// Calculate rider earnings from delivery fee
  static double calculateRiderEarnings(double deliveryFee) {
    return deliveryFee * riderEarningsRate;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /// Get city by name
  static String? getCityByName(String name) {
    return majorCities.firstWhere(
      (city) => city.toLowerCase() == name.toLowerCase(),
      orElse: () => defaultCity,
    );
  }

  /// Check if city is supported
  static bool isCitySupported(String city) {
    return majorCities.any(
      (c) => c.toLowerCase() == city.toLowerCase(),
    );
  }

  /// Get delivery fee for zone
  static int getDeliveryFee(String zone) {
    return deliveryFees[zone] ?? 1500; // Default to 1500 FCFA
  }
}

