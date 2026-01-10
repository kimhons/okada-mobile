import 'dart:async';
import 'dart:math';

import '../models/auth_result.dart';
import '../models/phone_number.dart';

/// Service for password recovery and reset flows
class PasswordRecoveryService {
  /// OTP expiry duration for password reset
  static const Duration otpExpiry = Duration(minutes: 10);
  
  /// Minimum time between recovery requests
  static const Duration requestCooldown = Duration(minutes: 2);
  
  /// Maximum OTP verification attempts
  static const int maxVerificationAttempts = 3;
  
  /// Password requirements
  static const PasswordRequirements requirements = PasswordRequirements(
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecialChar: false,
  );
  
  /// Store for pending recovery sessions
  final Map<String, PasswordRecoverySession> _pendingSessions = {};
  
  /// Request password recovery via phone
  Future<AuthResult<PasswordRecoveryRequestResult>> requestRecoveryByPhone({
    required PhoneNumber phoneNumber,
  }) async {
    try {
      // Validate phone number
      if (!phoneNumber.isValid) {
        return AuthResult.failure(
          const AuthError(
            code: 'invalid_phone',
            message: 'Please enter a valid phone number',
            localizedMessage: 'Veuillez entrer un numéro de téléphone valide',
          ),
        );
      }
      
      // Check for existing session with cooldown
      final existingSession = _pendingSessions[phoneNumber.e164Format];
      if (existingSession != null) {
        final timeSinceLastRequest = DateTime.now().difference(existingSession.requestedAt);
        if (timeSinceLastRequest < requestCooldown) {
          final remainingSeconds = requestCooldown.inSeconds - timeSinceLastRequest.inSeconds;
          return AuthResult.failure(
            AuthError(
              code: 'cooldown_active',
              message: 'Please wait $remainingSeconds seconds before requesting again',
              localizedMessage: 'Veuillez attendre $remainingSeconds secondes avant de réessayer',
            ),
          );
        }
      }
      
      // In production, verify phone number exists in database
      // For now, we'll proceed with the recovery flow
      
      // Generate OTP
      final otp = _generateOtp();
      final sessionId = _generateSessionId();
      
      // Create session
      final session = PasswordRecoverySession(
        sessionId: sessionId,
        method: RecoveryMethod.phone,
        identifier: phoneNumber.e164Format,
        otp: otp,
        requestedAt: DateTime.now(),
        expiresAt: DateTime.now().add(otpExpiry),
        attemptsRemaining: maxVerificationAttempts,
        state: RecoveryState.otpSent,
      );
      
      _pendingSessions[phoneNumber.e164Format] = session;
      
      // Send OTP via SMS
      await _sendRecoveryOtp(phoneNumber, otp);
      
      return AuthResult.success(
        PasswordRecoveryRequestResult(
          sessionId: sessionId,
          method: RecoveryMethod.phone,
          maskedIdentifier: phoneNumber.masked,
          expiresAt: session.expiresAt,
          resendAvailableAt: DateTime.now().add(requestCooldown),
        ),
      );
    } catch (e) {
      return AuthResult.failure(
        const AuthError(
          code: 'recovery_request_failed',
          message: 'Failed to send recovery code. Please try again.',
          localizedMessage: 'Échec de l\'envoi du code de récupération. Veuillez réessayer.',
        ),
      );
    }
  }
  
  /// Request password recovery via email
  Future<AuthResult<PasswordRecoveryRequestResult>> requestRecoveryByEmail({
    required String email,
  }) async {
    try {
      // Validate email
      if (!_isValidEmail(email)) {
        return AuthResult.failure(
          const AuthError(
            code: 'invalid_email',
            message: 'Please enter a valid email address',
            localizedMessage: 'Veuillez entrer une adresse email valide',
          ),
        );
      }
      
      // Check for existing session with cooldown
      final existingSession = _pendingSessions[email.toLowerCase()];
      if (existingSession != null) {
        final timeSinceLastRequest = DateTime.now().difference(existingSession.requestedAt);
        if (timeSinceLastRequest < requestCooldown) {
          final remainingSeconds = requestCooldown.inSeconds - timeSinceLastRequest.inSeconds;
          return AuthResult.failure(
            AuthError(
              code: 'cooldown_active',
              message: 'Please wait $remainingSeconds seconds before requesting again',
              localizedMessage: 'Veuillez attendre $remainingSeconds secondes avant de réessayer',
            ),
          );
        }
      }
      
      // Generate OTP
      final otp = _generateOtp();
      final sessionId = _generateSessionId();
      
      // Create session
      final session = PasswordRecoverySession(
        sessionId: sessionId,
        method: RecoveryMethod.email,
        identifier: email.toLowerCase(),
        otp: otp,
        requestedAt: DateTime.now(),
        expiresAt: DateTime.now().add(otpExpiry),
        attemptsRemaining: maxVerificationAttempts,
        state: RecoveryState.otpSent,
      );
      
      _pendingSessions[email.toLowerCase()] = session;
      
      // Send OTP via email
      await _sendRecoveryEmail(email, otp);
      
      return AuthResult.success(
        PasswordRecoveryRequestResult(
          sessionId: sessionId,
          method: RecoveryMethod.email,
          maskedIdentifier: _maskEmail(email),
          expiresAt: session.expiresAt,
          resendAvailableAt: DateTime.now().add(requestCooldown),
        ),
      );
    } catch (e) {
      return AuthResult.failure(
        const AuthError(
          code: 'recovery_request_failed',
          message: 'Failed to send recovery email. Please try again.',
          localizedMessage: 'Échec de l\'envoi de l\'email de récupération. Veuillez réessayer.',
        ),
      );
    }
  }
  
