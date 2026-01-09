import 'package:flutter/material.dart';

/// Supported African countries for Okada Platform expansion
enum AfricanCountry {
  /// Cameroon - Launch market
  cameroon,
  
  /// Nigeria - Largest African economy
  nigeria,
  
  /// Ghana - West African hub
  ghana,
  
  /// Kenya - East African hub
  kenya,
  
  /// South Africa - Southern African hub
  southAfrica,
  
  /// Senegal - Francophone West Africa
  senegal,
  
  /// Côte d'Ivoire - Francophone West Africa
  coteDivoire,
  
  /// Tanzania - East African market
  tanzania,
  
  /// Rwanda - Tech-forward market
  rwanda,
  
  /// Ethiopia - Large population market
  ethiopia,
}

/// Country-specific configuration for theming and localization
class CountryConfig {
  /// Country identifier
  final AfricanCountry country;
  
  /// Country name in English
  final String nameEn;
  
  /// Country name in French
  final String nameFr;
  
  /// Country name in local language
  final String nameLocal;
  
  /// ISO 3166-1 alpha-2 country code
  final String countryCode;
  
  /// International dialing code
  final String dialingCode;
  
  /// Currency code (ISO 4217)
  final String currencyCode;
  
  /// Currency symbol
  final String currencySymbol;
  
  /// Currency name
  final String currencyName;
  
  /// Flag emoji
  final String flagEmoji;
  
  /// Primary languages (ISO 639-1)
  final List<String> languages;
  
  /// National flag colors (from top to bottom or left to right)
  final List<Color> flagColors;
  
  /// Primary accent color derived from flag
  final Color primaryAccent;
  
  /// Secondary accent color derived from flag
  final Color secondaryAccent;
  
  /// Traditional/cultural pattern name
  final String culturalPatternName;
  
  /// Mobile money providers available
  final List<String> mobileMoneyProviders;
  
  /// Default timezone
  final String timezone;

  const CountryConfig({
    required this.country,
    required this.nameEn,
    required this.nameFr,
    required this.nameLocal,
    required this.countryCode,
    required this.dialingCode,
    required this.currencyCode,
    required this.currencySymbol,
    required this.currencyName,
    required this.flagEmoji,
    required this.languages,
    required this.flagColors,
    required this.primaryAccent,
    required this.secondaryAccent,
    required this.culturalPatternName,
    required this.mobileMoneyProviders,
    required this.timezone,
  });
}

/// Registry of all supported African countries
class AfricanCountryRegistry {
  AfricanCountryRegistry._();

