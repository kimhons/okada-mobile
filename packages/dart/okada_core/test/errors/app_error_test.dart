import 'package:flutter_test/flutter_test.dart';
import 'package:okada_core/okada_core.dart';

void main() {
  group('NetworkError', () {
    test('should create no connection error with correct code', () {
      const error = NetworkError.noConnection();
      expect(error.code, equals('E001'));
      expect(error.recoveryAction, equals(RecoveryAction.checkConnection));
    });

    test('should create timeout error with correct code', () {
      const error = NetworkError.timeout();
      expect(error.code, equals('E002'));
      expect(error.recoveryAction, equals(RecoveryAction.retry));
    });

    test('should provide localized message in English', () {
      const error = NetworkError.noConnection();
      final message = error.getLocalizedMessage('en');
      expect(message, contains('internet'));
    });

    test('should provide localized message in French', () {
      const error = NetworkError.noConnection();
      final message = error.getLocalizedMessage('fr');
      expect(message, contains('internet'));
    });
  });

  group('AuthError', () {
    test('should create invalid credentials error', () {
      const error = AuthError.invalidCredentials();
      expect(error.code, equals('E011'));
      expect(error.recoveryAction, equals(RecoveryAction.none));
    });

    test('should create session expired error', () {
      const error = AuthError.sessionExpired();
      expect(error.code, equals('E010'));
      expect(error.recoveryAction, equals(RecoveryAction.relogin));
    });

    test('should create account disabled error', () {
      const error = AuthError.accountDisabled();
      expect(error.code, equals('E013'));
      expect(error.recoveryAction, equals(RecoveryAction.contactSupport));
    });
  });

  group('PaymentError', () {
    test('should create insufficient funds error', () {
      const error = PaymentError.insufficientFunds();
      expect(error.code, equals('E020'));
      expect(error.recoveryAction, equals(RecoveryAction.tryDifferentPayment));
    });

    test('should create payment declined error', () {
      const error = PaymentError.declined();
      expect(error.code, equals('E021'));
      expect(error.recoveryAction, equals(RecoveryAction.tryDifferentPayment));
    });

    test('should create payment timeout error', () {
      const error = PaymentError.timeout();
      expect(error.code, equals('E022'));
      expect(error.recoveryAction, equals(RecoveryAction.retry));
    });
  });

  group('ValidationError', () {
    test('should create invalid phone error', () {
      const error = ValidationError.invalidPhoneNumber();
      expect(error.code, equals('E031'));
      expect(error.recoveryAction, equals(RecoveryAction.none));
    });

    test('should create required field error with field name', () {
      final error = ValidationError.requiredField(fieldName: 'email');
      expect(error.code, equals('E030'));
      expect(error.userMessage, contains('email'));
    });
  });

  group('ServerError', () {
    test('should create internal error', () {
      const error = ServerError.internalError();
      expect(error.code, equals('E040'));
      expect(error.recoveryAction, equals(RecoveryAction.retry));
    });

    test('should create maintenance error', () {
      const error = ServerError.maintenance();
      expect(error.code, equals('E048'));
      expect(error.recoveryAction, equals(RecoveryAction.retry));
    });
    
    test('should create error from status code', () {
      final error = ServerError.fromStatusCode(500);
      expect(error.code, equals('E040'));
      expect(error.statusCode, equals(500));
    });
  });
}
