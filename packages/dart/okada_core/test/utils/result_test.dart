import 'package:flutter_test/flutter_test.dart';
import 'package:okada_core/okada_core.dart';

void main() {
  group('Result', () {
    test('should create success result', () {
      final result = Results.success<int>(42);
      expect(result.isSuccess, isTrue);
      expect(result.isFailure, isFalse);
      expect(result.successOrNull, equals(42));
      expect(result.errorOrNull, isNull);
    });

    test('should create failure result', () {
      const error = NetworkError.noConnection();
      final result = Results.failure<int>(error);
      expect(result.isSuccess, isFalse);
      expect(result.isFailure, isTrue);
      expect(result.successOrNull, isNull);
      expect(result.errorOrNull, equals(error));
    });

    test('should get value or default', () {
      final success = Results.success<int>(42);
      final failure = Results.failure<int>(const NetworkError.noConnection());
      
      expect(success.getOrDefault(0), equals(42));
      expect(failure.getOrDefault(0), equals(0));
    });

    test('should map success value', () {
      final result = Results.success<int>(21);
      final mapped = result.mapSuccess((value) => value * 2);
      expect(mapped.successOrNull, equals(42));
    });

    test('should not map failure', () {
      const error = NetworkError.noConnection();
      final result = Results.failure<int>(error);
      final mapped = result.mapSuccess((value) => value * 2);
      expect(mapped.errorOrNull, equals(error));
    });

    test('should execute onSuccess callback', () {
      var called = false;
      final result = Results.success<int>(42);
      result.onSuccess((value) => called = true);
      expect(called, isTrue);
    });

    test('should execute onFailure callback', () {
      var called = false;
      final result = Results.failure<int>(const NetworkError.noConnection());
      result.onFailure((error) => called = true);
      expect(called, isTrue);
    });

    test('should combine multiple success results', () {
      final results = [
        Results.success<int>(1),
        Results.success<int>(2),
        Results.success<int>(3),
      ];
      final combined = Results.combine(results);
      expect(combined.successOrNull, equals([1, 2, 3]));
    });

    test('should fail on first error when combining', () {
      const error = NetworkError.noConnection();
      final results = [
        Results.success<int>(1),
        Results.failure<int>(error),
        Results.success<int>(3),
      ];
      final combined = Results.combine(results);
      expect(combined.errorOrNull, equals(error));
    });

    test('should create from nullable value', () {
      final withValue = Results.fromNullable<int>(42, () => const NetworkError.noConnection());
      final withNull = Results.fromNullable<int>(null, () => const NetworkError.noConnection());
      
      expect(withValue.successOrNull, equals(42));
      expect(withNull.isFailure, isTrue);
    });

    test('should try catch synchronous function', () {
      final success = Results.tryCatch<int>(
        () => 42,
        (e, st) => const ServerError.internalError(),
      );
      expect(success.successOrNull, equals(42));

      final failure = Results.tryCatch<int>(
        () => throw Exception('test'),
        (e, st) => const ServerError.internalError(),
      );
      expect(failure.isFailure, isTrue);
    });
  });

  group('UnitResult', () {
    test('should create unit success', () {
      final result = unitSuccess();
      expect(result.isSuccess, isTrue);
      expect(result.successOrNull, equals(Unit.value));
    });

    test('should create unit failure', () {
      const error = NetworkError.noConnection();
      final result = unitFailure(error);
      expect(result.isFailure, isTrue);
      expect(result.errorOrNull, equals(error));
    });
  });
}
