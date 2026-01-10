import 'dart:async';

import 'package:local_auth/local_auth.dart';
import 'package:flutter/services.dart';

import '../models/auth_result.dart';

/// Service for biometric authentication (fingerprint, face ID)
class BiometricService {
  final LocalAuthentication _localAuth = LocalAuthentication();
  
  /// Cached biometric availability
  BiometricAvailability? _cachedAvailability;
  
  /// Check if biometric authentication is available
  Future<BiometricAvailability> checkAvailability() async {
    try {
      // Check if device supports biometrics
      final canCheckBiometrics = await _localAuth.canCheckBiometrics;
      final isDeviceSupported = await _localAuth.isDeviceSupported();
      
      if (!canCheckBiometrics || !isDeviceSupported) {
        _cachedAvailability = BiometricAvailability(
          isAvailable: false,
          supportedTypes: [],
          reason: BiometricUnavailableReason.notSupported,
        );
        return _cachedAvailability!;
      }
      
      // Get available biometric types
      final availableBiometrics = await _localAuth.getAvailableBiometrics();
      
      if (availableBiometrics.isEmpty) {
        _cachedAvailability = BiometricAvailability(
          isAvailable: false,
          supportedTypes: [],
          reason: BiometricUnavailableReason.notEnrolled,
        );
        return _cachedAvailability!;
      }
      
      // Map to our biometric types
      final supportedTypes = availableBiometrics.map((type) {
        switch (type) {
          case BiometricType.fingerprint:
            return OkadaBiometricType.fingerprint;
          case BiometricType.face:
            return OkadaBiometricType.faceId;
          case BiometricType.iris:
            return OkadaBiometricType.iris;
          case BiometricType.strong:
            return OkadaBiometricType.strong;
          case BiometricType.weak:
            return OkadaBiometricType.weak;
        }
      }).toList();
      
      _cachedAvailability = BiometricAvailability(
        isAvailable: true,
        supportedTypes: supportedTypes,
        reason: null,
      );
      return _cachedAvailability!;
    } on PlatformException catch (e) {
      _cachedAvailability = BiometricAvailability(
        isAvailable: false,
        supportedTypes: [],
        reason: BiometricUnavailableReason.platformError,
        errorMessage: e.message,
      );
      return _cachedAvailability!;
    }
  }
  
  /// Authenticate using biometrics
  Future<AuthResult<BiometricAuthResult>> authenticate({
    required String localizedReason,
    String? localizedReasonFr,
    bool useErrorDialogs = true,
    bool stickyAuth = true,
    bool sensitiveTransaction = false,
    BiometricOptions? options,
  }) async {
    try {
      // Check availability first
      final availability = _cachedAvailability ?? await checkAvailability();
      
      if (!availability.isAvailable) {
        return AuthResult.failure(
          _getUnavailabilityError(availability.reason),
        );
      }
      
      // Configure authentication options
      final authOptions = AuthenticationOptions(
        useErrorDialogs: useErrorDialogs,
        stickyAuth: stickyAuth,
        sensitiveTransaction: sensitiveTransaction,
        biometricOnly: options?.biometricOnly ?? false,
      );
      
      // Perform authentication
      final authenticated = await _localAuth.authenticate(
        localizedReason: localizedReason,
        options: authOptions,
      );
      
      if (authenticated) {
        return AuthResult.success(
          BiometricAuthResult(
            authenticated: true,
            usedType: _getPrimaryBiometricType(availability.supportedTypes),
            timestamp: DateTime.now(),
          ),
        );
      } else {
        return AuthResult.failure(
          const AuthError(
            code: 'biometric_cancelled',
            message: 'Biometric authentication was cancelled',
            localizedMessage: 'L\'authentification biométrique a été annulée',
          ),
        );
      }
    } on PlatformException catch (e) {
      return AuthResult.failure(_handlePlatformException(e));
    }
  }
  
  /// Authenticate for login
  Future<AuthResult<BiometricAuthResult>> authenticateForLogin() {
    return authenticate(
      localizedReason: 'Authenticate to login to Okada',
      localizedReasonFr: 'Authentifiez-vous pour vous connecter à Okada',
      sensitiveTransaction: true,
    );
  }
  
  /// Authenticate for payment
  Future<AuthResult<BiometricAuthResult>> authenticateForPayment() {
    return authenticate(
      localizedReason: 'Authenticate to confirm payment',
      localizedReasonFr: 'Authentifiez-vous pour confirmer le paiement',
      sensitiveTransaction: true,
      options: const BiometricOptions(biometricOnly: true),
    );
  }
  
  /// Authenticate for sensitive action
  Future<AuthResult<BiometricAuthResult>> authenticateForSensitiveAction({
    required String reason,
    String? reasonFr,
  }) {
    return authenticate(
      localizedReason: reason,
      localizedReasonFr: reasonFr,
      sensitiveTransaction: true,
    );
  }
  
  /// Cancel ongoing authentication
  Future<void> cancelAuthentication() async {
    await _localAuth.stopAuthentication();
  }
  
  /// Get primary biometric type (prefer face > fingerprint)
  OkadaBiometricType _getPrimaryBiometricType(List<OkadaBiometricType> types) {
    if (types.contains(OkadaBiometricType.faceId)) {
      return OkadaBiometricType.faceId;
    }
    if (types.contains(OkadaBiometricType.fingerprint)) {
      return OkadaBiometricType.fingerprint;
    }
    if (types.contains(OkadaBiometricType.strong)) {
      return OkadaBiometricType.strong;
    }
    return types.isNotEmpty ? types.first : OkadaBiometricType.fingerprint;
  }
  
