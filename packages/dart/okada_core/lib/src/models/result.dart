import 'failure.dart';

/// Result type for functional error handling
/// Represents either a success value or a failure
sealed class Result<T> {
  const Result();

  /// Create a success result
  factory Result.success(T value) = Success<T>;

  /// Create a failure result
  factory Result.failure(Failure failure) = Failure<T>;

  /// Check if result is success
  bool get isSuccess => this is Success<T>;

  /// Check if result is failure
  bool get isFailure => this is Failure<T>;

  /// Get value or null
  T? get valueOrNull => switch (this) {
        Success<T>(:final value) => value,
        Failure<T>() => null,
      };

  /// Get failure or null
  Failure? get failureOrNull => switch (this) {
        Success<T>() => null,
        Failure<T>(:final failure) => failure,
      };

  /// Map success value
  Result<R> map<R>(R Function(T value) mapper) => switch (this) {
        Success<T>(:final value) => Result.success(mapper(value)),
        Failure<T>(:final failure) => Result.failure(failure),
      };

  /// FlatMap success value
  Result<R> flatMap<R>(Result<R> Function(T value) mapper) => switch (this) {
        Success<T>(:final value) => mapper(value),
        Failure<T>(:final failure) => Result.failure(failure),
      };

  /// Fold result
  R fold<R>({
    required R Function(T value) onSuccess,
    required R Function(Failure failure) onFailure,
  }) =>
      switch (this) {
        Success<T>(:final value) => onSuccess(value),
        Failure<T>(:final failure) => onFailure(failure),
      };

  /// Get value or default
  T getOrElse(T defaultValue) => switch (this) {
        Success<T>(:final value) => value,
        Failure<T>() => defaultValue,
      };

  /// Get value or compute default
  T getOrCompute(T Function() compute) => switch (this) {
        Success<T>(:final value) => value,
        Failure<T>() => compute(),
      };

  /// Execute side effect on success
  Result<T> onSuccess(void Function(T value) action) {
    if (this case Success<T>(:final value)) {
      action(value);
    }
    return this;
  }

  /// Execute side effect on failure
  Result<T> onFailure(void Function(Failure failure) action) {
    if (this case Failure<T>(:final failure)) {
      action(failure);
    }
    return this;
  }

  /// Recover from failure
  Result<T> recover(T Function(Failure failure) recovery) => switch (this) {
        Success<T>() => this,
        Failure<T>(:final failure) => Result.success(recovery(failure)),
      };

  /// Recover from failure with another result
  Result<T> recoverWith(Result<T> Function(Failure failure) recovery) =>
      switch (this) {
        Success<T>() => this,
        Failure<T>(:final failure) => recovery(failure),
      };
}

/// Success result
final class Success<T> extends Result<T> {
  final T value;

  const Success(this.value);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Success<T> &&
          runtimeType == other.runtimeType &&
          value == other.value;

  @override
  int get hashCode => value.hashCode;

  @override
  String toString() => 'Success($value)';
}

/// Failure result (extends Result to be used as a result type)
final class Failure<T> extends Result<T> {
  final FailureReason failure;

  const Failure(this.failure);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Failure<T> &&
          runtimeType == other.runtimeType &&
          failure == other.failure;

  @override
  int get hashCode => failure.hashCode;

  @override
  String toString() => 'Failure($failure)';
}

/// Extension to convert nullable to Result
extension NullableToResult<T> on T? {
  Result<T> toResult({String? message}) {
    if (this != null) {
      return Result.success(this as T);
    }
    return Result.failure(FailureReason.unknown(message ?? 'Value is null'));
  }
}

/// Extension to convert Future to Result
extension FutureToResult<T> on Future<T> {
  Future<Result<T>> toResult() async {
    try {
      final value = await this;
      return Result.success(value);
    } catch (e, s) {
      return Result.failure(FailureReason.unknown(e.toString()));
    }
  }
}
