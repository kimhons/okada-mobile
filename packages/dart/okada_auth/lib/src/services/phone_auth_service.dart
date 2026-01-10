import 'dart:async';
import 'dart:math';

import '../models/auth_result.dart';
import '../models/otp_verification.dart';
import '../models/phone_number.dart';

/// Service for phone-based authentication with OTP
class PhoneAuthService {
  /// OTP expiry duration
  static const Duration otpExpiry = Duration(minutes: 5);
  
  /// Minimum time between OTP resends
  static const Duration resendCooldown = Duration(seconds: 30);
  
  /// Maximum OTP verification attempts
  static const int maxVerificationAttempts = 3;
  
  /// Store for pending OTP verifications (in production, this would be server-side)
  final Map<String, OtpSession> _pendingSessions = {};
  
  /// Request OTP for phone number
  /// Returns session ID for verification
  Future<AuthResult<OtpRequestResult>> requestOtp({
    required PhoneNumber phoneNumber,
    required OtpPurpose purpose,
  }) async {
    try {
      // Validate phone number
      if (!phoneNumber.isValid) {
        return AuthResult.failure(
          AuthError(
            code: 'invalid_phone',
            message: 'Please enter a valid phone number',
            localizedMessage: 'Veuillez entrer un numéro de téléphone valide',
          ),
        );
      }
      
      // Check for existing session with cooldown
      final existingSession = _pendingSessions[phoneNumber.e164Format];
      if (existingSession != null) {
        final timeSinceLastSend = DateTime.now().difference(existingSession.lastSentAt);
        if (timeSinceLastSend < resendCooldown) {
          final remainingSeconds = resendCooldown.inSeconds - timeSinceLastSend.inSeconds;
          return AuthResult.failure(
            AuthError(
              code: 'cooldown_active',
              message: 'Please wait $remainingSeconds seconds before requesting a new code',
              localizedMessage: 'Veuillez attendre $remainingSeconds secondes avant de demander un nouveau code',
            ),
          );
        }
      }
      
      // Generate OTP (6 digits)
      final otp = _generateOtp();
      final sessionId = _generateSessionId();
      
      // Create session
      final session = OtpSession(
        sessionId: sessionId,
        phoneNumber: phoneNumber,
        otp: otp,
        purpose: purpose,
        createdAt: DateTime.now(),
        lastSentAt: DateTime.now(),
        expiresAt: DateTime.now().add(otpExpiry),
        attemptsRemaining: maxVerificationAttempts,
      );
      
      _pendingSessions[phoneNumber.e164Format] = session;
      
      // In production, send OTP via SMS gateway (MTN, Orange, etc.)
      await _sendOtpSms(phoneNumber, otp);
      
      return AuthResult.success(
        OtpRequestResult(
          sessionId: sessionId,
          expiresAt: session.expiresAt,
          resendAvailableAt: DateTime.now().add(resendCooldown),
          maskedPhoneNumber: phoneNumber.masked,
        ),
      );
    } catch (e) {
      return AuthResult.failure(
        AuthError(
          code: 'otp_request_failed',
          message: 'Failed to send verification code. Please try again.',
          localizedMessage: 'Échec de l\'envoi du code de vérification. Veuillez réessayer.',
        ),
      );
    }
  }
  
