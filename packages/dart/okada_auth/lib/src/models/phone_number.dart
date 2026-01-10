/// Phone number model with validation and formatting for African countries
class PhoneNumber {
  /// Raw phone number input
  final String rawNumber;
  
  /// Country code (e.g., 'CM' for Cameroon)
  final String countryCode;
  
  /// International dialing code (e.g., '+237')
  final String dialingCode;
  
  const PhoneNumber({
    required this.rawNumber,
    required this.countryCode,
    required this.dialingCode,
  });
  
  /// Create from full international format
  factory PhoneNumber.fromE164(String e164Number) {
    // Parse E.164 format (+237612345678)
    for (final country in _africanCountries) {
      if (e164Number.startsWith(country.dialingCode)) {
        final nationalNumber = e164Number.substring(country.dialingCode.length);
        return PhoneNumber(
          rawNumber: nationalNumber,
          countryCode: country.code,
          dialingCode: country.dialingCode,
        );
      }
    }
    
    // Default to Cameroon if not matched
    return PhoneNumber(
      rawNumber: e164Number.replaceAll(RegExp(r'[^\d]'), ''),
      countryCode: 'CM',
      dialingCode: '+237',
    );
  }
  
  /// Create for Cameroon (default market)
  factory PhoneNumber.cameroon(String number) {
    return PhoneNumber(
      rawNumber: _normalizeNumber(number),
      countryCode: 'CM',
      dialingCode: '+237',
    );
  }
  
  /// Create for Nigeria
  factory PhoneNumber.nigeria(String number) {
    return PhoneNumber(
      rawNumber: _normalizeNumber(number),
      countryCode: 'NG',
      dialingCode: '+234',
    );
  }
  
  /// Create for Ghana
  factory PhoneNumber.ghana(String number) {
    return PhoneNumber(
      rawNumber: _normalizeNumber(number),
      countryCode: 'GH',
      dialingCode: '+233',
    );
  }
  
  /// Create for Kenya
  factory PhoneNumber.kenya(String number) {
    return PhoneNumber(
      rawNumber: _normalizeNumber(number),
      countryCode: 'KE',
      dialingCode: '+254',
    );
  }
  
  /// Normalized national number (digits only)
  String get nationalNumber {
    var number = _normalizeNumber(rawNumber);
    
    // Remove leading zero if present
    if (number.startsWith('0')) {
      number = number.substring(1);
    }
    
    // Remove country code if included
    if (number.startsWith(dialingCode.substring(1))) {
      number = number.substring(dialingCode.length - 1);
    }
    
    return number;
  }
  
  /// E.164 international format (+237612345678)
  String get e164Format => '$dialingCode$nationalNumber';
  
  /// Display format with spaces (+237 6 12 34 56 78)
  String get displayFormat {
    final national = nationalNumber;
    final formatted = _formatForCountry(national, countryCode);
    return '$dialingCode $formatted';
  }
  
  /// Masked format for privacy (+237 6** *** **78)
  String get masked {
    final national = nationalNumber;
    if (national.length < 4) return '$dialingCode $national';
    
    final first = national.substring(0, 1);
    final last = national.substring(national.length - 2);
    final middle = '*' * (national.length - 3);
    
    return '$dialingCode $first$middle$last';
  }
  
  /// Whether the phone number is valid
  bool get isValid {
    final national = nationalNumber;
    
    // Check length based on country
    final expectedLength = _getExpectedLength(countryCode);
    if (national.length != expectedLength) {
      return false;
    }
    
    // Check prefix for known carriers
    if (!_hasValidPrefix(national, countryCode)) {
      return false;
    }
    
    return true;
  }
  
  /// Get carrier name if identifiable
  String? get carrier {
    final national = nationalNumber;
    if (national.isEmpty) return null;
    
    return _identifyCarrier(national, countryCode);
  }
  
  /// Whether this is a mobile number
  bool get isMobile {
    final national = nationalNumber;
    return _isMobileNumber(national, countryCode);
  }
  