  /// Verify recovery OTP
  Future<AuthResult<PasswordRecoveryVerifyResult>> verifyRecoveryOtp({
    required String sessionId,
    required String code,
  }) async {
    try {
      // Find session
      final session = _pendingSessions.values.firstWhere(
        (s) => s.sessionId == sessionId,
        orElse: () => throw Exception('Session not found'),
      );
      
      // Check expiry
      if (DateTime.now().isAfter(session.expiresAt)) {
        _pendingSessions.remove(session.identifier);
        return AuthResult.failure(
          const AuthError(
            code: 'otp_expired',
            message: 'Recovery code has expired. Please request a new one.',
            localizedMessage: 'Le code de récupération a expiré. Veuillez en demander un nouveau.',
          ),
        );
      }
      
      // Check attempts
      if (session.attemptsRemaining <= 0) {
        _pendingSessions.remove(session.identifier);
        return AuthResult.failure(
          const AuthError(
            code: 'max_attempts_exceeded',
            message: 'Too many failed attempts. Please request a new code.',
            localizedMessage: 'Trop de tentatives échouées. Veuillez demander un nouveau code.',
          ),
        );
      }
      
      // Verify code
      if (code != session.otp) {
        // Decrement attempts
        final remaining = session.attemptsRemaining - 1;
        
        if (remaining <= 0) {
          // No more attempts - remove session
          _pendingSessions.remove(session.identifier);
          return AuthResult.failure(
            const AuthError(
              code: 'max_attempts_exceeded',
              message: 'Too many failed attempts. Please request a new code.',
              localizedMessage: 'Trop de tentatives échouées. Veuillez demander un nouveau code.',
            ),
          );
        }
        
        // Update session with decremented attempts
        _pendingSessions[session.identifier] = session.copyWith(
          attemptsRemaining: remaining,
        );
        
        return AuthResult.failure(
          AuthError(
            code: 'invalid_otp',
            message: 'Invalid code. $remaining attempts remaining.',
            localizedMessage: 'Code invalide. $remaining tentatives restantes.',
          ),
        );
      }
      
      // Update session state
      final resetToken = _generateResetToken();
      _pendingSessions[session.identifier] = session.copyWith(
        state: RecoveryState.otpVerified,
        resetToken: resetToken,
        // Extend expiry for password reset
        expiresAt: DateTime.now().add(const Duration(minutes: 15)),
      );
      
      return AuthResult.success(
        PasswordRecoveryVerifyResult(
          sessionId: sessionId,
          resetToken: resetToken,
          expiresAt: DateTime.now().add(const Duration(minutes: 15)),
        ),
      );
    } catch (e) {
      return AuthResult.failure(
        const AuthError(
          code: 'verification_failed',
          message: 'Verification failed. Please try again.',
          localizedMessage: 'La vérification a échoué. Veuillez réessayer.',
        ),
      );
    }
  }
  
