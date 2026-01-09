import 'package:dartz/dartz.dart';
import '../errors/app_error.dart';

/// Type alias for Either with AppError on the left (failure) and T on the right (success)
typedef Result<T> = Either<AppError, T>;

/// Type alias for async Result
typedef AsyncResult<T> = Future<Result<T>>;

/// Extension methods for Result type
extension ResultExtension<T> on Result<T> {
  /// Returns true if this is a success (Right)
  bool get isSuccess => isRight();

  /// Returns true if this is a failure (Left)
  bool get isFailure => isLeft();

  /// Get the success value or null
  T? get successOrNull => fold((_) => null, (r) => r);

  /// Get the error or null
  AppError? get errorOrNull => fold((l) => l, (_) => null);

  /// Get the success value or throw
  T get successOrThrow => fold(
        (error) => throw error,
        (value) => value,
      );

  /// Map the success value
  Result<R> mapSuccess<R>(R Function(T value) mapper) {
    return map(mapper);
  }

  /// Map the error
  Result<T> mapError(AppError Function(AppError error) mapper) {
    return leftMap(mapper);
  }

  /// Execute callback on success
  Result<T> onSuccess(void Function(T value) callback) {
    fold((_) {}, callback);
    return this;
  }

  /// Execute callback on failure
  Result<T> onFailure(void Function(AppError error) callback) {
    fold(callback, (_) {});
    return this;
  }

  /// Convert to a nullable value (null on failure)
  T? toNullable() => fold((_) => null, (r) => r);

  /// Get value or default (value version)
  T getOrDefault(T defaultValue) => fold((_) => defaultValue, (r) => r);

  /// Get value or compute default from function (compatible with dartz)
  T getOrCompute(T Function(AppError error) compute) => fold(compute, (r) => r);
}

/// Extension methods for AsyncResult type
extension AsyncResultExtension<T> on AsyncResult<T> {
  /// Map the success value asynchronously
  AsyncResult<R> mapSuccessAsync<R>(Future<R> Function(T value) mapper) async {
    final result = await this;
    return result.fold(
      (error) => Left(error),
      (value) async => Right(await mapper(value)),
    );
  }

  /// Execute callback on success asynchronously
  AsyncResult<T> onSuccessAsync(Future<void> Function(T value) callback) async {
    final result = await this;
    await result.fold((_) async {}, callback);
    return result;
  }

  /// Execute callback on failure asynchronously
  AsyncResult<T> onFailureAsync(Future<void> Function(AppError error) callback) async {
    final result = await this;
    await result.fold(callback, (_) async {});
    return result;
  }
}

/// Helper functions for creating Results
class Results {
  Results._();

  /// Create a success result
  static Result<T> success<T>(T value) => Right(value);

  /// Create a failure result
  static Result<T> failure<T>(AppError error) => Left(error);

  /// Create a success result from nullable value
  static Result<T> fromNullable<T>(T? value, AppError Function() onNull) {
    return value != null ? Right(value) : Left(onNull());
  }

  /// Try to execute a function and wrap result
  static Result<T> tryCatch<T>(
    T Function() fn,
    AppError Function(dynamic error, StackTrace stackTrace) onError,
  ) {
    try {
      return Right(fn());
    } catch (e, st) {
      return Left(onError(e, st));
    }
  }

  /// Try to execute an async function and wrap result
  static AsyncResult<T> tryCatchAsync<T>(
    Future<T> Function() fn,
    AppError Function(dynamic error, StackTrace stackTrace) onError,
  ) async {
    try {
      return Right(await fn());
    } catch (e, st) {
      return Left(onError(e, st));
    }
  }

  /// Combine multiple results into a single result with a list
  static Result<List<T>> combine<T>(List<Result<T>> results) {
    final values = <T>[];
    for (final result in results) {
      final error = result.errorOrNull;
      if (error != null) {
        return Left(error);
      }
      values.add(result.successOrThrow);
    }
    return Right(values);
  }

  /// Combine multiple async results into a single result with a list
  static AsyncResult<List<T>> combineAsync<T>(List<AsyncResult<T>> results) async {
    final values = <T>[];
    for (final result in results) {
      final resolved = await result;
      final error = resolved.errorOrNull;
      if (error != null) {
        return Left(error);
      }
      values.add(resolved.successOrThrow);
    }
    return Right(values);
  }
}

/// Unit type for void results
class Unit {
  const Unit._();
  static const Unit value = Unit._();
}

/// Type alias for Result with no value
typedef UnitResult = Result<Unit>;

/// Type alias for async Result with no value
typedef AsyncUnitResult = Future<UnitResult>;

/// Helper for creating unit results
UnitResult unitSuccess() => const Right(Unit.value);
UnitResult unitFailure(AppError error) => Left(error);