  static const Map<AfricanCountry, CountryConfig> _configs = {
    // ============================================
    // CAMEROON - Launch Market
    // ============================================
    AfricanCountry.cameroon: CountryConfig(
      country: AfricanCountry.cameroon,
      nameEn: 'Cameroon',
      nameFr: 'Cameroun',
      nameLocal: 'Cameroun',
      countryCode: 'CM',
      dialingCode: '+237',
      currencyCode: 'XAF',
      currencySymbol: 'FCFA',
      currencyName: 'Central African CFA Franc',
      flagEmoji: '🇨🇲',
      languages: ['fr', 'en'],
      flagColors: [
        Color(0xFF007A5E), // Green
        Color(0xFFCE1126), // Red
        Color(0xFFFCD116), // Yellow
      ],
      primaryAccent: Color(0xFF007A5E), // Cameroon Green
      secondaryAccent: Color(0xFFCE1126), // Cameroon Red
      culturalPatternName: 'Toghu', // Traditional Cameroonian embroidery
      mobileMoneyProviders: ['MTN MoMo', 'Orange Money'],
      timezone: 'Africa/Douala',
    ),

    // ============================================
    // NIGERIA
    // ============================================
    AfricanCountry.nigeria: CountryConfig(
      country: AfricanCountry.nigeria,
      nameEn: 'Nigeria',
      nameFr: 'Nigéria',
      nameLocal: 'Nigeria',
      countryCode: 'NG',
      dialingCode: '+234',
      currencyCode: 'NGN',
      currencySymbol: '₦',
      currencyName: 'Nigerian Naira',
      flagEmoji: '🇳🇬',
      languages: ['en', 'ha', 'yo', 'ig'],
      flagColors: [
        Color(0xFF008751), // Green
        Color(0xFFFFFFFF), // White
        Color(0xFF008751), // Green
      ],
      primaryAccent: Color(0xFF008751), // Nigeria Green
      secondaryAccent: Color(0xFF1D5C2E), // Darker Green
      culturalPatternName: 'Adire', // Yoruba indigo-dyed cloth
      mobileMoneyProviders: ['OPay', 'PalmPay', 'Paga'],
      timezone: 'Africa/Lagos',
    ),

    // ============================================
    // GHANA
    // ============================================
    AfricanCountry.ghana: CountryConfig(
      country: AfricanCountry.ghana,
      nameEn: 'Ghana',
      nameFr: 'Ghana',
      nameLocal: 'Ghana',
      countryCode: 'GH',
      dialingCode: '+233',
      currencyCode: 'GHS',
      currencySymbol: 'GH₵',
      currencyName: 'Ghanaian Cedi',
      flagEmoji: '🇬🇭',
      languages: ['en', 'ak', 'ee'],
      flagColors: [
        Color(0xFFCE1126), // Red
        Color(0xFFFCD116), // Gold
        Color(0xFF006B3F), // Green
      ],
      primaryAccent: Color(0xFFFCD116), // Ghana Gold
      secondaryAccent: Color(0xFF006B3F), // Ghana Green
      culturalPatternName: 'Kente', // Traditional Ghanaian woven cloth
      mobileMoneyProviders: ['MTN MoMo', 'Vodafone Cash', 'AirtelTigo Money'],
      timezone: 'Africa/Accra',
    ),

    // ============================================
    // KENYA
    // ============================================
    AfricanCountry.kenya: CountryConfig(
      country: AfricanCountry.kenya,
      nameEn: 'Kenya',
      nameFr: 'Kenya',
      nameLocal: 'Kenya',
      countryCode: 'KE',
      dialingCode: '+254',
      currencyCode: 'KES',
      currencySymbol: 'KSh',
      currencyName: 'Kenyan Shilling',
      flagEmoji: '🇰🇪',
      languages: ['en', 'sw'],
      flagColors: [
        Color(0xFF000000), // Black
        Color(0xFFBB0000), // Red
        Color(0xFF006600), // Green
      ],
      primaryAccent: Color(0xFFBB0000), // Kenya Red
      secondaryAccent: Color(0xFF006600), // Kenya Green
      culturalPatternName: 'Kikoy', // Traditional Kenyan woven fabric
      mobileMoneyProviders: ['M-Pesa', 'Airtel Money', 'T-Kash'],
      timezone: 'Africa/Nairobi',
    ),

    // ============================================
    // SOUTH AFRICA
    // ============================================
    AfricanCountry.southAfrica: CountryConfig(
      country: AfricanCountry.southAfrica,
      nameEn: 'South Africa',
      nameFr: 'Afrique du Sud',
      nameLocal: 'South Africa',
      countryCode: 'ZA',
      dialingCode: '+27',
      currencyCode: 'ZAR',
      currencySymbol: 'R',
      currencyName: 'South African Rand',
      flagEmoji: '🇿🇦',
      languages: ['en', 'af', 'zu', 'xh'],
      flagColors: [
        Color(0xFF007A4D), // Green
        Color(0xFFFFB612), // Gold
        Color(0xFF000000), // Black
        Color(0xFFDE3831), // Red
        Color(0xFF002395), // Blue
      ],
      primaryAccent: Color(0xFF007A4D), // SA Green
      secondaryAccent: Color(0xFFFFB612), // SA Gold
      culturalPatternName: 'Ndebele', // Ndebele geometric patterns
      mobileMoneyProviders: ['SnapScan', 'Zapper', 'M-Pesa'],
      timezone: 'Africa/Johannesburg',
    ),

    // ============================================
    // SENEGAL
    // ============================================
    AfricanCountry.senegal: CountryConfig(
      country: AfricanCountry.senegal,
      nameEn: 'Senegal',
      nameFr: 'Sénégal',
      nameLocal: 'Sénégal',
      countryCode: 'SN',
      dialingCode: '+221',
      currencyCode: 'XOF',
      currencySymbol: 'CFA',
      currencyName: 'West African CFA Franc',
      flagEmoji: '🇸🇳',
      languages: ['fr', 'wo'],
      flagColors: [
        Color(0xFF00853F), // Green
        Color(0xFFFDEF42), // Yellow
        Color(0xFFE31B23), // Red
      ],
      primaryAccent: Color(0xFF00853F), // Senegal Green
      secondaryAccent: Color(0xFFE31B23), // Senegal Red
      culturalPatternName: 'Thioup', // Traditional Senegalese fabric
      mobileMoneyProviders: ['Orange Money', 'Wave', 'Free Money'],
      timezone: 'Africa/Dakar',
    ),

    // ============================================
    // CÔTE D'IVOIRE
    // ============================================
    AfricanCountry.coteDivoire: CountryConfig(
      country: AfricanCountry.coteDivoire,
      nameEn: "Côte d'Ivoire",
      nameFr: "Côte d'Ivoire",
      nameLocal: "Côte d'Ivoire",
      countryCode: 'CI',
      dialingCode: '+225',
      currencyCode: 'XOF',
      currencySymbol: 'CFA',
      currencyName: 'West African CFA Franc',
      flagEmoji: '🇨🇮',
      languages: ['fr'],
      flagColors: [
        Color(0xFFF77F00), // Orange
        Color(0xFFFFFFFF), // White
        Color(0xFF009E60), // Green
      ],
      primaryAccent: Color(0xFFF77F00), // Ivory Coast Orange
      secondaryAccent: Color(0xFF009E60), // Ivory Coast Green
      culturalPatternName: 'Korhogo', // Traditional cloth from Korhogo
      mobileMoneyProviders: ['Orange Money', 'MTN MoMo', 'Wave'],
      timezone: 'Africa/Abidjan',
    ),

    // ============================================
    // TANZANIA
    // ============================================
    AfricanCountry.tanzania: CountryConfig(
      country: AfricanCountry.tanzania,
      nameEn: 'Tanzania',
      nameFr: 'Tanzanie',
      nameLocal: 'Tanzania',
      countryCode: 'TZ',
      dialingCode: '+255',
      currencyCode: 'TZS',
      currencySymbol: 'TSh',
      currencyName: 'Tanzanian Shilling',
      flagEmoji: '🇹🇿',
      languages: ['sw', 'en'],
      flagColors: [
        Color(0xFF1EB53A), // Green
        Color(0xFFFCD116), // Yellow
        Color(0xFF00A3DD), // Blue
        Color(0xFF000000), // Black
      ],
      primaryAccent: Color(0xFF1EB53A), // Tanzania Green
      secondaryAccent: Color(0xFF00A3DD), // Tanzania Blue
      culturalPatternName: 'Kanga', // Traditional East African cloth
      mobileMoneyProviders: ['M-Pesa', 'Tigo Pesa', 'Airtel Money'],
      timezone: 'Africa/Dar_es_Salaam',
    ),

    // ============================================
    // RWANDA
    // ============================================
    AfricanCountry.rwanda: CountryConfig(
      country: AfricanCountry.rwanda,
      nameEn: 'Rwanda',
      nameFr: 'Rwanda',
      nameLocal: 'Rwanda',
      countryCode: 'RW',
      dialingCode: '+250',
      currencyCode: 'RWF',
      currencySymbol: 'FRw',
      currencyName: 'Rwandan Franc',
      flagEmoji: '🇷🇼',
      languages: ['rw', 'en', 'fr'],
      flagColors: [
        Color(0xFF00A1DE), // Blue
        Color(0xFFFAD201), // Yellow
        Color(0xFF20603D), // Green
      ],
      primaryAccent: Color(0xFF00A1DE), // Rwanda Blue
      secondaryAccent: Color(0xFF20603D), // Rwanda Green
      culturalPatternName: 'Imigongo', // Traditional cow dung art patterns
      mobileMoneyProviders: ['MTN MoMo', 'Airtel Money'],
      timezone: 'Africa/Kigali',
    ),

    // ============================================
    // ETHIOPIA
    // ============================================
    AfricanCountry.ethiopia: CountryConfig(
      country: AfricanCountry.ethiopia,
      nameEn: 'Ethiopia',
      nameFr: 'Éthiopie',
      nameLocal: 'ኢትዮጵያ',
      countryCode: 'ET',
      dialingCode: '+251',
      currencyCode: 'ETB',
      currencySymbol: 'Br',
      currencyName: 'Ethiopian Birr',
      flagEmoji: '🇪🇹',
      languages: ['am', 'en', 'om'],
      flagColors: [
        Color(0xFF078930), // Green
        Color(0xFFFCAD00), // Yellow
        Color(0xFFDA121A), // Red
      ],
      primaryAccent: Color(0xFF078930), // Ethiopia Green
      secondaryAccent: Color(0xFFDA121A), // Ethiopia Red
      culturalPatternName: 'Tibeb', // Traditional Ethiopian embroidery
      mobileMoneyProviders: ['Telebirr', 'CBE Birr', 'M-Birr'],
      timezone: 'Africa/Addis_Ababa',
    ),
  };

  /// Get configuration for a specific country
  static CountryConfig getConfig(AfricanCountry country) {
    return _configs[country]!;
  }

  /// Get all supported countries
  static List<AfricanCountry> get supportedCountries => _configs.keys.toList();

  /// Get country by country code
  static CountryConfig? getByCountryCode(String code) {
    try {
      return _configs.values.firstWhere(
        (config) => config.countryCode.toLowerCase() == code.toLowerCase(),
      );
    } catch (_) {
      return null;
    }
  }

  /// Get country by dialing code
  static CountryConfig? getByDialingCode(String dialingCode) {
    final normalized = dialingCode.startsWith('+') ? dialingCode : '+$dialingCode';
    try {
      return _configs.values.firstWhere(
        (config) => config.dialingCode == normalized,
      );
    } catch (_) {
      return null;
    }
  }

  /// Check if a country is supported
  static bool isSupported(AfricanCountry country) {
    return _configs.containsKey(country);
  }

  /// Get default country (Cameroon for launch)
  static CountryConfig get defaultCountry => _configs[AfricanCountry.cameroon]!;
}
