import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/entities/user.dart';
import '../../../domain/repositories/auth_repository.dart';
import '../../../core/errors/failures.dart';
import '../../../data/datasources/auth_local_datasource.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;
  final AuthLocalDataSource _localDataSource;
  StreamSubscription<User?>? _userSubscription;

  AuthBloc({
    required AuthRepository authRepository,
    required AuthLocalDataSource localDataSource,
  })  : _authRepository = authRepository,
        _localDataSource = localDataSource,
        super(const AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthRegisterRequested>(_onAuthRegisterRequested);
    on<AuthVerifyOtpRequested>(_onAuthVerifyOtpRequested);
    on<AuthResendOtpRequested>(_onAuthResendOtpRequested);
    on<AuthForgotPasswordRequested>(_onAuthForgotPasswordRequested);
    on<AuthResetPasswordRequested>(_onAuthResetPasswordRequested);
    on<AuthRefreshTokenRequested>(_onAuthRefreshTokenRequested);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
    on<AuthUpdateProfileRequested>(_onAuthUpdateProfileRequested);
    on<AuthChangePasswordRequested>(_onAuthChangePasswordRequested);
    on<AuthUpdatePreferencesRequested>(_onAuthUpdatePreferencesRequested);
    on<AuthDeleteAccountRequested>(_onAuthDeleteAccountRequested);
    on<AuthUserChanged>(_onAuthUserChanged);

    _userSubscription = _authRepository.userStream.listen(
      (user) => add(AuthUserChanged(user: user)),
    );
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      // Check onboarding status
      final isOnboardingCompleted = await _localDataSource.getOnboardingStatus();

      // Get current user
      final result = await _authRepository.getCurrentUser();

      result.fold(
        (failure) => emit(AuthError(failure: failure)),
        (user) {
          if (user != null) {
            emit(AuthAuthenticated(user: user).copyWith(
              isOnboardingCompleted: isOnboardingCompleted,
              isFirstLaunch: false,
            ));
          } else {
            emit(const AuthUnauthenticated().copyWith(
              isOnboardingCompleted: isOnboardingCompleted,
              isFirstLaunch: !isOnboardingCompleted,
            ));
          }
        },
      );
    } catch (e) {
      emit(AuthError(failure: ServerFailure('Authentication check failed: $e')));
    }
  }

  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoginLoading());

    final result = await _authRepository.login(
      email: event.email,
      password: event.password,
    );

    result.fold(
      (failure) => emit(AuthLoginFailure(failure: failure)),
      (user) => emit(AuthLoginSuccess(user: user)),
    );
  }

  Future<void> _onAuthRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthRegistrationLoading());

    final result = await _authRepository.register(
      email: event.email,
      password: event.password,
      firstName: event.firstName,
      lastName: event.lastName,
      phoneNumber: event.phoneNumber,
    );

    result.fold(
      (failure) => emit(AuthRegistrationFailure(failure: failure)),
      (user) {
        if (user.isEmailVerified) {
          emit(AuthRegistrationSuccess(
            user: user,
            message: 'Registration successful! Welcome to Okada.',
          ));
        } else {
          emit(const AuthRegistrationSuccess(
            user: User(
              id: 'temp',
              email: '',
              firstName: '',
              lastName: '',
              phoneNumber: '',
              isEmailVerified: false,
              isPhoneVerified: false,
              createdAt: null,
              preferences: UserPreferences(),
              addresses: [],
              paymentMethods: [],
            ),
            message: 'Registration successful! Please verify your email.',
          ));
        }
      },
    );
  }

  Future<void> _onAuthVerifyOtpRequested(
    AuthVerifyOtpRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthOtpVerificationLoading());

    final result = await _authRepository.verifyOtp(
      email: event.email,
      otp: event.otp,
    );

    result.fold(
      (failure) => emit(AuthOtpVerificationFailure(failure: failure)),
      (success) {
        if (success) {
          emit(const AuthOtpVerificationSuccess(
            message: 'Email verified successfully! You can now login.',
          ));
        } else {
          emit(AuthOtpVerificationFailure(
            failure: const ValidationFailure('Invalid OTP'),
          ));
        }
      },
    );
  }

  Future<void> _onAuthResendOtpRequested(
    AuthResendOtpRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthOtpResendLoading());

    final result = await _authRepository.resendOtp(email: event.email);

    result.fold(
      (failure) => emit(AuthOtpResendFailure(failure: failure)),
      (success) {
        if (success) {
          emit(const AuthOtpResendSuccess(
            message: 'OTP has been resent to your email.',
          ));
        } else {
          emit(AuthOtpResendFailure(
            failure: const ServerFailure('Failed to resend OTP'),
          ));
        }
      },
    );
  }

  Future<void> _onAuthForgotPasswordRequested(
    AuthForgotPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthForgotPasswordLoading());

    final result = await _authRepository.forgotPassword(email: event.email);

    result.fold(
      (failure) => emit(AuthForgotPasswordFailure(failure: failure)),
      (success) {
        if (success) {
          emit(const AuthForgotPasswordSuccess(
            message: 'Password reset instructions sent to your email.',
          ));
        } else {
          emit(AuthForgotPasswordFailure(
            failure: const ServerFailure('Failed to send reset instructions'),
          ));
        }
      },
    );
  }

  Future<void> _onAuthResetPasswordRequested(
    AuthResetPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthResetPasswordLoading());

    final result = await _authRepository.resetPassword(
      email: event.email,
      otp: event.otp,
      newPassword: event.newPassword,
    );

    result.fold(
      (failure) => emit(AuthResetPasswordFailure(failure: failure)),
      (success) {
        if (success) {
          emit(const AuthResetPasswordSuccess(
            message: 'Password reset successfully! You can now login.',
          ));
        } else {
          emit(AuthResetPasswordFailure(
            failure: const ServerFailure('Failed to reset password'),
          ));
        }
      },
    );
  }

  Future<void> _onAuthRefreshTokenRequested(
    AuthRefreshTokenRequested event,
    Emitter<AuthState> emit,
  ) async {
    final result = await _authRepository.refreshToken();

    result.fold(
      (failure) {
        // Token refresh failed, user needs to login again
        emit(const AuthUnauthenticated(
          message: 'Session expired. Please login again.',
        ));
      },
      (user) => emit(AuthAuthenticated(user: user)),
    );
  }

  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    final result = await _authRepository.logout();

    result.fold(
      (failure) => emit(AuthError(failure: failure)),
      (_) => emit(const AuthUnauthenticated(message: 'Logged out successfully')),
    );
  }

  Future<void> _onAuthUpdateProfileRequested(
    AuthUpdateProfileRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthProfileUpdateLoading(user: state.user));

    final result = await _authRepository.updateProfile(
      firstName: event.firstName,
      lastName: event.lastName,
      phoneNumber: event.phoneNumber,
      profileImageUrl: event.profileImageUrl,
    );

    result.fold(
      (failure) => emit(AuthProfileUpdateFailure(
        failure: failure,
        user: state.user,
      )),
      (_) {
        // Get updated user from repository
        _authRepository.getCurrentUser().then((userResult) {
          userResult.fold(
            (failure) => emit(AuthProfileUpdateFailure(
              failure: failure,
              user: state.user,
            )),
            (user) => emit(AuthProfileUpdateSuccess(
              user: user!,
              message: 'Profile updated successfully',
            )),
          );
        });
      },
    );
  }

  Future<void> _onAuthChangePasswordRequested(
    AuthChangePasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthChangePasswordLoading(user: state.user));

    final result = await _authRepository.changePassword(
      currentPassword: event.currentPassword,
      newPassword: event.newPassword,
    );

    result.fold(
      (failure) => emit(AuthChangePasswordFailure(
        failure: failure,
        user: state.user,
      )),
      (_) => emit(AuthChangePasswordSuccess(
        user: state.user!,
        message: 'Password changed successfully',
      )),
    );
  }

  Future<void> _onAuthUpdatePreferencesRequested(
    AuthUpdatePreferencesRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthPreferencesUpdateLoading(user: state.user));

    final result = await _authRepository.updatePreferences(event.preferences);

    result.fold(
      (failure) => emit(AuthPreferencesUpdateFailure(
        failure: failure,
        user: state.user,
      )),
      (_) {
        // Get updated user from repository
        _authRepository.getCurrentUser().then((userResult) {
          userResult.fold(
            (failure) => emit(AuthPreferencesUpdateFailure(
              failure: failure,
              user: state.user,
            )),
            (user) => emit(AuthPreferencesUpdateSuccess(
              user: user!,
              message: 'Preferences updated successfully',
            )),
          );
        });
      },
    );
  }

  Future<void> _onAuthDeleteAccountRequested(
    AuthDeleteAccountRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthAccountDeletionLoading(user: state.user));

    final result = await _authRepository.deleteAccount();

    result.fold(
      (failure) => emit(AuthAccountDeletionFailure(
        failure: failure,
        user: state.user,
      )),
      (_) => emit(const AuthAccountDeletionSuccess(
        message: 'Account deleted successfully',
      )),
    );
  }

  void _onAuthUserChanged(
    AuthUserChanged event,
    Emitter<AuthState> emit,
  ) {
    if (event.user != null) {
      emit(AuthAuthenticated(user: event.user!));
    } else {
      emit(const AuthUnauthenticated());
    }
  }

  @override
  Future<void> close() {
    _userSubscription?.cancel();
    return super.close();
  }
}