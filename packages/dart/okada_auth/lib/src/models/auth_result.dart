/// Generic result wrapper for authentication operations
class AuthResult<T> {
  final T? _data;
  final AuthError? _error;
  
  const AuthResult._({T? data, AuthError? error})
      : _data = data,
        _error = error;
  
  /// Create a successful result
  factory AuthResult.success(T data) => AuthResult._(data: data);
  
  /// Create a failed result
  factory AuthResult.failure(AuthError error) => AuthResult._(error: error);
  
  /// Whether the operation was successful
  bool get isSuccess => _data != null;
  
  /// Whether the operation failed
  bool get isFailure => _error != null;
  
  /// Get the data (throws if failure)
  T get data {
    if (_data == null) {
      throw StateError('Cannot access data on a failed result');
    }
    return _data!;
  }
  
  /// Get the error (throws if success)
  AuthError get error {
    if (_error == null) {
      throw StateError('Cannot access error on a successful result');
    }
    return _error!;
  }
  
  /// Get data or null
  T? get dataOrNull => _data;
  
  /// Get error or null
  AuthError? get errorOrNull => _error;
  
  /// Transform the result
  AuthResult<R> map<R>(R Function(T data) transform) {
    if (isSuccess) {
      return AuthResult.success(transform(_data as T));
    }
    return AuthResult.failure(_error!);
  }
  
  /// Transform the result with async function
  Future<AuthResult<R>> mapAsync<R>(Future<R> Function(T data) transform) async {
    if (isSuccess) {
      final result = await transform(_data as T);
      return AuthResult.success(result);
    }
    return AuthResult.failure(_error!);
  }
  
  /// Handle both success and failure cases
  R fold<R>({
    required R Function(T data) onSuccess,
    required R Function(AuthError error) onFailure,
  }) {
    if (isSuccess) {
      return onSuccess(_data as T);
    }
    return onFailure(_error!);
  }
  
  /// Handle both cases with async functions
  Future<R> foldAsync<R>({
    required Future<R> Function(T data) onSuccess,
    required Future<R> Function(AuthError error) onFailure,
  }) async {
    if (isSuccess) {
      return await onSuccess(_data as T);
    }
    return await onFailure(_error!);
  }
  
  /// Execute action on success
  AuthResult<T> onSuccess(void Function(T data) action) {
    if (isSuccess) {
      action(_data as T);
    }
    return this;
  }
  
  /// Execute action on failure
  AuthResult<T> onFailure(void Function(AuthError error) action) {
    if (isFailure) {
      action(_error!);
    }
    return this;
  }
  
  /// Get data or default value
  T getOrElse(T defaultValue) => _data ?? defaultValue;
  
  /// Get data or compute default
  T getOrCompute(T Function() compute) => _data ?? compute();
  
  @override
  String toString() {
    if (isSuccess) {
      return 'AuthResult.success($_data)';
    }
    return 'AuthResult.failure($_error)';
  }
}

/// Authentication error
class AuthError {
  /// Error code for programmatic handling
  final String code;
  
  /// Human-readable error message (English)
  final String message;
  
  /// Localized error message (French)
  final String localizedMessage;
  
  /// Whether this error is recoverable
  final bool isRecoverable;
  
  /// Suggested action for the user
  final AuthErrorAction? suggestedAction;
  
  /// Additional error details
  final Map<String, dynamic>? details;
  
  const AuthError({
    required this.code,
    required this.message,
    required this.localizedMessage,
    this.isRecoverable = true,
    this.suggestedAction,
    this.details,
  });
  
  // ============ Common Errors ============
  
  /// Invalid credentials
  static const invalidCredentials = AuthError(
    code: 'invalid_credentials',
    message: 'Invalid email or password',
    localizedMessage: 'Email ou mot de passe invalide',
    suggestedAction: AuthErrorAction.retryWithCorrectCredentials,
  );
  
  /// Account not found
  static const accountNotFound = AuthError(
    code: 'account_not_found',
    message: 'No account found with this email',
    localizedMessage: 'Aucun compte trouvé avec cet email',
    suggestedAction: AuthErrorAction.createAccount,
  );
  
  /// Account already exists
  static const accountExists = AuthError(
    code: 'account_exists',
    message: 'An account with this email already exists',
    localizedMessage: 'Un compte avec cet email existe déjà',
    suggestedAction: AuthErrorAction.login,
  );
  
  /// Phone number already registered
  static const phoneAlreadyRegistered = AuthError(
    code: 'phone_already_registered',
    message: 'This phone number is already registered',
    localizedMessage: 'Ce numéro de téléphone est déjà enregistré',
    suggestedAction: AuthErrorAction.login,
  );
  
  /// Session expired
  static const sessionExpired = AuthError(
    code: 'session_expired',
    message: 'Your session has expired. Please login again.',
    localizedMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
    suggestedAction: AuthErrorAction.login,
  );
  
