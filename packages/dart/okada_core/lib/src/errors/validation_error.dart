import 'app_error.dart';

/// Validation-related errors (E030-E039)
class ValidationError extends AppError {
  /// Field that failed validation (if applicable)
  final String? field;
  
  /// Validation constraints that were violated
  final Map<String, dynamic>? constraints;

  const ValidationError._({
    required super.code,
    required super.userMessage,
    super.technicalMessage,
    super.recoveryAction,
    super.originalException,
    super.stackTrace,
    this.field,
    this.constraints,
  });

  /// E030: Required field missing
  factory ValidationError.requiredField({
    required String fieldName,
    String? technicalMessage,
  }) {
    return ValidationError._(
      code: 'E030',
      userMessage: '$fieldName is required.',
      technicalMessage: technicalMessage ?? 'Required field missing: $fieldName',
      recoveryAction: RecoveryAction.none,
      field: fieldName,
    );
  }

  /// E031: Invalid phone number format
  const ValidationError.invalidPhoneNumber({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E031',
          userMessage: 'Please enter a valid Cameroon phone number.',
          technicalMessage: technicalMessage ?? 'Phone number validation failed',
          recoveryAction: RecoveryAction.none,
          field: 'phone',
        );

  /// E032: Invalid email format
  const ValidationError.invalidEmail({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E032',
          userMessage: 'Please enter a valid email address.',
          technicalMessage: technicalMessage ?? 'Email validation failed',
          recoveryAction: RecoveryAction.none,
          field: 'email',
        );

  /// E033: Password too weak
  factory ValidationError.weakPassword({
    String? technicalMessage,
    Map<String, dynamic>? requirements,
  }) {
    return ValidationError._(
      code: 'E033',
      userMessage: 'Password must be at least 8 characters with letters and numbers.',
      technicalMessage: technicalMessage ?? 'Password does not meet requirements',
      recoveryAction: RecoveryAction.none,
      field: 'password',
      constraints: requirements,
    );
  }

  /// E034: Passwords don't match
  const ValidationError.passwordMismatch({
    String? technicalMessage,
  }) : this._(
          code: 'E034',
          userMessage: 'Passwords do not match.',
          technicalMessage: technicalMessage ?? 'Password confirmation mismatch',
          recoveryAction: RecoveryAction.none,
          field: 'confirmPassword',
        );

  /// E035: Invalid date format
  factory ValidationError.invalidDate({
    String? fieldName,
    String? technicalMessage,
  }) {
    return ValidationError._(
      code: 'E035',
      userMessage: 'Please enter a valid date.',
      technicalMessage: technicalMessage ?? 'Date validation failed',
      recoveryAction: RecoveryAction.none,
      field: fieldName ?? 'date',
    );
  }

  /// E036: Value out of range
  factory ValidationError.outOfRange({
    required String fieldName,
    num? min,
    num? max,
    String? technicalMessage,
  }) {
    String message = '$fieldName is out of valid range';
    if (min != null && max != null) {
      message = '$fieldName must be between $min and $max.';
    } else if (min != null) {
      message = '$fieldName must be at least $min.';
    } else if (max != null) {
      message = '$fieldName must be at most $max.';
    }
    
    return ValidationError._(
      code: 'E036',
      userMessage: message,
      technicalMessage: technicalMessage ?? 'Value out of range: $fieldName',
      recoveryAction: RecoveryAction.none,
      field: fieldName,
      constraints: {'min': min, 'max': max},
    );
  }

  /// E037: Invalid format
  factory ValidationError.invalidFormat({
    required String fieldName,
    String? expectedFormat,
    String? technicalMessage,
  }) {
    return ValidationError._(
      code: 'E037',
      userMessage: expectedFormat != null 
          ? '$fieldName must be in format: $expectedFormat'
          : 'Invalid $fieldName format.',
      technicalMessage: technicalMessage ?? 'Format validation failed: $fieldName',
      recoveryAction: RecoveryAction.none,
      field: fieldName,
      constraints: {'format': expectedFormat},
    );
  }

  /// E038: Text too long
  factory ValidationError.tooLong({
    required String fieldName,
    required int maxLength,
    String? technicalMessage,
  }) {
    return ValidationError._(
      code: 'E038',
      userMessage: '$fieldName must be $maxLength characters or less.',
      technicalMessage: technicalMessage ?? 'Text exceeds max length: $fieldName',
      recoveryAction: RecoveryAction.none,
      field: fieldName,
      constraints: {'maxLength': maxLength},
    );
  }

  /// E039: Invalid selection
  factory ValidationError.invalidSelection({
    required String fieldName,
    List<String>? validOptions,
    String? technicalMessage,
  }) {
    return ValidationError._(
      code: 'E039',
      userMessage: 'Please select a valid $fieldName.',
      technicalMessage: technicalMessage ?? 'Invalid selection: $fieldName',
      recoveryAction: RecoveryAction.none,
      field: fieldName,
      constraints: {'validOptions': validOptions},
    );
  }

  @override
  List<Object?> get props => [...super.props, field, constraints];

  @override
  String getLocalizedMessage(String languageCode) {
    if (languageCode != 'fr') return userMessage;
    
    switch (code) {
      case 'E030':
        return '${field ?? 'Ce champ'} est requis.';
      case 'E031':
        return 'Veuillez entrer un numéro de téléphone camerounais valide.';
      case 'E032':
        return 'Veuillez entrer une adresse email valide.';
      case 'E033':
        return 'Le mot de passe doit contenir au moins 8 caractères avec des lettres et des chiffres.';
      case 'E034':
        return 'Les mots de passe ne correspondent pas.';
      case 'E035':
        return 'Veuillez entrer une date valide.';
      case 'E036':
        return '${field ?? 'La valeur'} est hors de la plage valide.';
      case 'E037':
        return 'Format de ${field ?? 'champ'} invalide.';
      case 'E038':
        return '${field ?? 'Le texte'} doit contenir ${constraints?['maxLength'] ?? 'moins de'} caractères ou moins.';
      case 'E039':
        return 'Veuillez sélectionner un(e) ${field ?? 'option'} valide.';
      default:
        return userMessage;
    }
  }

  @override
  ErrorSeverity get severity => ErrorSeverity.warning;

  @override
  bool get shouldReport => false; // Validation errors are user input issues
}
