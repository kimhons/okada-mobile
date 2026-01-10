import 'package:flutter_test/flutter_test.dart';
import 'package:okada_auth/src/models/auth_result.dart';
import 'package:okada_auth/src/models/auth_user.dart';
import 'package:okada_auth/src/models/otp_verification.dart';
import 'package:okada_auth/src/models/phone_number.dart';

void main() {
  group('AuthResult', () {
    test('should create success result', () {
      final result = AuthResult.success('data');
      
      expect(result.isSuccess, isTrue);
      expect(result.isFailure, isFalse);
      expect(result.data, equals('data'));
      expect(result.dataOrNull, equals('data'));
      expect(result.errorOrNull, isNull);
    });

    test('should create failure result', () {
      final result = AuthResult<String>.failure(AuthError.networkError);
      
      expect(result.isSuccess, isFalse);
      expect(result.isFailure, isTrue);
      expect(result.error, equals(AuthError.networkError));
      expect(result.errorOrNull, equals(AuthError.networkError));
      expect(result.dataOrNull, isNull);
    });

    test('should throw when accessing data on failure', () {
      final result = AuthResult<String>.failure(AuthError.networkError);
      
      expect(() => result.data, throwsStateError);
    });

    test('should throw when accessing error on success', () {
      final result = AuthResult.success('data');
      
      expect(() => result.error, throwsStateError);
    });

    test('should map success result', () {
      final result = AuthResult.success(5);
      final mapped = result.map((data) => data * 2);
      
      expect(mapped.isSuccess, isTrue);
      expect(mapped.data, equals(10));
    });

    test('should not map failure result', () {
      final result = AuthResult<int>.failure(AuthError.networkError);
      final mapped = result.map((data) => data * 2);
      
      expect(mapped.isFailure, isTrue);
      expect(mapped.error, equals(AuthError.networkError));
    });

    test('should fold success result', () {
      final result = AuthResult.success(5);
      final value = result.fold(
        onSuccess: (data) => 'success: $data',
        onFailure: (error) => 'failure: ${error.code}',
      );
      
      expect(value, equals('success: 5'));
    });

    test('should fold failure result', () {
      final result = AuthResult<int>.failure(AuthError.networkError);
      final value = result.fold(
        onSuccess: (data) => 'success: $data',
        onFailure: (error) => 'failure: ${error.code}',
      );
      
      expect(value, equals('failure: network_error'));
    });

    test('should execute onSuccess callback', () {
      var called = false;
      final result = AuthResult.success(5);
      
      result.onSuccess((data) => called = true);
      
      expect(called, isTrue);
    });

    test('should execute onFailure callback', () {
      var called = false;
      final result = AuthResult<int>.failure(AuthError.networkError);
      
      result.onFailure((error) => called = true);
      
      expect(called, isTrue);
    });

    test('should return default value on failure', () {
      final result = AuthResult<int>.failure(AuthError.networkError);
      
      expect(result.getOrElse(42), equals(42));
    });

    test('should return data instead of default on success', () {
      final result = AuthResult.success(5);
      
      expect(result.getOrElse(42), equals(5));
    });
  });

  group('AuthError', () {
    test('should have common error constants', () {
      expect(AuthError.invalidCredentials.code, equals('invalid_credentials'));
      expect(AuthError.accountNotFound.code, equals('account_not_found'));
      expect(AuthError.accountExists.code, equals('account_exists'));
      expect(AuthError.sessionExpired.code, equals('session_expired'));
      expect(AuthError.networkError.code, equals('network_error'));
      expect(AuthError.serverError.code, equals('server_error'));
      expect(AuthError.accountLocked.code, equals('account_locked'));
      expect(AuthError.tooManyAttempts.code, equals('too_many_attempts'));
      expect(AuthError.biometricNotAvailable.code, equals('biometric_not_available'));
      expect(AuthError.biometricNotEnrolled.code, equals('biometric_not_enrolled'));
      expect(AuthError.biometricFailed.code, equals('biometric_failed'));
    });

    test('should have localized messages', () {
      expect(AuthError.networkError.message, isNotEmpty);
      expect(AuthError.networkError.localizedMessage, isNotEmpty);
      expect(AuthError.networkError.localizedMessage, isNot(equals(AuthError.networkError.message)));
    });

    test('should have suggested actions', () {
      expect(AuthError.networkError.suggestedAction, equals(AuthErrorAction.retry));
      expect(AuthError.accountNotFound.suggestedAction, equals(AuthErrorAction.createAccount));
      expect(AuthError.sessionExpired.suggestedAction, equals(AuthErrorAction.login));
    });

    test('should indicate recoverability', () {
      expect(AuthError.networkError.isRecoverable, isTrue);
      expect(AuthError.serverError.isRecoverable, isFalse);
      expect(AuthError.accountLocked.isRecoverable, isFalse);
    });
  });

  group('AuthErrorAction', () {
    test('should have button text', () {
      expect(AuthErrorAction.retry.buttonText, equals('Try Again'));
      expect(AuthErrorAction.createAccount.buttonText, equals('Create Account'));
      expect(AuthErrorAction.login.buttonText, equals('Login'));
    });

    test('should have French button text', () {
      expect(AuthErrorAction.retry.buttonTextFr, equals('Réessayer'));
      expect(AuthErrorAction.createAccount.buttonTextFr, equals('Créer un compte'));
      expect(AuthErrorAction.login.buttonTextFr, equals('Se connecter'));
    });
  });

  group('AuthUser', () {
    test('should create user with required fields', () {
      final user = AuthUser(
        id: 'user_123',
        createdAt: DateTime.now(),
      );
      
      expect(user.id, equals('user_123'));
      expect(user.role, equals(UserRole.customer));
      expect(user.status, equals(AccountStatus.active));
    });

    test('should create guest user', () {
      final guest = AuthUser.guest(deviceId: 'device_123');
      
      expect(guest.id, startsWith('guest_'));
      expect(guest.role, equals(UserRole.guest));
      expect(guest.authMethod, equals(AuthMethod.guest));
    });

    test('should calculate full name', () {
      final user = AuthUser(
        id: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: DateTime.now(),
      );
      
      expect(user.fullName, equals('John Doe'));
    });

    test('should handle missing name parts', () {
      final noName = AuthUser(id: '1', createdAt: DateTime.now());
      final firstOnly = AuthUser(id: '2', firstName: 'John', createdAt: DateTime.now());
      final lastOnly = AuthUser(id: '3', lastName: 'Doe', createdAt: DateTime.now());
      
      expect(noName.fullName, equals(''));
      expect(firstOnly.fullName, equals('John'));
      expect(lastOnly.fullName, equals('Doe'));
    });

    test('should calculate display name', () {
      final withName = AuthUser(
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: DateTime.now(),
      );
      
      final withPhone = AuthUser(
        id: '2',
        phoneNumber: PhoneNumber.cameroon('612345678'),
        createdAt: DateTime.now(),
      );
      
      final withEmail = AuthUser(
        id: '3',
        email: 'test@example.com',
        createdAt: DateTime.now(),
      );
      
      expect(withName.displayName, equals('John Doe'));
      expect(withPhone.displayName, contains('+237'));
      expect(withEmail.displayName, equals('test@example.com'));
    });

    test('should calculate initials', () {
      final fullName = AuthUser(
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: DateTime.now(),
      );
      
      final firstOnly = AuthUser(
        id: '2',
        firstName: 'John',
        createdAt: DateTime.now(),
      );
      
      final noName = AuthUser(id: '3', createdAt: DateTime.now());
      
      expect(fullName.initials, equals('JD'));
      expect(firstOnly.initials, equals('J'));
      expect(noName.initials, equals('U'));
    });

    test('should check profile completeness', () {
      final complete = AuthUser(
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        phoneVerified: true,
        createdAt: DateTime.now(),
      );
      
      final incomplete = AuthUser(
        id: '2',
        firstName: 'John',
        createdAt: DateTime.now(),
      );
      
      expect(complete.isProfileComplete, isTrue);
      expect(incomplete.isProfileComplete, isFalse);
    });

    test('should check role correctly', () {
      final customer = AuthUser(id: '1', role: UserRole.customer, createdAt: DateTime.now());
      final rider = AuthUser(id: '2', role: UserRole.rider, createdAt: DateTime.now());
      final vendor = AuthUser(id: '3', role: UserRole.vendor, createdAt: DateTime.now());
      final admin = AuthUser(id: '4', role: UserRole.admin, createdAt: DateTime.now());
      
      expect(customer.isCustomer, isTrue);
      expect(rider.isRider, isTrue);
      expect(vendor.isVendor, isTrue);
      expect(admin.isAdmin, isTrue);
    });

    test('should serialize to JSON', () {
      final user = AuthUser(
        id: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: DateTime(2024, 1, 1),
      );
      
      final json = user.toJson();
      
      expect(json['id'], equals('user_123'));
      expect(json['firstName'], equals('John'));
      expect(json['lastName'], equals('Doe'));
      expect(json['email'], equals('john@example.com'));
    });

    test('should deserialize from JSON', () {
      final json = {
        'id': 'user_123',
        'firstName': 'John',
        'lastName': 'Doe',
        'createdAt': '2024-01-01T00:00:00.000',
        'role': 'customer',
        'status': 'active',
      };
      
      final user = AuthUser.fromJson(json);
      
      expect(user.id, equals('user_123'));
      expect(user.firstName, equals('John'));
      expect(user.lastName, equals('Doe'));
      expect(user.role, equals(UserRole.customer));
    });

    test('should copy with new values', () {
      final original = AuthUser(
        id: 'user_123',
        firstName: 'John',
        createdAt: DateTime.now(),
      );
      
      final updated = original.copyWith(firstName: 'Jane');
      
      expect(original.firstName, equals('John'));
      expect(updated.firstName, equals('Jane'));
      expect(updated.id, equals('user_123'));
    });
  });

  group('UserPreferences', () {
    test('should have sensible defaults', () {
      const prefs = UserPreferences();
      
      expect(prefs.pushNotificationsEnabled, isTrue);
      expect(prefs.emailNotificationsEnabled, isTrue);
      expect(prefs.smsNotificationsEnabled, isTrue);
      expect(prefs.orderUpdatesEnabled, isTrue);
      expect(prefs.promotionalNotificationsEnabled, isFalse);
      expect(prefs.themePreference, equals(ThemePreference.system));
    });

    test('should serialize to JSON', () {
      const prefs = UserPreferences(
        pushNotificationsEnabled: false,
        themePreference: ThemePreference.dark,
      );
      
      final json = prefs.toJson();
      
      expect(json['pushNotificationsEnabled'], isFalse);
      expect(json['themePreference'], equals('dark'));
    });

    test('should deserialize from JSON', () {
      final json = {
        'pushNotificationsEnabled': false,
        'themePreference': 'dark',
      };
      
      final prefs = UserPreferences.fromJson(json);
      
      expect(prefs.pushNotificationsEnabled, isFalse);
      expect(prefs.themePreference, equals(ThemePreference.dark));
    });
  });

  group('OtpVerification', () {
    test('should create initial state', () {
      final verification = OtpVerification.initial();
      
      expect(verification.state, equals(OtpVerificationState.initial));
      expect(verification.isLoading, isFalse);
      expect(verification.hasError, isFalse);
    });

    test('should create requesting state', () {
      final phoneNumber = PhoneNumber.cameroon('612345678');
      final verification = OtpVerification.requesting(phoneNumber);
      
      expect(verification.state, equals(OtpVerificationState.requesting));
      expect(verification.isLoading, isTrue);
      expect(verification.phoneNumber, equals(phoneNumber));
    });

    test('should create code sent state', () {
      final phoneNumber = PhoneNumber.cameroon('612345678');
      final verification = OtpVerification.codeSent(
        phoneNumber: phoneNumber,
        sessionId: 'session_123',
        expiresAt: DateTime.now().add(const Duration(minutes: 5)),
        resendAvailableAt: DateTime.now().add(const Duration(seconds: 30)),
      );
      
      expect(verification.state, equals(OtpVerificationState.codeSent));
      expect(verification.canEnterCode, isTrue);
      expect(verification.isExpired, isFalse);
    });

    test('should detect expired verification', () {
      final phoneNumber = PhoneNumber.cameroon('612345678');
      final verification = OtpVerification.codeSent(
        phoneNumber: phoneNumber,
        sessionId: 'session_123',
        expiresAt: DateTime.now().subtract(const Duration(minutes: 1)),
        resendAvailableAt: DateTime.now().subtract(const Duration(minutes: 1)),
      );
      
      expect(verification.isExpired, isTrue);
      expect(verification.canResend, isTrue);
    });

    test('should calculate time remaining', () {
      final phoneNumber = PhoneNumber.cameroon('612345678');
      final verification = OtpVerification.codeSent(
        phoneNumber: phoneNumber,
        sessionId: 'session_123',
        expiresAt: DateTime.now().add(const Duration(minutes: 3)),
        resendAvailableAt: DateTime.now().add(const Duration(seconds: 20)),
      );
      
      expect(verification.timeRemaining!.inMinutes, greaterThanOrEqualTo(2));
      expect(verification.resendTimeRemaining!.inSeconds, greaterThanOrEqualTo(10));
    });

    test('should create verified state', () {
      final phoneNumber = PhoneNumber.cameroon('612345678');
      final verification = OtpVerification.verified(
        phoneNumber: phoneNumber,
        verificationToken: 'token_123',
      );
      
      expect(verification.state, equals(OtpVerificationState.verified));
      expect(verification.isVerified, isTrue);
      expect(verification.verificationToken, equals('token_123'));
    });

    test('should create failed state', () {
      final phoneNumber = PhoneNumber.cameroon('612345678');
      final verification = OtpVerification.failed(
        phoneNumber: phoneNumber,
        sessionId: 'session_123',
        errorMessage: 'Invalid code',
        expiresAt: DateTime.now().add(const Duration(minutes: 5)),
        attemptsRemaining: 2,
      );
      
      expect(verification.state, equals(OtpVerificationState.failed));
      expect(verification.hasError, isTrue);
      expect(verification.canEnterCode, isTrue);
      expect(verification.attemptsRemaining, equals(2));
    });
  });

  group('OtpInputConfig', () {
    test('should have sensible defaults', () {
      const config = OtpInputConfig();
      
      expect(config.length, equals(6));
      expect(config.autoSubmit, isTrue);
      expect(config.obscureText, isFalse);
      expect(config.keyboardType, equals(OtpKeyboardType.number));
      expect(config.enableSmsAutofill, isTrue);
    });

    test('should have secure configuration', () {
      const config = OtpInputConfig.secure;
      
      expect(config.obscureText, isTrue);
      expect(config.autoSubmit, isFalse);
    });
  });
}