  /// Network error
  static const networkError = AuthError(
    code: 'network_error',
    message: 'Network error. Please check your connection.',
    localizedMessage: 'Erreur réseau. Veuillez vérifier votre connexion.',
    suggestedAction: AuthErrorAction.retry,
  );
  
  /// Server error
  static const serverError = AuthError(
    code: 'server_error',
    message: 'Server error. Please try again later.',
    localizedMessage: 'Erreur serveur. Veuillez réessayer plus tard.',
    isRecoverable: false,
    suggestedAction: AuthErrorAction.retry,
  );
  
  /// Account locked
  static const accountLocked = AuthError(
    code: 'account_locked',
    message: 'Your account has been locked. Please contact support.',
    localizedMessage: 'Votre compte a été verrouillé. Veuillez contacter le support.',
    isRecoverable: false,
    suggestedAction: AuthErrorAction.contactSupport,
  );
  
  /// Too many attempts
  static const tooManyAttempts = AuthError(
    code: 'too_many_attempts',
    message: 'Too many attempts. Please try again later.',
    localizedMessage: 'Trop de tentatives. Veuillez réessayer plus tard.',
    suggestedAction: AuthErrorAction.waitAndRetry,
  );
  
  /// Biometric not available
  static const biometricNotAvailable = AuthError(
    code: 'biometric_not_available',
    message: 'Biometric authentication is not available on this device',
    localizedMessage: 'L\'authentification biométrique n\'est pas disponible sur cet appareil',
    isRecoverable: false,
    suggestedAction: AuthErrorAction.useAlternativeMethod,
  );
  
  /// Biometric not enrolled
  static const biometricNotEnrolled = AuthError(
    code: 'biometric_not_enrolled',
    message: 'No biometric credentials enrolled. Please set up fingerprint or face ID.',
    localizedMessage: 'Aucune donnée biométrique enregistrée. Veuillez configurer l\'empreinte digitale ou Face ID.',
    suggestedAction: AuthErrorAction.setupBiometric,
  );
  
  /// Biometric authentication failed
  static const biometricFailed = AuthError(
    code: 'biometric_failed',
    message: 'Biometric authentication failed',
    localizedMessage: 'L\'authentification biométrique a échoué',
    suggestedAction: AuthErrorAction.retry,
  );
  
  @override
  String toString() => 'AuthError($code: $message)';
}

/// Suggested action for error recovery
enum AuthErrorAction {
  /// Retry the operation
  retry,
  
  /// Wait and retry
  waitAndRetry,
  
  /// Retry with correct credentials
  retryWithCorrectCredentials,
  
  /// Create a new account
  createAccount,
  
  /// Login to existing account
  login,
  
  /// Reset password
  resetPassword,
  
  /// Use alternative authentication method
  useAlternativeMethod,
  
  /// Set up biometric authentication
  setupBiometric,
  
  /// Contact customer support
  contactSupport,
  
  /// Verify email address
  verifyEmail,
  
  /// Verify phone number
  verifyPhone,
}

/// Extension for AuthErrorAction
extension AuthErrorActionExtension on AuthErrorAction {
  /// Get action button text (English)
  String get buttonText {
    switch (this) {
      case AuthErrorAction.retry:
        return 'Try Again';
      case AuthErrorAction.waitAndRetry:
        return 'Try Again Later';
      case AuthErrorAction.retryWithCorrectCredentials:
        return 'Try Again';
      case AuthErrorAction.createAccount:
        return 'Create Account';
      case AuthErrorAction.login:
        return 'Login';
      case AuthErrorAction.resetPassword:
        return 'Reset Password';
      case AuthErrorAction.useAlternativeMethod:
        return 'Use Another Method';
      case AuthErrorAction.setupBiometric:
        return 'Set Up Biometric';
      case AuthErrorAction.contactSupport:
        return 'Contact Support';
      case AuthErrorAction.verifyEmail:
        return 'Verify Email';
      case AuthErrorAction.verifyPhone:
        return 'Verify Phone';
    }
  }
  
  /// Get action button text (French)
  String get buttonTextFr {
    switch (this) {
      case AuthErrorAction.retry:
        return 'Réessayer';
      case AuthErrorAction.waitAndRetry:
        return 'Réessayer plus tard';
      case AuthErrorAction.retryWithCorrectCredentials:
        return 'Réessayer';
      case AuthErrorAction.createAccount:
        return 'Créer un compte';
      case AuthErrorAction.login:
        return 'Se connecter';
      case AuthErrorAction.resetPassword:
        return 'Réinitialiser le mot de passe';
      case AuthErrorAction.useAlternativeMethod:
        return 'Utiliser une autre méthode';
      case AuthErrorAction.setupBiometric:
        return 'Configurer la biométrie';
      case AuthErrorAction.contactSupport:
        return 'Contacter le support';
      case AuthErrorAction.verifyEmail:
        return 'Vérifier l\'email';
      case AuthErrorAction.verifyPhone:
        return 'Vérifier le téléphone';
    }
  }
}