  /// Verify OTP code
  Future<AuthResult<OtpVerificationResult>> verifyOtp({
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
        _pendingSessions.remove(session.phoneNumber.e164Format);
        return AuthResult.failure(
          AuthError(
            code: 'otp_expired',
            message: 'Verification code has expired. Please request a new one.',
            localizedMessage: 'Le code de vérification a expiré. Veuillez en demander un nouveau.',
          ),
        );
      }
      
      // Check attempts
      if (session.attemptsRemaining <= 0) {
        _pendingSessions.remove(session.phoneNumber.e164Format);
        return AuthResult.failure(
          AuthError(
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
          _pendingSessions.remove(session.phoneNumber.e164Format);
          return AuthResult.failure(
            const AuthError(
              code: 'max_attempts_exceeded',
              message: 'Too many failed attempts. Please request a new code.',
              localizedMessage: 'Trop de tentatives échouées. Veuillez demander un nouveau code.',
            ),
          );
        }
        
        // Update session with decremented attempts
        _pendingSessions[session.phoneNumber.e164Format] = session.copyWith(
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
      
      // Success - remove session
      _pendingSessions.remove(session.phoneNumber.e164Format);
      
      // Generate verification token
      final verificationToken = _generateVerificationToken();
      
      return AuthResult.success(
        OtpVerificationResult(
          verified: true,
          phoneNumber: session.phoneNumber,
          purpose: session.purpose,
          verificationToken: verificationToken,
          verifiedAt: DateTime.now(),
        ),
      );
    } catch (e) {
      return AuthResult.failure(
        AuthError(
          code: 'verification_failed',
          message: 'Verification failed. Please try again.',
          localizedMessage: 'La vérification a échoué. Veuillez réessayer.',
        ),
      );
    }
  }
  
  /// Resend OTP to same phone number
  Future<AuthResult<OtpRequestResult>> resendOtp({
    required String sessionId,
  }) async {
    try {
      // Find session
      final session = _pendingSessions.values.firstWhere(
        (s) => s.sessionId == sessionId,
        orElse: () => throw Exception('Session not found'),
      );
      
      // Request new OTP for same phone
      return requestOtp(
        phoneNumber: session.phoneNumber,
        purpose: session.purpose,
      );
    } catch (e) {
      return AuthResult.failure(
        AuthError(
          code: 'resend_failed',
          message: 'Failed to resend code. Please try again.',
          localizedMessage: 'Échec du renvoi du code. Veuillez réessayer.',
        ),
      );
    }
  }
  
  /// Cancel pending OTP session
  void cancelSession(String sessionId) {
    _pendingSessions.removeWhere((_, session) => session.sessionId == sessionId);
  }
  
  /// Get remaining time for session
  Duration? getSessionRemainingTime(String sessionId) {
    final session = _pendingSessions.values.firstWhere(
      (s) => s.sessionId == sessionId,
      orElse: () => throw Exception('Session not found'),
    );
    
    final remaining = session.expiresAt.difference(DateTime.now());
    return remaining.isNegative ? null : remaining;
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
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }
  
  /// Generate verification token
  String _generateVerificationToken() {
    final random = Random.secure();
    final bytes = List.generate(32, (_) => random.nextInt(256));
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }
  
  /// Send OTP via SMS (mock implementation)
  Future<void> _sendOtpSms(PhoneNumber phoneNumber, String otp) async {
    // In production, integrate with:
    // - MTN MoMo API for Cameroon
    // - Orange SMS API
    // - Twilio for international
    
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Log for development
    print('📱 OTP sent to ${phoneNumber.masked}: $otp');
  }
}

/// OTP session data
class OtpSession {
  final String sessionId;
  final PhoneNumber phoneNumber;
  final String otp;
  final OtpPurpose purpose;
  final DateTime createdAt;
  final DateTime lastSentAt;
  final DateTime expiresAt;
  final int attemptsRemaining;
  
  const OtpSession({
    required this.sessionId,
    required this.phoneNumber,
    required this.otp,
    required this.purpose,
    required this.createdAt,
    required this.lastSentAt,
    required this.expiresAt,
    required this.attemptsRemaining,
  });
  
  OtpSession copyWith({
    String? sessionId,
    PhoneNumber? phoneNumber,
    String? otp,
    OtpPurpose? purpose,
    DateTime? createdAt,
    DateTime? lastSentAt,
    DateTime? expiresAt,
    int? attemptsRemaining,
  }) {
    return OtpSession(
      sessionId: sessionId ?? this.sessionId,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      otp: otp ?? this.otp,
      purpose: purpose ?? this.purpose,
      createdAt: createdAt ?? this.createdAt,
      lastSentAt: lastSentAt ?? this.lastSentAt,
      expiresAt: expiresAt ?? this.expiresAt,
      attemptsRemaining: attemptsRemaining ?? this.attemptsRemaining,
    );
  }
}

/// Purpose of OTP verification
enum OtpPurpose {
  /// Login to existing account
  login,
  
  /// Register new account
  registration,
  
  /// Reset password
  passwordReset,
  
  /// Verify phone number change
  phoneChange,
  
  /// Two-factor authentication
  twoFactor,
}

/// Result of OTP request
class OtpRequestResult {
  final String sessionId;
  final DateTime expiresAt;
  final DateTime resendAvailableAt;
  final String maskedPhoneNumber;
  
  const OtpRequestResult({
    required this.sessionId,
    required this.expiresAt,
    required this.resendAvailableAt,
    required this.maskedPhoneNumber,
  });
  
  /// Time until OTP expires
  Duration get expiresIn => expiresAt.difference(DateTime.now());
  
  /// Time until resend is available
  Duration get resendIn => resendAvailableAt.difference(DateTime.now());
  
  /// Whether resend is available
  bool get canResend => DateTime.now().isAfter(resendAvailableAt);
}

/// Result of OTP verification
class OtpVerificationResult {
  final bool verified;
  final PhoneNumber phoneNumber;
  final OtpPurpose purpose;
  final String verificationToken;
  final DateTime verifiedAt;
  
  const OtpVerificationResult({
    required this.verified,
    required this.phoneNumber,
    required this.purpose,
    required this.verificationToken,
    required this.verifiedAt,
  });
}
