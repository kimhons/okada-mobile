import 'package:flutter_test/flutter_test.dart';
import 'package:okada_ui/okada_ui.dart';

void main() {
  group('PasswordStrengthIndicator', () {
    group('evaluateStrength', () {
      test('should return none for empty password', () {
        expect(
          PasswordStrengthIndicator.evaluateStrength(''),
          equals(PasswordStrength.none),
        );
      });

      test('should return weak for short password', () {
        expect(
          PasswordStrengthIndicator.evaluateStrength('abc'),
          equals(PasswordStrength.weak),
        );
      });

      test('should return weak for password with only lowercase', () {
        expect(
          PasswordStrengthIndicator.evaluateStrength('abcdefgh'),
          equals(PasswordStrength.weak),
        );
      });

      test('should return medium for password with mixed case', () {
        expect(
          PasswordStrengthIndicator.evaluateStrength('Abcdefgh'),
          equals(PasswordStrength.medium),
        );
      });

      test('should return medium for password with letters and numbers', () {
        expect(
          PasswordStrengthIndicator.evaluateStrength('abcdef12'),
          equals(PasswordStrength.medium),
        );
      });

      test('should return strong for password with all requirements', () {
        expect(
          PasswordStrengthIndicator.evaluateStrength('Abcdef12!'),
          equals(PasswordStrength.strong),
        );
      });

      test('should return strong for long complex password', () {
        expect(
          PasswordStrengthIndicator.evaluateStrength('MySecureP@ssw0rd123'),
          equals(PasswordStrength.strong),
        );
      });
    });
  });

  group('PasswordValidation', () {
    test('should be invalid for password shorter than 8 characters', () {
      final validation = PasswordValidation.validate('abc123');
      expect(validation.isValid, isFalse);
      expect(validation.errors, contains('Password must be at least 8 characters'));
    });

    test('should be invalid for password without numbers', () {
      final validation = PasswordValidation.validate('abcdefgh');
      expect(validation.isValid, isFalse);
      expect(validation.errors, contains('Password must contain at least one number'));
    });

    test('should be valid for password meeting all requirements', () {
      final validation = PasswordValidation.validate('abcdefg1');
      expect(validation.isValid, isTrue);
      expect(validation.errors, isEmpty);
    });

    test('should be valid for strong password', () {
      final validation = PasswordValidation.validate('MySecureP@ssw0rd');
      expect(validation.isValid, isTrue);
      expect(validation.strength, equals(PasswordStrength.strong));
    });

    test('should return multiple errors for very weak password', () {
      final validation = PasswordValidation.validate('abc');
      expect(validation.isValid, isFalse);
      expect(validation.errors.length, equals(2));
    });
  });
}
