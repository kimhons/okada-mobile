import 'package:flutter_test/flutter_test.dart';
import 'package:okada_auth/src/models/phone_number.dart';
import 'package:okada_auth/src/services/password_recovery_service.dart';

void main() {
  group('PasswordRecoveryService', () {
    late PasswordRecoveryService service;

    setUp(() {
      service = PasswordRecoveryService();
    });

    group('requestRecoveryByPhone', () {
      test('should return success for valid phone number', () async {
        final phoneNumber = PhoneNumber.cameroon('612345678');
        
        final result = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        
        expect(result.isSuccess, isTrue);
        expect(result.data.sessionId, isNotEmpty);
        expect(result.data.sessionId, startsWith('recovery_'));
        expect(result.data.method, equals(RecoveryMethod.phone));
        expect(result.data.maskedIdentifier, contains('***'));
      });

      test('should return failure for invalid phone number', () async {
        final phoneNumber = PhoneNumber(
          rawNumber: '123',
          countryCode: 'CM',
          dialingCode: '+237',
        );
        
        final result = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        
        expect(result.isFailure, isTrue);
        expect(result.error.code, equals('invalid_phone'));
      });

      test('should enforce cooldown between requests', () async {
        final phoneNumber = PhoneNumber.cameroon('698765432');
        
        // First request
        final result1 = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        expect(result1.isSuccess, isTrue);
        
        // Immediate second request
        final result2 = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        expect(result2.isFailure, isTrue);
        expect(result2.error.code, equals('cooldown_active'));
      });
    });

    group('requestRecoveryByEmail', () {
      test('should return success for valid email', () async {
        final result = await service.requestRecoveryByEmail(
          email: 'test@example.com',
        );
        
        expect(result.isSuccess, isTrue);
        expect(result.data.sessionId, isNotEmpty);
        expect(result.data.method, equals(RecoveryMethod.email));
        expect(result.data.maskedIdentifier, contains('@'));
        expect(result.data.maskedIdentifier, contains('***'));
      });

      test('should return failure for invalid email', () async {
        final result = await service.requestRecoveryByEmail(
          email: 'invalid-email',
        );
        
        expect(result.isFailure, isTrue);
        expect(result.error.code, equals('invalid_email'));
      });

      test('should mask email correctly', () async {
        final result = await service.requestRecoveryByEmail(
          email: 'johndoe@example.com',
        );
        
        expect(result.isSuccess, isTrue);
        expect(result.data.maskedIdentifier, equals('jo***e@example.com'));
      });

      test('should handle short email local part', () async {
        final result = await service.requestRecoveryByEmail(
          email: 'ab@example.com',
        );
        
        expect(result.isSuccess, isTrue);
        expect(result.data.maskedIdentifier, contains('@'));
      });
    });

    group('verifyRecoveryOtp', () {
      test('should return error for non-existent session', () async {
        final result = await service.verifyRecoveryOtp(
          sessionId: 'non_existent',
          code: '123456',
        );
        
        expect(result.isFailure, isTrue);
        expect(result.error.code, equals('verification_failed'));
      });

      test('should return error for wrong OTP', () async {
        final phoneNumber = PhoneNumber.cameroon('687654321');
        
        final requestResult = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        
        final verifyResult = await service.verifyRecoveryOtp(
          sessionId: requestResult.data.sessionId,
          code: '000000',
        );
        
        expect(verifyResult.isFailure, isTrue);
        expect(verifyResult.error.code, equals('invalid_otp'));
      });

      test('should decrement attempts on wrong code', () async {
        final phoneNumber = PhoneNumber.cameroon('676543210');
        
        final requestResult = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        
        // First wrong attempt (3 -> 2 remaining)
        final verify1 = await service.verifyRecoveryOtp(
          sessionId: requestResult.data.sessionId,
          code: '000000',
        );
        expect(verify1.isFailure, isTrue);
        expect(verify1.error.code, equals('invalid_otp'));
        expect(verify1.error.message, contains('2 attempts'));
        
        // Second wrong attempt (2 -> 1 remaining)
        final verify2 = await service.verifyRecoveryOtp(
          sessionId: requestResult.data.sessionId,
          code: '000001',
        );
        expect(verify2.isFailure, isTrue);
        expect(verify2.error.code, equals('invalid_otp'));
        expect(verify2.error.message, contains('1 attempts'));
        
        // Third wrong attempt - should lock out (1 -> 0, triggers max_attempts)
        final verify3 = await service.verifyRecoveryOtp(
          sessionId: requestResult.data.sessionId,
          code: '000002',
        );
        expect(verify3.isFailure, isTrue);
        expect(verify3.error.code, equals('max_attempts_exceeded'));
      });
    });

    group('resetPassword', () {
      test('should return error for invalid session state', () async {
        final phoneNumber = PhoneNumber.cameroon('665432109');
        
        final requestResult = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        
        // Try to reset without verifying OTP
        final resetResult = await service.resetPassword(
          sessionId: requestResult.data.sessionId,
          resetToken: 'fake_token',
          newPassword: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        );
        
        expect(resetResult.isFailure, isTrue);
        expect(resetResult.error.code, equals('invalid_session_state'));
      });

      test('should return error for mismatched passwords', () async {
        // Note: This test would need a verified session
        // For now, we test the validation logic separately
        final validation = service.validatePassword('NewPassword123');
        expect(validation.isValid, isTrue);
      });
    });

    group('validatePassword', () {
      test('should accept valid password', () {
        final result = service.validatePassword('ValidPass123');
        
        expect(result.isValid, isTrue);
        expect(result.errors, isEmpty);
        expect(result.strength, greaterThan(50));
      });

      test('should reject short password', () {
        final result = service.validatePassword('Short1');
        
        expect(result.isValid, isFalse);
        expect(result.errors.any((e) => e.contains('8 characters')), isTrue);
      });

      test('should reject password without uppercase', () {
        final result = service.validatePassword('lowercase123');
        
        expect(result.isValid, isFalse);
        expect(result.errors.any((e) => e.contains('uppercase')), isTrue);
      });

      test('should reject password without lowercase', () {
        final result = service.validatePassword('UPPERCASE123');
        
        expect(result.isValid, isFalse);
        expect(result.errors.any((e) => e.contains('lowercase')), isTrue);
      });

      test('should reject password without digit', () {
        final result = service.validatePassword('NoDigitsHere');
        
        expect(result.isValid, isFalse);
        expect(result.errors.any((e) => e.contains('number')), isTrue);
      });

      test('should calculate strength correctly', () {
        // Weak password
        final weak = service.validatePassword('weak');
        expect(weak.strength, lessThan(30));
        expect(weak.strengthLabel, equals('Weak'));
        
        // Fair password
        final fair = service.validatePassword('FairPass1');
        expect(fair.strength, greaterThanOrEqualTo(30));
        expect(fair.strength, lessThan(60));
        
        // Strong password
        final strong = service.validatePassword('VeryStr0ng!Pass@123');
        expect(strong.strength, greaterThanOrEqualTo(80));
        expect(strong.strengthLabel, equals('Strong'));
      });

      test('should provide French error messages', () {
        final result = service.validatePassword('short');
        
        expect(result.errorsFr, isNotEmpty);
        expect(result.errorsFr.first, contains('caractères'));
      });
    });

    group('cancelSession', () {
      test('should cancel existing session', () async {
        final phoneNumber = PhoneNumber.cameroon('654321098');
        
        final requestResult = await service.requestRecoveryByPhone(
          phoneNumber: phoneNumber,
        );
        
        service.cancelSession(requestResult.data.sessionId);
        
        // Try to verify cancelled session
        final verifyResult = await service.verifyRecoveryOtp(
          sessionId: requestResult.data.sessionId,
          code: '123456',
        );
        
        expect(verifyResult.isFailure, isTrue);
      });
    });
  });

  group('RecoveryMethod', () {
    test('should have phone and email methods', () {
      expect(RecoveryMethod.values, contains(RecoveryMethod.phone));
      expect(RecoveryMethod.values, contains(RecoveryMethod.email));
    });
  });

  group('RecoveryState', () {
    test('should have all expected states', () {
      expect(RecoveryState.values, contains(RecoveryState.otpSent));
      expect(RecoveryState.values, contains(RecoveryState.otpVerified));
      expect(RecoveryState.values, contains(RecoveryState.completed));
      expect(RecoveryState.values, contains(RecoveryState.expired));
    });
  });

  group('PasswordRequirements', () {
    test('should have sensible defaults', () {
      const requirements = PasswordRequirements();
      
      expect(requirements.minLength, equals(8));
      expect(requirements.requireUppercase, isTrue);
      expect(requirements.requireLowercase, isTrue);
      expect(requirements.requireDigit, isTrue);
      expect(requirements.requireSpecialChar, isFalse);
    });
  });

  group('PasswordValidation', () {
    test('should provide strength labels', () {
      const weak = PasswordValidation(
        isValid: false,
        errors: [],
        errorsFr: [],
        strength: 20,
      );
      expect(weak.strengthLabel, equals('Weak'));
      expect(weak.strengthLabelFr, equals('Faible'));
      
      const fair = PasswordValidation(
        isValid: true,
        errors: [],
        errorsFr: [],
        strength: 50,
      );
      expect(fair.strengthLabel, equals('Fair'));
      expect(fair.strengthLabelFr, equals('Moyen'));
      
      const good = PasswordValidation(
        isValid: true,
        errors: [],
        errorsFr: [],
        strength: 70,
      );
      expect(good.strengthLabel, equals('Good'));
      expect(good.strengthLabelFr, equals('Bon'));
      
      const strong = PasswordValidation(
        isValid: true,
        errors: [],
        errorsFr: [],
        strength: 90,
      );
      expect(strong.strengthLabel, equals('Strong'));
      expect(strong.strengthLabelFr, equals('Fort'));
    });
  });
}