  /// Get error for unavailability reason
  AuthError _getUnavailabilityError(BiometricUnavailableReason? reason) {
    switch (reason) {
      case BiometricUnavailableReason.notSupported:
        return AuthError.biometricNotAvailable;
      case BiometricUnavailableReason.notEnrolled:
        return AuthError.biometricNotEnrolled;
      case BiometricUnavailableReason.lockedOut:
        return const AuthError(
          code: 'biometric_locked_out',
          message: 'Biometric authentication is temporarily locked. Please try again later.',
          localizedMessage: 'L\'authentification biométrique est temporairement verrouillée. Veuillez réessayer plus tard.',
        );
      case BiometricUnavailableReason.permanentlyLockedOut:
        return const AuthError(
          code: 'biometric_permanently_locked',
          message: 'Biometric authentication is permanently locked. Please use your device passcode.',
          localizedMessage: 'L\'authentification biométrique est définitivement verrouillée. Veuillez utiliser le code de votre appareil.',
          isRecoverable: false,
        );
      case BiometricUnavailableReason.platformError:
      case null:
        return const AuthError(
          code: 'biometric_error',
          message: 'Biometric authentication error. Please try again.',
          localizedMessage: 'Erreur d\'authentification biométrique. Veuillez réessayer.',
        );
    }
  }
  
  /// Handle platform exceptions
  AuthError _handlePlatformException(PlatformException e) {
    switch (e.code) {
      case 'NotAvailable':
        return AuthError.biometricNotAvailable;
      case 'NotEnrolled':
        return AuthError.biometricNotEnrolled;
      case 'LockedOut':
        return const AuthError(
          code: 'biometric_locked_out',
          message: 'Too many failed attempts. Please try again later.',
          localizedMessage: 'Trop de tentatives échouées. Veuillez réessayer plus tard.',
        );
      case 'PermanentlyLockedOut':
        return const AuthError(
          code: 'biometric_permanently_locked',
          message: 'Biometric authentication is permanently locked.',
          localizedMessage: 'L\'authentification biométrique est définitivement verrouillée.',
          isRecoverable: false,
        );
      case 'PasscodeNotSet':
        return const AuthError(
          code: 'passcode_not_set',
          message: 'Please set up a device passcode to use biometric authentication.',
          localizedMessage: 'Veuillez configurer un code d\'accès pour utiliser l\'authentification biométrique.',
        );
      default:
        return AuthError(
          code: 'biometric_error',
          message: e.message ?? 'Biometric authentication failed',
          localizedMessage: e.message ?? 'L\'authentification biométrique a échoué',
        );
    }
  }
}

/// Biometric availability information
class BiometricAvailability {
  /// Whether biometric authentication is available
  final bool isAvailable;
  
  /// List of supported biometric types
  final List<OkadaBiometricType> supportedTypes;
  
  /// Reason why biometric is unavailable (if not available)
  final BiometricUnavailableReason? reason;
  
  /// Error message (if platform error)
  final String? errorMessage;
  
  const BiometricAvailability({
    required this.isAvailable,
    required this.supportedTypes,
    this.reason,
    this.errorMessage,
  });
  
  /// Whether fingerprint is available
  bool get hasFingerprint => supportedTypes.contains(OkadaBiometricType.fingerprint);
  
  /// Whether face ID is available
  bool get hasFaceId => supportedTypes.contains(OkadaBiometricType.faceId);
  
  /// Whether strong biometric is available
  bool get hasStrongBiometric => 
      supportedTypes.contains(OkadaBiometricType.strong) ||
      supportedTypes.contains(OkadaBiometricType.fingerprint) ||
      supportedTypes.contains(OkadaBiometricType.faceId);
  
  /// Get display name for primary biometric type
  String get primaryTypeName {
    if (hasFaceId) return 'Face ID';
    if (hasFingerprint) return 'Fingerprint';
    if (supportedTypes.contains(OkadaBiometricType.iris)) return 'Iris';
    return 'Biometric';
  }
  
  /// Get display name in French
  String get primaryTypeNameFr {
    if (hasFaceId) return 'Face ID';
    if (hasFingerprint) return 'Empreinte digitale';
    if (supportedTypes.contains(OkadaBiometricType.iris)) return 'Iris';
    return 'Biométrie';
  }
}

/// Biometric types supported by Okada
enum OkadaBiometricType {
  /// Fingerprint authentication
  fingerprint,
  
  /// Face ID authentication
  faceId,
  
  /// Iris authentication
  iris,
  
  /// Strong biometric (platform-defined)
  strong,
  
  /// Weak biometric (platform-defined)
  weak,
}

/// Reason why biometric is unavailable
enum BiometricUnavailableReason {
  /// Device doesn't support biometrics
  notSupported,
  
  /// No biometric credentials enrolled
  notEnrolled,
  
  /// Temporarily locked out due to failed attempts
  lockedOut,
  
  /// Permanently locked out
  permanentlyLockedOut,
  
  /// Platform-specific error
  platformError,
}

/// Biometric authentication options
class BiometricOptions {
  /// Whether to only allow biometric authentication (no fallback to PIN)
  final bool biometricOnly;
  
  const BiometricOptions({
    this.biometricOnly = false,
  });
}

/// Result of biometric authentication
class BiometricAuthResult {
  /// Whether authentication was successful
  final bool authenticated;
  
  /// Type of biometric used
  final OkadaBiometricType usedType;
  
  /// Timestamp of authentication
  final DateTime timestamp;
  
  const BiometricAuthResult({
    required this.authenticated,
    required this.usedType,
    required this.timestamp,
  });
}
