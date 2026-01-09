import 'app_error.dart';

/// Authentication-related errors (E010-E019)
class AuthError extends AppError {
  const AuthError._({
    required super.code,
    required super.userMessage,
    super.technicalMessage,
    super.recoveryAction,
    super.originalException,
    super.stackTrace,
  });

  /// E010: Session expired
  const AuthError.sessionExpired({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E010',
          userMessage: 'Your session has expired. Please log in again.',
          technicalMessage: technicalMessage ?? 'JWT token expired',
          recoveryAction: RecoveryAction.relogin,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E011: Invalid credentials
  const AuthError.invalidCredentials({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E011',
          userMessage: 'Invalid phone number or password.',
          technicalMessage: technicalMessage ?? 'Authentication failed - invalid credentials',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E012: Account not found
  const AuthError.accountNotFound({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E012',
          userMessage: 'No account found with this phone number.',
          technicalMessage: technicalMessage ?? 'User account not found',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E013: Account disabled
  const AuthError.accountDisabled({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E013',
          userMessage: 'Your account has been disabled. Please contact support.',
          technicalMessage: technicalMessage ?? 'User account is disabled',
          recoveryAction: RecoveryAction.contactSupport,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E014: Invalid OTP
  const AuthError.invalidOtp({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E014',
          userMessage: 'Invalid verification code. Please try again.',
          technicalMessage: technicalMessage ?? 'OTP verification failed',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E015: OTP expired
  const AuthError.otpExpired({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E015',
          userMessage: 'Verification code has expired. Please request a new one.',
          technicalMessage: technicalMessage ?? 'OTP has expired',
          recoveryAction: RecoveryAction.retry,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E016: Too many OTP attempts
  const AuthError.tooManyOtpAttempts({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E016',
          userMessage: 'Too many attempts. Please wait before trying again.',
          technicalMessage: technicalMessage ?? 'OTP attempt limit exceeded',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E017: Token refresh failed
  const AuthError.tokenRefreshFailed({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E017',
          userMessage: 'Unable to refresh session. Please log in again.',
          technicalMessage: technicalMessage ?? 'Refresh token invalid or expired',
          recoveryAction: RecoveryAction.relogin,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E018: Biometric authentication failed
  const AuthError.biometricFailed({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E018',
          userMessage: 'Biometric authentication failed. Please use your password.',
          technicalMessage: technicalMessage ?? 'Biometric authentication failed',
          recoveryAction: RecoveryAction.none,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  /// E019: Unauthorized access
  const AuthError.unauthorized({
    String? technicalMessage,
    dynamic originalException,
    StackTrace? stackTrace,
  }) : this._(
          code: 'E019',
          userMessage: 'You don\'t have permission to access this feature.',
          technicalMessage: technicalMessage ?? 'Unauthorized access attempt',
          recoveryAction: RecoveryAction.goBack,
          originalException: originalException,
          stackTrace: stackTrace,
        );

  @override
  String getLocalizedMessage(String languageCode) {
    if (languageCode != 'fr') return userMessage;
    
    switch (code) {
      case 'E010':
        return 'Votre session a expiré. Veuillez vous reconnecter.';
      case 'E011':
        return 'Numéro de téléphone ou mot de passe invalide.';
      case 'E012':
        return 'Aucun compte trouvé avec ce numéro de téléphone.';
      case 'E013':
        return 'Votre compte a été désactivé. Veuillez contacter le support.';
      case 'E014':
        return 'Code de vérification invalide. Veuillez réessayer.';
      case 'E015':
        return 'Le code de vérification a expiré. Veuillez en demander un nouveau.';
      case 'E016':
        return 'Trop de tentatives. Veuillez patienter avant de réessayer.';
      case 'E017':
        return 'Impossible de rafraîchir la session. Veuillez vous reconnecter.';
      case 'E018':
        return 'L\'authentification biométrique a échoué. Veuillez utiliser votre mot de passe.';
      case 'E019':
        return 'Vous n\'avez pas la permission d\'accéder à cette fonctionnalité.';
      default:
        return userMessage;
    }
  }

  @override
  ErrorSeverity get severity {
    switch (code) {
      case 'E010':
      case 'E017':
        return ErrorSeverity.critical;
      case 'E013':
        return ErrorSeverity.critical;
      default:
        return ErrorSeverity.error;
    }
  }

  @override
  bool get shouldReport {
    // Report account issues and unexpected auth failures
    return code == 'E013' || code == 'E017' || code == 'E019';
  }
}
