/// Input validators for Okada Platform
class Validators {
  Validators._();

  /// Validate phone number (Cameroon format)
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le numéro de téléphone est requis';
    }
    final cleaned = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length < 9) {
      return 'Le numéro doit contenir au moins 9 chiffres';
    }
    if (cleaned.length == 9) {
      if (!cleaned.startsWith('6') && !cleaned.startsWith('2')) {
        return 'Le numéro doit commencer par 6 ou 2';
      }
    } else if (cleaned.length == 12) {
      if (!cleaned.startsWith('237')) {
        return 'Indicatif pays invalide';
      }
      final local = cleaned.substring(3);
      if (!local.startsWith('6') && !local.startsWith('2')) {
        return 'Le numéro doit commencer par 6 ou 2';
      }
    } else {
      return 'Format de numéro invalide';
    }
    return null;
  }

  /// Validate OTP code
  static String? validateOtp(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le code OTP est requis';
    }
    final cleaned = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length != 6) {
      return 'Le code doit contenir 6 chiffres';
    }
    return null;
  }

  /// Validate email
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'L\'email est requis';
    }
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    if (!emailRegex.hasMatch(value)) {
      return 'Format d\'email invalide';
    }
    return null;
  }

  /// Validate required field
  static String? validateRequired(String? value, {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? 'Ce champ'} est requis';
    }
    return null;
  }

  /// Validate minimum length
  static String? validateMinLength(String? value, int minLength,
      {String? fieldName}) {
    if (value == null || value.length < minLength) {
      return '${fieldName ?? 'Ce champ'} doit contenir au moins $minLength caractères';
    }
    return null;
  }

  /// Validate maximum length
  static String? validateMaxLength(String? value, int maxLength,
      {String? fieldName}) {
    if (value != null && value.length > maxLength) {
      return '${fieldName ?? 'Ce champ'} ne doit pas dépasser $maxLength caractères';
    }
    return null;
  }

  /// Validate name (letters, spaces, hyphens only)
  static String? validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Le nom est requis';
    }
    if (value.length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    final nameRegex = RegExp(r"^[a-zA-ZÀ-ÿ\s\-']+$");
    if (!nameRegex.hasMatch(value)) {
      return 'Le nom ne peut contenir que des lettres';
    }
    return null;
  }

  /// Validate password
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le mot de passe est requis';
    }
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  }

  /// Validate password confirmation
  static String? validatePasswordConfirmation(
      String? value, String? password) {
    if (value == null || value.isEmpty) {
      return 'La confirmation est requise';
    }
    if (value != password) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  }

  /// Validate PIN code
  static String? validatePin(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le code PIN est requis';
    }
    final cleaned = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length != 4) {
      return 'Le code PIN doit contenir 4 chiffres';
    }
    return null;
  }

  /// Validate amount
  static String? validateAmount(String? value,
      {int? min, int? max, String? currency}) {
    if (value == null || value.isEmpty) {
      return 'Le montant est requis';
    }
    final amount = int.tryParse(value.replaceAll(RegExp(r'[^0-9]'), ''));
    if (amount == null) {
      return 'Montant invalide';
    }
    if (min != null && amount < min) {
      return 'Le montant minimum est $min ${currency ?? 'FCFA'}';
    }
    if (max != null && amount > max) {
      return 'Le montant maximum est $max ${currency ?? 'FCFA'}';
    }
    return null;
  }

  /// Validate vehicle plate number (Cameroon format)
  static String? validateVehiclePlate(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Le numéro de plaque est requis';
    }
    // Cameroon plate format: XX 000 XX or similar
    final plateRegex = RegExp(r'^[A-Z]{2}\s?\d{3}\s?[A-Z]{2}$');
    final cleaned = value.toUpperCase().replaceAll(RegExp(r'\s+'), ' ');
    if (!plateRegex.hasMatch(cleaned.replaceAll(' ', ''))) {
      return 'Format de plaque invalide (ex: CE 123 AB)';
    }
    return null;
  }

  /// Validate license number
  static String? validateLicenseNumber(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Le numéro de permis est requis';
    }
    if (value.length < 8) {
      return 'Numéro de permis invalide';
    }
    return null;
  }

  /// Validate address
  static String? validateAddress(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'L\'adresse est requise';
    }
    if (value.length < 10) {
      return 'L\'adresse doit être plus détaillée';
    }
    return null;
  }

  /// Validate quantity
  static String? validateQuantity(String? value, {int? max}) {
    if (value == null || value.isEmpty) {
      return 'La quantité est requise';
    }
    final quantity = int.tryParse(value);
    if (quantity == null || quantity < 1) {
      return 'La quantité doit être au moins 1';
    }
    if (max != null && quantity > max) {
      return 'La quantité maximum est $max';
    }
    return null;
  }

  /// Combine multiple validators
  static String? Function(String?) combine(
      List<String? Function(String?)> validators) {
    return (String? value) {
      for (final validator in validators) {
        final error = validator(value);
        if (error != null) return error;
      }
      return null;
    };
  }
}
