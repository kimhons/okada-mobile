import 'package:flutter_test/flutter_test.dart';
import 'package:okada_core/okada_core.dart';

void main() {
  group('Phone Validation', () {
    group('Cameroon', () {
      test('should validate valid MTN numbers', () {
        expect(Validators.isValidCameroonPhone('670000000'), isTrue);
        expect(Validators.isValidCameroonPhone('680000000'), isTrue);
        expect(Validators.isValidCameroonPhone('650000000'), isTrue);
        expect(Validators.isValidCameroonPhone('651000000'), isTrue);
        expect(Validators.isValidCameroonPhone('654000000'), isTrue);
      });

      test('should validate valid Orange numbers', () {
        expect(Validators.isValidCameroonPhone('690000000'), isTrue);
        expect(Validators.isValidCameroonPhone('655000000'), isTrue);
        expect(Validators.isValidCameroonPhone('659000000'), isTrue);
      });

      test('should reject invalid numbers', () {
        expect(Validators.isValidCameroonPhone(''), isFalse);
        expect(Validators.isValidCameroonPhone('123456789'), isFalse);
        expect(Validators.isValidCameroonPhone('6700000'), isFalse); // Too short
        expect(Validators.isValidCameroonPhone('6700000000'), isFalse); // Too long
        expect(Validators.isValidCameroonPhone('700000000'), isFalse); // Wrong prefix
      });

      test('should handle formatted numbers', () {
        expect(Validators.isValidCameroonPhone('670 000 000'), isTrue);
        expect(Validators.isValidCameroonPhone('670-000-000'), isTrue);
      });
    });

    group('Nigeria', () {
      test('should validate valid Nigerian numbers', () {
        expect(Validators.isValidNigerianPhone('08012345678'), isTrue);
        expect(Validators.isValidNigerianPhone('8012345678'), isTrue);
      });

      test('should reject invalid Nigerian numbers', () {
        expect(Validators.isValidNigerianPhone('123456'), isFalse);
      });
    });

    group('Kenya', () {
      test('should validate valid Kenyan numbers', () {
        expect(Validators.isValidKenyanPhone('0712345678'), isTrue);
        expect(Validators.isValidKenyanPhone('0112345678'), isTrue);
      });

      test('should reject invalid Kenyan numbers', () {
        expect(Validators.isValidKenyanPhone('123456789'), isFalse);
      });
    });
  });

  group('Email Validation', () {
    test('should validate valid emails', () {
      expect(Validators.isValidEmail('test@example.com'), isTrue);
      expect(Validators.isValidEmail('user.name@domain.co.uk'), isTrue);
      expect(Validators.isValidEmail('user+tag@example.com'), isTrue);
    });

    test('should reject invalid emails', () {
      expect(Validators.isValidEmail(''), isFalse);
      expect(Validators.isValidEmail('invalid'), isFalse);
      expect(Validators.isValidEmail('invalid@'), isFalse);
      expect(Validators.isValidEmail('@example.com'), isFalse);
      expect(Validators.isValidEmail('test@.com'), isFalse);
    });

    test('should return error message for invalid email', () {
      expect(Validators.getEmailError(''), equals('Email is required'));
      expect(Validators.getEmailError('invalid'), equals('Please enter a valid email address'));
      expect(Validators.getEmailError('test@example.com'), isNull);
    });
  });

  group('Password Validation', () {
    test('should validate strong passwords', () {
      expect(Validators.isValidPassword('Password1'), isTrue);
      expect(Validators.isValidPassword('MyP@ssw0rd'), isTrue);
      expect(Validators.isValidPassword('Abcdefg1'), isTrue);
    });

    test('should reject weak passwords', () {
      expect(Validators.isValidPassword(''), isFalse);
      expect(Validators.isValidPassword('short'), isFalse);
      expect(Validators.isValidPassword('alllowercase1'), isFalse);
      expect(Validators.isValidPassword('ALLUPPERCASE1'), isFalse);
      expect(Validators.isValidPassword('NoNumbers'), isFalse);
    });

    test('should return appropriate error messages', () {
      expect(Validators.getPasswordError(''), equals('Password is required'));
      expect(Validators.getPasswordError('short'), equals('Password must be at least 8 characters'));
      expect(Validators.getPasswordError('alllowercase1'), contains('uppercase'));
      expect(Validators.getPasswordError('ALLUPPERCASE1'), contains('lowercase'));
      expect(Validators.getPasswordError('NoNumbers'), contains('number'));
      expect(Validators.getPasswordError('Password1'), isNull);
    });
  });

  group('OTP Validation', () {
    test('should validate valid OTPs', () {
      expect(Validators.isValidOtp('123456'), isTrue);
      expect(Validators.isValidOtp('000000'), isTrue);
      expect(Validators.isValidOtp('1234', length: 4), isTrue);
    });

    test('should reject invalid OTPs', () {
      expect(Validators.isValidOtp(''), isFalse);
      expect(Validators.isValidOtp('12345'), isFalse); // Too short
      expect(Validators.isValidOtp('1234567'), isFalse); // Too long
      expect(Validators.isValidOtp('abcdef'), isFalse); // Not digits
      expect(Validators.isValidOtp('12345a'), isFalse); // Contains letter
    });

    test('should return appropriate error messages', () {
      expect(Validators.getOtpError(''), equals('Please enter the verification code'));
      expect(Validators.getOtpError('123'), equals('Please enter all 6 digits'));
      expect(Validators.getOtpError('abcdef'), equals('Code must contain only numbers'));
      expect(Validators.getOtpError('123456'), isNull);
    });
  });

  group('Name Validation', () {
    test('should validate valid names', () {
      expect(Validators.isValidName('John'), isTrue);
      expect(Validators.isValidName('Jean-Pierre'), isTrue);
      expect(Validators.isValidName("O'Brien"), isTrue);
      expect(Validators.isValidName('José'), isTrue);
      expect(Validators.isValidName('Ngozi Okonkwo'), isTrue);
    });

    test('should reject invalid names', () {
      expect(Validators.isValidName(''), isFalse);
      expect(Validators.isValidName('A'), isFalse); // Too short
      expect(Validators.isValidName('John123'), isFalse); // Contains numbers
      expect(Validators.isValidName('John@Doe'), isFalse); // Contains special chars
    });
  });

  group('Amount Validation', () {
    test('should validate valid amounts', () {
      expect(Validators.isValidAmount('100'), isTrue);
      expect(Validators.isValidAmount('1,000'), isTrue);
      expect(Validators.isValidAmount('10.50'), isTrue);
    });

    test('should reject invalid amounts', () {
      expect(Validators.isValidAmount(''), isFalse);
      expect(Validators.isValidAmount('0'), isFalse);
      expect(Validators.isValidAmount('-100'), isFalse);
      expect(Validators.isValidAmount('abc'), isFalse);
    });

    test('should validate amount in range', () {
      expect(Validators.isValidAmountInRange('500', 100, 1000), isTrue);
      expect(Validators.isValidAmountInRange('50', 100, 1000), isFalse);
      expect(Validators.isValidAmountInRange('1500', 100, 1000), isFalse);
    });

    test('should return appropriate error messages', () {
      expect(Validators.getAmountError(''), equals('Amount is required'));
      expect(Validators.getAmountError('abc'), equals('Please enter a valid amount'));
      expect(Validators.getAmountError('0'), equals('Amount must be greater than 0'));
      expect(Validators.getAmountError('50', min: 100), contains('Minimum'));
      expect(Validators.getAmountError('1500', max: 1000), contains('Maximum'));
      expect(Validators.getAmountError('500'), isNull);
    });
  });

  group('Generic Validators', () {
    test('should validate required fields', () {
      expect(Validators.requiredField(null), contains('required'));
      expect(Validators.requiredField(''), contains('required'));
      expect(Validators.requiredField('   '), contains('required'));
      expect(Validators.requiredField('value'), isNull);
    });

    test('should validate minimum length', () {
      expect(Validators.minLength('ab', 3), contains('at least 3'));
      expect(Validators.minLength('abc', 3), isNull);
    });

    test('should validate maximum length', () {
      expect(Validators.maxLength('abcdef', 5), contains('at most 5'));
      expect(Validators.maxLength('abcde', 5), isNull);
    });
  });
}
