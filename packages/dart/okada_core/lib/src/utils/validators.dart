/// Validation utilities for Okada Platform
/// Supports Cameroon-specific validations with extensibility for other African countries
class Validators {
  Validators._();

  // ============================================
  // PHONE NUMBER VALIDATION
  // ============================================

  /// Validate Cameroon phone number
  /// Valid formats: 6XXXXXXXX (9 digits starting with 6)
  /// Carriers: MTN (67, 68, 650-654), Orange (69, 655-659)
  static bool isValidCameroonPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length != 9) return false;
    if (!cleaned.startsWith('6')) return false;
    
    final prefix = cleaned.substring(0, 2);
    return ['67', '68', '69', '65'].contains(prefix);
  }

  /// Validate Nigerian phone number
  /// Valid formats: 0XXXXXXXXXX (11 digits) or XXXXXXXXXX (10 digits)
  static bool isValidNigerianPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length == 11 && cleaned.startsWith('0')) return true;
    if (cleaned.length == 10) return true;
    return false;
  }

  /// Validate Kenyan phone number
  /// Valid formats: 07XXXXXXXX or 01XXXXXXXX (10 digits)
  static bool isValidKenyanPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length != 10) return false;
    return cleaned.startsWith('07') || cleaned.startsWith('01');
  }

  /// Validate phone number with country code
  static bool isValidPhoneWithCountryCode(String phone, String countryCode) {
    switch (countryCode.toUpperCase()) {
      case 'CM': return isValidCameroonPhone(phone);
      case 'NG': return isValidNigerianPhone(phone);
      case 'KE': return isValidKenyanPhone(phone);
      default: return phone.replaceAll(RegExp(r'\D'), '').length >= 9;
    }
  }

  /// Get phone validation error message
  static String? getPhoneError(String phone, String countryCode) {
    if (phone.isEmpty) return 'Phone number is required';
    if (!isValidPhoneWithCountryCode(phone, countryCode)) {
      return 'Please enter a valid phone number';
    }
    return null;
  }

  // ============================================
  // EMAIL VALIDATION
  // ============================================

  /// Validate email address
  static bool isValidEmail(String email) {
    if (email.isEmpty) return false;
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(email);
  }

  /// Get email validation error message
  static String? getEmailError(String email) {
    if (email.isEmpty) return 'Email is required';
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    return null;
  }

  // ============================================
  // PASSWORD VALIDATION
  // ============================================

  /// Validate password strength
  /// Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  static bool isValidPassword(String password) {
    if (password.length < 8) return false;
    if (!password.contains(RegExp(r'[A-Z]'))) return false;
    if (!password.contains(RegExp(r'[a-z]'))) return false;
    if (!password.contains(RegExp(r'[0-9]'))) return false;
    return true;
  }

  /// Get password validation error message
  static String? getPasswordError(String password) {
    if (password.isEmpty) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!password.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!password.contains(RegExp(r'[a-z]'))) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!password.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }
    return null;
  }

  /// Check if passwords match
  static String? getConfirmPasswordError(String password, String confirmPassword) {
    if (confirmPassword.isEmpty) return 'Please confirm your password';
    if (password != confirmPassword) return 'Passwords do not match';
    return null;
  }

  // ============================================
  // OTP VALIDATION
  // ============================================

  /// Validate OTP code
  static bool isValidOtp(String otp, {int length = 6}) {
    if (otp.length != length) return false;
    return RegExp(r'^\d+$').hasMatch(otp);
  }

  /// Get OTP validation error message
  static String? getOtpError(String otp, {int length = 6}) {
    if (otp.isEmpty) return 'Please enter the verification code';
    if (otp.length != length) return 'Please enter all $length digits';
    if (!RegExp(r'^\d+$').hasMatch(otp)) return 'Code must contain only numbers';
    return null;
  }

  // ============================================
  // NAME VALIDATION
  // ============================================

  /// Validate name (first name or last name)
  static bool isValidName(String name) {
    if (name.trim().isEmpty) return false;
    if (name.trim().length < 2) return false;
    // Allow letters, spaces, hyphens, and apostrophes (for names like O'Brien)
    return RegExp(r"^[a-zA-ZÀ-ÿ\s'-]+$").hasMatch(name);
  }

  /// Get name validation error message
  static String? getNameError(String name, {String fieldName = 'Name'}) {
    if (name.trim().isEmpty) return '$fieldName is required';
    if (name.trim().length < 2) return '$fieldName must be at least 2 characters';
    if (!RegExp(r"^[a-zA-ZÀ-ÿ\s'-]+$").hasMatch(name)) {
      return '$fieldName contains invalid characters';
    }
    return null;
  }

  // ============================================
  // ADDRESS VALIDATION
  // ============================================

  /// Validate address
  static bool isValidAddress(String address) {
    return address.trim().length >= 5;
  }

  /// Get address validation error message
  static String? getAddressError(String address) {
    if (address.trim().isEmpty) return 'Address is required';
    if (address.trim().length < 5) return 'Please enter a valid address';
    return null;
  }

  // ============================================
  // AMOUNT VALIDATION
  // ============================================

  /// Validate amount (positive number)
  static bool isValidAmount(String amount) {
    final parsed = double.tryParse(amount.replaceAll(',', ''));
    return parsed != null && parsed > 0;
  }

  /// Validate amount within range
  static bool isValidAmountInRange(String amount, double min, double max) {
    final parsed = double.tryParse(amount.replaceAll(',', ''));
    if (parsed == null) return false;
    return parsed >= min && parsed <= max;
  }

  /// Get amount validation error message
  static String? getAmountError(String amount, {double? min, double? max, String currency = 'XAF'}) {
    if (amount.isEmpty) return 'Amount is required';
    final parsed = double.tryParse(amount.replaceAll(',', ''));
    if (parsed == null) return 'Please enter a valid amount';
    if (parsed <= 0) return 'Amount must be greater than 0';
    if (min != null && parsed < min) {
      return 'Minimum amount is $currency ${min.toStringAsFixed(0)}';
    }
    if (max != null && parsed > max) {
      return 'Maximum amount is $currency ${max.toStringAsFixed(0)}';
    }
    return null;
  }

  // ============================================
  // GENERIC VALIDATORS
  // ============================================

  /// Validate required field
  static String? requiredField(String? value, {String fieldName = 'This field'}) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }

  /// Validate minimum length
  static String? minLength(String value, int min, {String fieldName = 'This field'}) {
    if (value.length < min) {
      return '$fieldName must be at least $min characters';
    }
    return null;
  }

  /// Validate maximum length
  static String? maxLength(String value, int max, {String fieldName = 'This field'}) {
    if (value.length > max) {
      return '$fieldName must be at most $max characters';
    }
    return null;
  }
}