  /// Reset password with verified token
  Future<AuthResult<PasswordResetResult>> resetPassword({
    required String sessionId,
    required String resetToken,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      // Find session
      final session = _pendingSessions.values.firstWhere(
        (s) => s.sessionId == sessionId,
        orElse: () => throw Exception('Session not found'),
      );
      
      // Verify session state
      if (session.state != RecoveryState.otpVerified) {
        return AuthResult.failure(
          const AuthError(
            code: 'invalid_session_state',
            message: 'Please verify your identity first',
            localizedMessage: 'Veuillez d\'abord vérifier votre identité',
          ),
        );
      }
      
      // Verify reset token
      if (session.resetToken != resetToken) {
        return AuthResult.failure(
          const AuthError(
            code: 'invalid_reset_token',
            message: 'Invalid reset token. Please start over.',
            localizedMessage: 'Jeton de réinitialisation invalide. Veuillez recommencer.',
          ),
        );
      }
      
      // Check expiry
      if (DateTime.now().isAfter(session.expiresAt)) {
        _pendingSessions.remove(session.identifier);
        return AuthResult.failure(
          const AuthError(
            code: 'session_expired',
            message: 'Session has expired. Please start over.',
            localizedMessage: 'La session a expiré. Veuillez recommencer.',
          ),
        );
      }
      
      // Validate passwords match
      if (newPassword != confirmPassword) {
        return AuthResult.failure(
          const AuthError(
            code: 'passwords_mismatch',
            message: 'Passwords do not match',
            localizedMessage: 'Les mots de passe ne correspondent pas',
          ),
        );
      }
      
      // Validate password requirements
      final validation = validatePassword(newPassword);
      if (!validation.isValid) {
        return AuthResult.failure(
          AuthError(
            code: 'weak_password',
            message: validation.errors.first,
            localizedMessage: validation.errorsFr.first,
          ),
        );
      }
      
      // In production, update password in database
      // For now, we'll simulate success
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Clean up session
      _pendingSessions.remove(session.identifier);
      
      return AuthResult.success(
        PasswordResetResult(
          success: true,
          message: 'Password reset successfully. You can now login with your new password.',
          localizedMessage: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
        ),
      );
    } catch (e) {
      return AuthResult.failure(
        const AuthError(
          code: 'reset_failed',
          message: 'Failed to reset password. Please try again.',
          localizedMessage: 'Échec de la réinitialisation du mot de passe. Veuillez réessayer.',
        ),
      );
    }
  }
  
