import 'package:equatable/equatable.dart';
import '../../../domain/entities/user.dart';
import '../../../core/errors/failures.dart';

enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthState extends Equatable {
  final AuthStatus status;
  final User? user;
  final Failure? failure;
  final String? message;
  final bool isFirstLaunch;
  final bool isOnboardingCompleted;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.failure,
    this.message,
    this.isFirstLaunch = true,
    this.isOnboardingCompleted = false,
  });

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;
  bool get isLoading => status == AuthStatus.loading;
  bool get hasError => status == AuthStatus.error;

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    Failure? failure,
    String? message,
    bool? isFirstLaunch,
    bool? isOnboardingCompleted,
    bool clearUser = false,
    bool clearFailure = false,
    bool clearMessage = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: clearUser ? null : (user ?? this.user),
      failure: clearFailure ? null : (failure ?? this.failure),
      message: clearMessage ? null : (message ?? this.message),
      isFirstLaunch: isFirstLaunch ?? this.isFirstLaunch,
      isOnboardingCompleted: isOnboardingCompleted ?? this.isOnboardingCompleted,
    );
  }

  @override
  List<Object?> get props => [
        status,
        user,
        failure,
        message,
        isFirstLaunch,
        isOnboardingCompleted,
      ];
}

// Specific states for different auth operations
class AuthInitial extends AuthState {
  const AuthInitial() : super(status: AuthStatus.initial);
}

class AuthLoading extends AuthState {
  const AuthLoading() : super(status: AuthStatus.loading);
}

class AuthAuthenticated extends AuthState {
  const AuthAuthenticated({required User user})
      : super(status: AuthStatus.authenticated, user: user);
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated({String? message})
      : super(status: AuthStatus.unauthenticated, message: message);
}

class AuthError extends AuthState {
  const AuthError({required Failure failure, String? message})
      : super(status: AuthStatus.error, failure: failure, message: message);
}

// Login specific states
class AuthLoginLoading extends AuthState {
  const AuthLoginLoading() : super(status: AuthStatus.loading);
}

class AuthLoginSuccess extends AuthState {
  const AuthLoginSuccess({required User user})
      : super(status: AuthStatus.authenticated, user: user);
}

class AuthLoginFailure extends AuthState {
  const AuthLoginFailure({required Failure failure})
      : super(status: AuthStatus.error, failure: failure);
}

// Registration specific states
class AuthRegistrationLoading extends AuthState {
  const AuthRegistrationLoading() : super(status: AuthStatus.loading);
}

class AuthRegistrationSuccess extends AuthState {
  const AuthRegistrationSuccess({required User user, String? message})
      : super(status: AuthStatus.authenticated, user: user, message: message);
}

class AuthRegistrationFailure extends AuthState {
  const AuthRegistrationFailure({required Failure failure})
      : super(status: AuthStatus.error, failure: failure);
}

// OTP verification states
class AuthOtpVerificationLoading extends AuthState {
  const AuthOtpVerificationLoading() : super(status: AuthStatus.loading);
}

class AuthOtpVerificationSuccess extends AuthState {
  const AuthOtpVerificationSuccess({String? message})
      : super(status: AuthStatus.unauthenticated, message: message);
}

class AuthOtpVerificationFailure extends AuthState {
  const AuthOtpVerificationFailure({required Failure failure})
      : super(status: AuthStatus.error, failure: failure);
}

// OTP resend states
class AuthOtpResendLoading extends AuthState {
  const AuthOtpResendLoading() : super(status: AuthStatus.loading);
}

class AuthOtpResendSuccess extends AuthState {
  const AuthOtpResendSuccess({String? message})
      : super(status: AuthStatus.unauthenticated, message: message);
}

class AuthOtpResendFailure extends AuthState {
  const AuthOtpResendFailure({required Failure failure})
      : super(status: AuthStatus.error, failure: failure);
}

// Forgot password states
class AuthForgotPasswordLoading extends AuthState {
  const AuthForgotPasswordLoading() : super(status: AuthStatus.loading);
}

class AuthForgotPasswordSuccess extends AuthState {
  const AuthForgotPasswordSuccess({String? message})
      : super(status: AuthStatus.unauthenticated, message: message);
}

class AuthForgotPasswordFailure extends AuthState {
  const AuthForgotPasswordFailure({required Failure failure})
      : super(status: AuthStatus.error, failure: failure);
}

// Reset password states
class AuthResetPasswordLoading extends AuthState {
  const AuthResetPasswordLoading() : super(status: AuthStatus.loading);
}

class AuthResetPasswordSuccess extends AuthState {
  const AuthResetPasswordSuccess({String? message})
      : super(status: AuthStatus.unauthenticated, message: message);
}

class AuthResetPasswordFailure extends AuthState {
  const AuthResetPasswordFailure({required Failure failure})
      : super(status: AuthStatus.error, failure: failure);
}

// Profile update states
class AuthProfileUpdateLoading extends AuthState {
  const AuthProfileUpdateLoading({User? user})
      : super(status: AuthStatus.loading, user: user);
}

class AuthProfileUpdateSuccess extends AuthState {
  const AuthProfileUpdateSuccess({required User user, String? message})
      : super(status: AuthStatus.authenticated, user: user, message: message);
}

class AuthProfileUpdateFailure extends AuthState {
  const AuthProfileUpdateFailure({required Failure failure, User? user})
      : super(status: AuthStatus.error, failure: failure, user: user);
}

// Change password states
class AuthChangePasswordLoading extends AuthState {
  const AuthChangePasswordLoading({User? user})
      : super(status: AuthStatus.loading, user: user);
}

class AuthChangePasswordSuccess extends AuthState {
  const AuthChangePasswordSuccess({required User user, String? message})
      : super(status: AuthStatus.authenticated, user: user, message: message);
}

class AuthChangePasswordFailure extends AuthState {
  const AuthChangePasswordFailure({required Failure failure, User? user})
      : super(status: AuthStatus.error, failure: failure, user: user);
}

// Preferences update states
class AuthPreferencesUpdateLoading extends AuthState {
  const AuthPreferencesUpdateLoading({User? user})
      : super(status: AuthStatus.loading, user: user);
}

class AuthPreferencesUpdateSuccess extends AuthState {
  const AuthPreferencesUpdateSuccess({required User user, String? message})
      : super(status: AuthStatus.authenticated, user: user, message: message);
}

class AuthPreferencesUpdateFailure extends AuthState {
  const AuthPreferencesUpdateFailure({required Failure failure, User? user})
      : super(status: AuthStatus.error, failure: failure, user: user);
}

// Account deletion states
class AuthAccountDeletionLoading extends AuthState {
  const AuthAccountDeletionLoading({User? user})
      : super(status: AuthStatus.loading, user: user);
}

class AuthAccountDeletionSuccess extends AuthState {
  const AuthAccountDeletionSuccess({String? message})
      : super(status: AuthStatus.unauthenticated, message: message);
}

class AuthAccountDeletionFailure extends AuthState {
  const AuthAccountDeletionFailure({required Failure failure, User? user})
      : super(status: AuthStatus.error, failure: failure, user: user);
}