  @override
  String toString() => e164Format;
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PhoneNumber && other.e164Format == e164Format;
  }
  
  @override
  int get hashCode => e164Format.hashCode;
  
  // ============ Private Helpers ============
  
  static String _normalizeNumber(String number) {
    return number.replaceAll(RegExp(r'[^\d]'), '');
  }
  
  static String _formatForCountry(String national, String countryCode) {
    switch (countryCode) {
      case 'CM': // Cameroon: 6 XX XX XX XX
        if (national.length == 9) {
          return '${national.substring(0, 1)} ${national.substring(1, 3)} ${national.substring(3, 5)} ${national.substring(5, 7)} ${national.substring(7)}';
        }
        break;
      case 'NG': // Nigeria: XXX XXX XXXX
        if (national.length == 10) {
          return '${national.substring(0, 3)} ${national.substring(3, 6)} ${national.substring(6)}';
        }
        break;
      case 'GH': // Ghana: XX XXX XXXX
        if (national.length == 9) {
          return '${national.substring(0, 2)} ${national.substring(2, 5)} ${national.substring(5)}';
        }
        break;
      case 'KE': // Kenya: XXX XXX XXX
        if (national.length == 9) {
          return '${national.substring(0, 3)} ${national.substring(3, 6)} ${national.substring(6)}';
        }
        break;
    }
    return national;
  }
  
  static int _getExpectedLength(String countryCode) {
    switch (countryCode) {
      case 'CM': return 9;  // Cameroon
      case 'NG': return 10; // Nigeria
      case 'GH': return 9;  // Ghana
      case 'KE': return 9;  // Kenya
      case 'SN': return 9;  // Senegal
      case 'CI': return 10; // Côte d'Ivoire
      case 'TZ': return 9;  // Tanzania
      case 'RW': return 9;  // Rwanda
      case 'ET': return 9;  // Ethiopia
      case 'ZA': return 9;  // South Africa
      default: return 9;
    }
  }
  
  static bool _hasValidPrefix(String national, String countryCode) {
    if (national.isEmpty) return false;
    
    switch (countryCode) {
      case 'CM': // Cameroon mobile prefixes
        return national.startsWith('6') || national.startsWith('2');
      case 'NG': // Nigeria mobile prefixes
        return national.startsWith('7') || 
               national.startsWith('8') || 
               national.startsWith('9');
      case 'GH': // Ghana mobile prefixes
        return national.startsWith('2') || 
               national.startsWith('5') ||
               national.startsWith('24') ||
               national.startsWith('54');
      case 'KE': // Kenya mobile prefixes
        return national.startsWith('7') || national.startsWith('1');
      default:
        return true;
    }
  }
  
  static String? _identifyCarrier(String national, String countryCode) {
    if (national.isEmpty) return null;
    
    switch (countryCode) {
      case 'CM': // Cameroon
        if (national.startsWith('65') || national.startsWith('67') || national.startsWith('68')) {
          return 'MTN Cameroon';
        }
        if (national.startsWith('69') || national.startsWith('65')) {
          return 'Orange Cameroon';
        }
        if (national.startsWith('62') || national.startsWith('66')) {
          return 'Nexttel';
        }
        break;
      case 'NG': // Nigeria
        if (national.startsWith('803') || national.startsWith('806') || 
            national.startsWith('813') || national.startsWith('816')) {
          return 'MTN Nigeria';
        }
        if (national.startsWith('802') || national.startsWith('808') ||
            national.startsWith('812') || national.startsWith('701')) {
          return 'Airtel Nigeria';
        }
        if (national.startsWith('805') || national.startsWith('807') ||
            national.startsWith('815') || national.startsWith('811')) {
          return 'Glo Nigeria';
        }
        if (national.startsWith('809') || national.startsWith('817') ||
            national.startsWith('818') || national.startsWith('909')) {
          return '9mobile';
        }
        break;
      case 'GH': // Ghana
        if (national.startsWith('24') || national.startsWith('54') || national.startsWith('55')) {
          return 'MTN Ghana';
        }
        if (national.startsWith('20') || national.startsWith('50')) {
          return 'Vodafone Ghana';
        }
        if (national.startsWith('26') || national.startsWith('56')) {
          return 'AirtelTigo Ghana';
        }
        break;
      case 'KE': // Kenya
        if (national.startsWith('7') && (national[1] == '0' || national[1] == '1' || national[1] == '2')) {
          return 'Safaricom';
        }
        if (national.startsWith('73') || national.startsWith('78')) {
          return 'Airtel Kenya';
        }
        if (national.startsWith('77')) {
          return 'Telkom Kenya';
        }
        break;
    }
    return null;
  }
  
  static bool _isMobileNumber(String national, String countryCode) {
    switch (countryCode) {
      case 'CM':
        return national.startsWith('6');
      case 'NG':
        return national.startsWith('7') || 
               national.startsWith('8') || 
               national.startsWith('9');
      case 'GH':
        return national.startsWith('2') || national.startsWith('5');
      case 'KE':
        return national.startsWith('7') || national.startsWith('1');
      default:
        return true;
    }
  }
}

/// African country phone configuration
class _AfricanCountryPhone {
  final String code;
  final String dialingCode;
  final String name;
  
  const _AfricanCountryPhone({
    required this.code,
    required this.dialingCode,
    required this.name,
  });
}

/// List of supported African countries
const List<_AfricanCountryPhone> _africanCountries = [
  _AfricanCountryPhone(code: 'CM', dialingCode: '+237', name: 'Cameroon'),
  _AfricanCountryPhone(code: 'NG', dialingCode: '+234', name: 'Nigeria'),
  _AfricanCountryPhone(code: 'GH', dialingCode: '+233', name: 'Ghana'),
  _AfricanCountryPhone(code: 'KE', dialingCode: '+254', name: 'Kenya'),
  _AfricanCountryPhone(code: 'ZA', dialingCode: '+27', name: 'South Africa'),
  _AfricanCountryPhone(code: 'SN', dialingCode: '+221', name: 'Senegal'),
  _AfricanCountryPhone(code: 'CI', dialingCode: '+225', name: "Côte d'Ivoire"),
  _AfricanCountryPhone(code: 'TZ', dialingCode: '+255', name: 'Tanzania'),
  _AfricanCountryPhone(code: 'RW', dialingCode: '+250', name: 'Rwanda'),
  _AfricanCountryPhone(code: 'ET', dialingCode: '+251', name: 'Ethiopia'),
];

/// Extension for phone number validation
extension PhoneNumberValidation on String {
  /// Check if string is a valid Cameroon phone number
  bool get isValidCameroonPhone {
    final phone = PhoneNumber.cameroon(this);
    return phone.isValid;
  }
  
  /// Check if string is a valid Nigerian phone number
  bool get isValidNigerianPhone {
    final phone = PhoneNumber.nigeria(this);
    return phone.isValid;
  }
  
  /// Check if string is a valid Ghanaian phone number
  bool get isValidGhanaianPhone {
    final phone = PhoneNumber.ghana(this);
    return phone.isValid;
  }
  
  /// Check if string is a valid Kenyan phone number
  bool get isValidKenyanPhone {
    final phone = PhoneNumber.kenya(this);
    return phone.isValid;
  }
}