  /// Validate password against requirements
  PasswordValidation validatePassword(String password) {
    final errors = <String>[];
    final errorsFr = <String>[];
    
    if (password.length < requirements.minLength) {
      errors.add('Password must be at least ${requirements.minLength} characters');
      errorsFr.add('Le mot de passe doit contenir au moins ${requirements.minLength} caractères');
    }
    
    if (requirements.requireUppercase && !password.contains(RegExp(r'[A-Z]'))) {
      errors.add('Password must contain at least one uppercase letter');
      errorsFr.add('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    
    if (requirements.requireLowercase && !password.contains(RegExp(r'[a-z]'))) {
      errors.add('Password must contain at least one lowercase letter');
      errorsFr.add('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    
    if (requirements.requireDigit && !password.contains(RegExp(r'[0-9]'))) {
      errors.add('Password must contain at least one number');
      errorsFr.add('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (requirements.requireSpecialChar && !password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      errors.add('Password must contain at least one special character');
      errorsFr.add('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return PasswordValidation(
      isValid: errors.isEmpty,
      errors: errors,
      errorsFr: errorsFr,
      strength: _calculatePasswordStrength(password),
    );
  }
  
  /// Calculate password strength (0-100)
  int _calculatePasswordStrength(String password) {
    int strength = 0;
    
    // Length contribution (up to 30 points)
    strength += (password.length * 3).clamp(0, 30);
    
    // Character variety (up to 40 points)
    if (password.contains(RegExp(r'[a-z]'))) strength += 10;
    if (password.contains(RegExp(r'[A-Z]'))) strength += 10;
    if (password.contains(RegExp(r'[0-9]'))) strength += 10;
    if (password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) strength += 10;
    
    // Complexity bonus (up to 30 points)
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;
    if (RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])').hasMatch(password)) {
      strength += 10;
    }
    
    return strength.clamp(0, 100);
  }
  
  /// Cancel recovery session
  void cancelSession(String sessionId) {
    _pendingSessions.removeWhere((_, session) => session.sessionId == sessionId);
  }
  
  /// Generate 6-digit OTP
  String _generateOtp() {
    final random = Random.secure();
    return List.generate(6, (_) => random.nextInt(10)).join();
  }
  
  /// Generate session ID
  String _generateSessionId() {
    final random = Random.secure();
    final bytes = List.generate(16, (_) => random.nextInt(256));
    return 'recovery_${bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join()}';
  }
  
  /// Generate reset token
  String _generateResetToken() {
    final random = Random.secure();
    final bytes = List.generate(32, (_) => random.nextInt(256));
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }
  
  /// Validate email format
  bool _isValidEmail(String email) {
    return RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(email);
  }
  
  /// Mask email for display
  String _maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    
    final local = parts[0];
    final domain = parts[1];
    
    if (local.length <= 2) {
      return '$local***@$domain';
    }
    
    final first = local.substring(0, 2);
    final last = local.length > 3 ? local.substring(local.length - 1) : '';
    return '$first***$last@$domain';
  }
  
  /// Send recovery OTP via SMS (mock)
  Future<void> _sendRecoveryOtp(PhoneNumber phoneNumber, String otp) async {
    await Future.delayed(const Duration(milliseconds: 500));
    print('📱 Recovery OTP sent to ${phoneNumber.masked}: $otp');
  }
  
  /// Send recovery OTP via email (mock)
  Future<void> _sendRecoveryEmail(String email, String otp) async {
    await Future.delayed(const Duration(milliseconds: 500));
    print('📧 Recovery OTP sent to ${_maskEmail(email)}: $otp');
  }
}

/// Recovery method
enum RecoveryMethod {
  /// Recovery via phone SMS
  phone,
  
  /// Recovery via email
  email,
}

/// Recovery session state
enum RecoveryState {
  /// OTP requested and sent
  otpSent,
  
  /// OTP verified successfully
  otpVerified,
  
  /// Password reset completed
  completed,
  
  /// Session expired or cancelled
  expired,
}

/// Password recovery session
class PasswordRecoverySession {
  final String sessionId;
  final RecoveryMethod method;
  final String identifier;
  final String otp;
  final DateTime requestedAt;
  final DateTime expiresAt;
  final int attemptsRemaining;
  final RecoveryState state;
  final String? resetToken;
  
  const PasswordRecoverySession({
    required this.sessionId,
    required this.method,
    required this.identifier,
    required this.otp,
    required this.requestedAt,
    required this.expiresAt,
    required this.attemptsRemaining,
    required this.state,
    this.resetToken,
  });
  
  PasswordRecoverySession copyWith({
    String? sessionId,
    RecoveryMethod? method,
    String? identifier,
    String? otp,
    DateTime? requestedAt,
    DateTime? expiresAt,
    int? attemptsRemaining,
    RecoveryState? state,
    String? resetToken,
  }) {
    return PasswordRecoverySession(
      sessionId: sessionId ?? this.sessionId,
      method: method ?? this.method,
      identifier: identifier ?? this.identifier,
      otp: otp ?? this.otp,
      requestedAt: requestedAt ?? this.requestedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      attemptsRemaining: attemptsRemaining ?? this.attemptsRemaining,
      state: state ?? this.state,
      resetToken: resetToken ?? this.resetToken,
    );
  }
}

/// Result of password recovery request
class PasswordRecoveryRequestResult {
  final String sessionId;
  final RecoveryMethod method;
  final String maskedIdentifier;
  final DateTime expiresAt;
  final DateTime resendAvailableAt;
  
  const PasswordRecoveryRequestResult({
    required this.sessionId,
    required this.method,
    required this.maskedIdentifier,
    required this.expiresAt,
    required this.resendAvailableAt,
  });
}

/// Result of OTP verification
class PasswordRecoveryVerifyResult {
  final String sessionId;
  final String resetToken;
  final DateTime expiresAt;
  
  const PasswordRecoveryVerifyResult({
    required this.sessionId,
    required this.resetToken,
    required this.expiresAt,
  });
}

/// Result of password reset
class PasswordResetResult {
  final bool success;
  final String message;
  final String localizedMessage;
  
  const PasswordResetResult({
    required this.success,
    required this.message,
    required this.localizedMessage,
  });
}

/// Password requirements configuration
class PasswordRequirements {
  final int minLength;
  final bool requireUppercase;
  final bool requireLowercase;
  final bool requireDigit;
  final bool requireSpecialChar;
  
  const PasswordRequirements({
    this.minLength = 8,
    this.requireUppercase = true,
    this.requireLowercase = true,
    this.requireDigit = true,
    this.requireSpecialChar = false,
  });
}

/// Password validation result
class PasswordValidation {
  final bool isValid;
  final List<String> errors;
  final List<String> errorsFr;
  final int strength;
  
  const PasswordValidation({
    required this.isValid,
    required this.errors,
    required this.errorsFr,
    required this.strength,
  });
  
  /// Get strength label
  String get strengthLabel {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  }
  
  /// Get strength label in French
  String get strengthLabelFr {
    if (strength < 30) return 'Faible';
    if (strength < 60) return 'Moyen';
    if (strength < 80) return 'Bon';
    return 'Fort';
  }
}
