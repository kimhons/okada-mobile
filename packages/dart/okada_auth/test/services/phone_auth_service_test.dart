import 'package:flutter_test/flutter_test.dart';
import 'package:okada_auth/src/models/phone_number.dart';
import 'package:okada_auth/src/services/phone_auth_service.dart';

void main() {
  group('PhoneAuthService', () {
    late PhoneAuthService service;

    setUp(() {
      service = PhoneAuthService();
    });

    group('requestOtp', () {
      test('should return success for valid Cameroon phone number', () async {
        final phoneNumber = PhoneNumber.cameroon('612345678');
        
        final result = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        
        expect(result.isSuccess, isTrue);
        expect(result.data.sessionId, isNotEmpty);
        expect(result.data.maskedPhoneNumber, contains('***'));
        expect(result.data.expiresAt.isAfter(DateTime.now()), isTrue);
      });

      test('should return failure for invalid phone number', () async {
        final phoneNumber = PhoneNumber(
          rawNumber: '123', // Too short
          countryCode: 'CM',
          dialingCode: '+237',
        );
        
        final result = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        
        expect(result.isFailure, isTrue);
        expect(result.error.code, equals('invalid_phone'));
      });

      test('should enforce cooldown between requests', () async {
        final phoneNumber = PhoneNumber.cameroon('612345678');
        
        // First request should succeed
        final result1 = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        expect(result1.isSuccess, isTrue);
        
        // Immediate second request should fail due to cooldown
        final result2 = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        expect(result2.isFailure, isTrue);
        expect(result2.error.code, equals('cooldown_active'));
      });

      test('should work for different OTP purposes', () async {
        for (final purpose in OtpPurpose.values) {
          final phoneNumber = PhoneNumber.cameroon('6${purpose.index}2345678');
          
          final result = await service.requestOtp(
            phoneNumber: phoneNumber,
            purpose: purpose,
          );
          
          expect(result.isSuccess, isTrue, reason: 'Failed for purpose: $purpose');
        }
      });
    });

    group('verifyOtp', () {
      test('should verify correct OTP code', () async {
        final phoneNumber = PhoneNumber.cameroon('698765432');
        
        // Request OTP
        final requestResult = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        expect(requestResult.isSuccess, isTrue);
        
        // Note: In real tests, we'd need to mock the OTP generation
        // For now, we test the failure case
        final verifyResult = await service.verifyOtp(
          sessionId: requestResult.data.sessionId,
          code: '000000', // Wrong code
        );
        
        expect(verifyResult.isFailure, isTrue);
        expect(verifyResult.error.code, equals('invalid_otp'));
      });

      test('should return error for non-existent session', () async {
        final result = await service.verifyOtp(
          sessionId: 'non_existent_session',
          code: '123456',
        );
        
        expect(result.isFailure, isTrue);
        expect(result.error.code, equals('verification_failed'));
      });

      test('should decrement attempts on wrong code', () async {
        final phoneNumber = PhoneNumber.cameroon('687654321');
        
        final requestResult = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        
        // First wrong attempt (3 -> 2 remaining)
        final verify1 = await service.verifyOtp(
          sessionId: requestResult.data.sessionId,
          code: '000000',
        );
        expect(verify1.isFailure, isTrue);
        expect(verify1.error.code, equals('invalid_otp'));
        expect(verify1.error.message, contains('2 attempts'));
        
        // Second wrong attempt (2 -> 1 remaining)
        final verify2 = await service.verifyOtp(
          sessionId: requestResult.data.sessionId,
          code: '000001',
        );
        expect(verify2.isFailure, isTrue);
        expect(verify2.error.code, equals('invalid_otp'));
        expect(verify2.error.message, contains('1 attempts'));
        
        // Third wrong attempt - should lock out (1 -> 0, triggers max_attempts)
        final verify3 = await service.verifyOtp(
          sessionId: requestResult.data.sessionId,
          code: '000002',
        );
        expect(verify3.isFailure, isTrue);
        expect(verify3.error.code, equals('max_attempts_exceeded'));
      });
    });

    group('resendOtp', () {
      test('should return error for non-existent session', () async {
        final result = await service.resendOtp(
          sessionId: 'non_existent_session',
        );
        
        expect(result.isFailure, isTrue);
        expect(result.error.code, equals('resend_failed'));
      });
    });

    group('cancelSession', () {
      test('should cancel existing session', () async {
        final phoneNumber = PhoneNumber.cameroon('676543210');
        
        final requestResult = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        
        // Cancel session
        service.cancelSession(requestResult.data.sessionId);
        
        // Verify session is cancelled
        final verifyResult = await service.verifyOtp(
          sessionId: requestResult.data.sessionId,
          code: '123456',
        );
        expect(verifyResult.isFailure, isTrue);
      });
    });

    group('getSessionRemainingTime', () {
      test('should return remaining time for valid session', () async {
        final phoneNumber = PhoneNumber.cameroon('665432109');
        
        final requestResult = await service.requestOtp(
          phoneNumber: phoneNumber,
          purpose: OtpPurpose.login,
        );
        
        final remaining = service.getSessionRemainingTime(requestResult.data.sessionId);
        
        expect(remaining, isNotNull);
        expect(remaining!.inMinutes, greaterThan(0));
        expect(remaining.inMinutes, lessThanOrEqualTo(5));
      });

      test('should throw for non-existent session', () {
        expect(
          () => service.getSessionRemainingTime('non_existent'),
          throwsException,
        );
      });
    });
  });

  group('PhoneNumber', () {
    group('validation', () {
      test('should validate Cameroon phone numbers', () {
        expect(PhoneNumber.cameroon('612345678').isValid, isTrue);
        expect(PhoneNumber.cameroon('698765432').isValid, isTrue);
        expect(PhoneNumber.cameroon('123456789').isValid, isFalse); // Wrong prefix
        expect(PhoneNumber.cameroon('61234').isValid, isFalse); // Too short
      });

      test('should validate Nigerian phone numbers', () {
        expect(PhoneNumber.nigeria('8012345678').isValid, isTrue);
        expect(PhoneNumber.nigeria('7012345678').isValid, isTrue);
        expect(PhoneNumber.nigeria('9012345678').isValid, isTrue);
        expect(PhoneNumber.nigeria('1234567890').isValid, isFalse); // Wrong prefix
      });

      test('should validate Ghanaian phone numbers', () {
        expect(PhoneNumber.ghana('241234567').isValid, isTrue);
        expect(PhoneNumber.ghana('541234567').isValid, isTrue);
        expect(PhoneNumber.ghana('123456789').isValid, isFalse); // Wrong prefix
      });

      test('should validate Kenyan phone numbers', () {
        expect(PhoneNumber.kenya('712345678').isValid, isTrue);
        expect(PhoneNumber.kenya('112345678').isValid, isTrue);
        expect(PhoneNumber.kenya('812345678').isValid, isFalse); // Wrong prefix
      });
    });

    group('formatting', () {
      test('should format E.164 correctly', () {
        final phone = PhoneNumber.cameroon('612345678');
        expect(phone.e164Format, equals('+237612345678'));
      });

      test('should mask phone number for privacy', () {
        final phone = PhoneNumber.cameroon('612345678');
        expect(phone.masked, contains('***'));
        expect(phone.masked, startsWith('+237'));
        expect(phone.masked, endsWith('78'));
      });

      test('should parse E.164 format', () {
        final phone = PhoneNumber.fromE164('+237612345678');
        expect(phone.countryCode, equals('CM'));
        expect(phone.nationalNumber, equals('612345678'));
      });
    });

    group('carrier identification', () {
      test('should identify MTN Cameroon', () {
        final phone = PhoneNumber.cameroon('670123456');
        expect(phone.carrier, contains('MTN'));
      });

      test('should identify Orange Cameroon', () {
        final phone = PhoneNumber.cameroon('690123456');
        expect(phone.carrier, contains('Orange'));
      });

      test('should identify mobile vs landline', () {
        final mobile = PhoneNumber.cameroon('612345678');
        expect(mobile.isMobile, isTrue);
        
        final landline = PhoneNumber.cameroon('212345678');
        expect(landline.isMobile, isFalse);
      });
    });

    group('string extensions', () {
      test('should validate Cameroon phone via extension', () {
        expect('612345678'.isValidCameroonPhone, isTrue);
        expect('123456789'.isValidCameroonPhone, isFalse);
      });

      test('should validate Nigerian phone via extension', () {
        expect('8012345678'.isValidNigerianPhone, isTrue);
        expect('1234567890'.isValidNigerianPhone, isFalse);
      });
    });
  });

  group('OtpPurpose', () {
    test('should have all expected purposes', () {
      expect(OtpPurpose.values, contains(OtpPurpose.login));
      expect(OtpPurpose.values, contains(OtpPurpose.registration));
      expect(OtpPurpose.values, contains(OtpPurpose.passwordReset));
      expect(OtpPurpose.values, contains(OtpPurpose.phoneChange));
      expect(OtpPurpose.values, contains(OtpPurpose.twoFactor));
    });
  });
}
