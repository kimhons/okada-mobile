/// String extensions for Okada Platform
extension StringExtensions on String {
  /// Capitalize first letter
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Capitalize each word
  String get titleCase {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize).join(' ');
  }

  /// Check if string is valid email
  bool get isValidEmail {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(this);
  }

  /// Check if string is valid Cameroon phone number
  bool get isValidCameroonPhone {
    final cleaned = replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length == 9) {
      return cleaned.startsWith('6') || cleaned.startsWith('2');
    }
    if (cleaned.length == 12 && cleaned.startsWith('237')) {
      final local = cleaned.substring(3);
      return local.startsWith('6') || local.startsWith('2');
    }
    return false;
  }

  /// Format as Cameroon phone number
  String get formatCameroonPhone {
    final cleaned = replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length == 9) {
      return '+237 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}';
    }
    if (cleaned.length == 12 && cleaned.startsWith('237')) {
      final local = cleaned.substring(3);
      return '+237 ${local.substring(0, 3)} ${local.substring(3, 6)} ${local.substring(6)}';
    }
    return this;
  }

  /// Get phone number without country code
  String get phoneWithoutCountryCode {
    final cleaned = replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length == 12 && cleaned.startsWith('237')) {
      return cleaned.substring(3);
    }
    return cleaned;
  }

  /// Check if string is valid OTP
  bool get isValidOtp {
    final cleaned = replaceAll(RegExp(r'[^0-9]'), '');
    return cleaned.length == 6;
  }

  /// Mask phone number for display
  String get maskedPhone {
    final cleaned = replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length >= 9) {
      return '${cleaned.substring(0, 3)}****${cleaned.substring(cleaned.length - 2)}';
    }
    return this;
  }

  /// Mask email for display
  String get maskedEmail {
    if (!isValidEmail) return this;
    final parts = split('@');
    final name = parts[0];
    final domain = parts[1];
    if (name.length <= 2) {
      return '$name***@$domain';
    }
    return '${name.substring(0, 2)}***@$domain';
  }

  /// Truncate string with ellipsis
  String truncate(int maxLength, {String suffix = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength - suffix.length)}$suffix';
  }

  /// Remove diacritics for search
  String get removeDiacritics {
    const diacritics =
        'àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ';
    const replacements =
        'aaaaaaeeeeiiiiooooouuuuyyncAAAAAAEEEEIIIIOOOOOUUUUYYNC';
    var result = this;
    for (var i = 0; i < diacritics.length; i++) {
      result = result.replaceAll(diacritics[i], replacements[i]);
    }
    return result;
  }

  /// Convert to search-friendly format
  String get searchNormalized {
    return toLowerCase().removeDiacritics.trim();
  }

  /// Check if string is null or empty
  bool get isNullOrEmpty => isEmpty;

  /// Check if string is not null or empty
  bool get isNotNullOrEmpty => isNotEmpty;

  /// Parse as int or return null
  int? get toIntOrNull => int.tryParse(this);

  /// Parse as double or return null
  double? get toDoubleOrNull => double.tryParse(this);

  /// Convert snake_case to camelCase
  String get snakeToCamel {
    return split('_').asMap().entries.map((entry) {
      return entry.key == 0 ? entry.value : entry.value.capitalize;
    }).join();
  }

  /// Convert camelCase to snake_case
  String get camelToSnake {
    return replaceAllMapped(
      RegExp(r'[A-Z]'),
      (match) => '_${match.group(0)!.toLowerCase()}',
    ).replaceFirst(RegExp(r'^_'), '');
  }
}

/// Nullable string extensions
extension NullableStringExtensions on String? {
  /// Check if string is null or empty
  bool get isNullOrEmpty => this == null || this!.isEmpty;

  /// Check if string is not null or empty
  bool get isNotNullOrEmpty => this != null && this!.isNotEmpty;

  /// Return string or default value
  String orDefault(String defaultValue) => this ?? defaultValue;

  /// Return string or empty
  String get orEmpty => this ?? '';
}
