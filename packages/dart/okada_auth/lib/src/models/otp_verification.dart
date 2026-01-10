import 'phone_number.dart';

/// State of OTP verification process
enum OtpVerificationState {
  /// Initial state, no OTP requested
  initial,
  
  /// OTP request in progress
  requesting,
  
  /// OTP sent, waiting for user input
  codeSent,
  
  /// Verifying entered code
  verifying,
  
  /// Code verified successfully
  verified,
  
  /// Verification failed
  failed,
  
  /// Code expired
  expired,
  
  /// Maximum attempts exceeded
  maxAttemptsExceeded,
}

/// OTP verification data
class OtpVerification {
  /// Current state
  final OtpVerificationState state;
  
  /// Phone number being verified
  final PhoneNumber? phoneNumber;
  
  /// Session ID for verification
  final String? sessionId;
  
  /// When OTP expires
  final DateTime? expiresAt;
  
  /// When resend becomes available
  final DateTime? resendAvailableAt;
  
  /// Number of verification attempts remaining
  final int attemptsRemaining;
  
  /// Error message if verification failed
  final String? errorMessage;
  
  /// Localized error message
  final String? localizedErrorMessage;
  
  /// Verification token (after successful verification)
  final String? verificationToken;
  
  const OtpVerification({
    this.state = OtpVerificationState.initial,
    this.phoneNumber,
    this.sessionId,
    this.expiresAt,
    this.resendAvailableAt,
    this.attemptsRemaining = 3,
    this.errorMessage,
    this.localizedErrorMessage,
    this.verificationToken,
  });
  
  /// Create initial state
  factory OtpVerification.initial() => const OtpVerification();
  
  /// Create requesting state
  factory OtpVerification.requesting(PhoneNumber phoneNumber) => OtpVerification(
    state: OtpVerificationState.requesting,
    phoneNumber: phoneNumber,
  );
  
  /// Create code sent state
  factory OtpVerification.codeSent({
    required PhoneNumber phoneNumber,
    required String sessionId,
    required DateTime expiresAt,
    required DateTime resendAvailableAt,
    int attemptsRemaining = 3,
  }) => OtpVerification(
    state: OtpVerificationState.codeSent,
    phoneNumber: phoneNumber,
    sessionId: sessionId,
    expiresAt: expiresAt,
    resendAvailableAt: resendAvailableAt,
    attemptsRemaining: attemptsRemaining,
  );
  
  /// Create verifying state
  factory OtpVerification.verifying({
    required PhoneNumber phoneNumber,
    required String sessionId,
    required DateTime expiresAt,
    int attemptsRemaining = 3,
  }) => OtpVerification(
    state: OtpVerificationState.verifying,
    phoneNumber: phoneNumber,
    sessionId: sessionId,
    expiresAt: expiresAt,
    attemptsRemaining: attemptsRemaining,
  );
  
  /// Create verified state
  factory OtpVerification.verified({
    required PhoneNumber phoneNumber,
    required String verificationToken,
  }) => OtpVerification(
    state: OtpVerificationState.verified,
    phoneNumber: phoneNumber,
    verificationToken: verificationToken,
  );
  
  /// Create failed state
  factory OtpVerification.failed({
    required PhoneNumber phoneNumber,
    required String sessionId,
    required String errorMessage,
    String? localizedErrorMessage,
    required DateTime expiresAt,
    int attemptsRemaining = 0,
  }) => OtpVerification(
    state: OtpVerificationState.failed,
    phoneNumber: phoneNumber,
    sessionId: sessionId,
    errorMessage: errorMessage,
    localizedErrorMessage: localizedErrorMessage,
    expiresAt: expiresAt,
    attemptsRemaining: attemptsRemaining,
  );
  
  /// Create expired state
  factory OtpVerification.expired({
    required PhoneNumber phoneNumber,
  }) => OtpVerification(
    state: OtpVerificationState.expired,
    phoneNumber: phoneNumber,
    errorMessage: 'Verification code has expired',
    localizedErrorMessage: 'Le code de vérification a expiré',
  );
  
  /// Create max attempts exceeded state
  factory OtpVerification.maxAttemptsExceeded({
    required PhoneNumber phoneNumber,
  }) => OtpVerification(
    state: OtpVerificationState.maxAttemptsExceeded,
    phoneNumber: phoneNumber,
    attemptsRemaining: 0,
    errorMessage: 'Maximum verification attempts exceeded',
    localizedErrorMessage: 'Nombre maximum de tentatives dépassé',
  );
  
  /// Whether OTP has expired
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }
  
  /// Whether resend is available
  bool get canResend {
    if (resendAvailableAt == null) return false;
    return DateTime.now().isAfter(resendAvailableAt!);
  }
  
  /// Time remaining until expiry
  Duration? get timeRemaining {
    if (expiresAt == null) return null;
    final remaining = expiresAt!.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }
  
  /// Time remaining until resend available
  Duration? get resendTimeRemaining {
    if (resendAvailableAt == null) return null;
    final remaining = resendAvailableAt!.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }
  
  /// Whether verification is in progress
  bool get isLoading => 
      state == OtpVerificationState.requesting ||
      state == OtpVerificationState.verifying;
  
  /// Whether verification was successful
  bool get isVerified => state == OtpVerificationState.verified;
  
  /// Whether there was an error
  bool get hasError => 
      state == OtpVerificationState.failed ||
      state == OtpVerificationState.expired ||
      state == OtpVerificationState.maxAttemptsExceeded;
  
  /// Whether user can enter code
  bool get canEnterCode => 
      state == OtpVerificationState.codeSent ||
      state == OtpVerificationState.failed;
  
  /// Copy with new values
  OtpVerification copyWith({
    OtpVerificationState? state,
    PhoneNumber? phoneNumber,
    String? sessionId,
    DateTime? expiresAt,
    DateTime? resendAvailableAt,
    int? attemptsRemaining,
    String? errorMessage,
    String? localizedErrorMessage,
    String? verificationToken,
  }) {
    return OtpVerification(
      state: state ?? this.state,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      sessionId: sessionId ?? this.sessionId,
      expiresAt: expiresAt ?? this.expiresAt,
      resendAvailableAt: resendAvailableAt ?? this.resendAvailableAt,
      attemptsRemaining: attemptsRemaining ?? this.attemptsRemaining,
      errorMessage: errorMessage ?? this.errorMessage,
      localizedErrorMessage: localizedErrorMessage ?? this.localizedErrorMessage,
      verificationToken: verificationToken ?? this.verificationToken,
    );
  }
}

/// OTP input configuration
class OtpInputConfig {
  /// Number of OTP digits
  final int length;
  
  /// Whether to auto-submit when all digits entered
  final bool autoSubmit;
  
  /// Whether to show obscured input
  final bool obscureText;
  
  /// Input keyboard type
  final OtpKeyboardType keyboardType;
  
  /// Auto-fill from SMS
  final bool enableSmsAutofill;
  
  const OtpInputConfig({
    this.length = 6,
    this.autoSubmit = true,
    this.obscureText = false,
    this.keyboardType = OtpKeyboardType.number,
    this.enableSmsAutofill = true,
  });
  
  /// Default configuration
  static const OtpInputConfig defaultConfig = OtpInputConfig();
  
  /// Secure configuration (obscured)
  static const OtpInputConfig secure = OtpInputConfig(
    obscureText: true,
    autoSubmit: false,
  );
}

/// OTP keyboard type
enum OtpKeyboardType {
  /// Numeric keyboard
  number,
  
  /// Alphanumeric keyboard
  text,
}
