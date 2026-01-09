import 'package:equatable/equatable.dart';
import '../../../domain/entities/user.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  const AuthLoginRequested({
    required this.email,
    required this.password,
  });

  @override
  List<Object> get props => [email, password];
}

class AuthRegisterRequested extends AuthEvent {
  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final String phoneNumber;

  const AuthRegisterRequested({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
  });

  @override
  List<Object> get props => [email, password, firstName, lastName, phoneNumber];
}

class AuthVerifyOtpRequested extends AuthEvent {
  final String email;
  final String otp;

  const AuthVerifyOtpRequested({
    required this.email,
    required this.otp,
  });

  @override
  List<Object> get props => [email, otp];
}

class AuthResendOtpRequested extends AuthEvent {
  final String email;

  const AuthResendOtpRequested({required this.email});

  @override
  List<Object> get props => [email];
}

class AuthForgotPasswordRequested extends AuthEvent {
  final String email;

  const AuthForgotPasswordRequested({required this.email});

  @override
  List<Object> get props => [email];
}

class AuthResetPasswordRequested extends AuthEvent {
  final String email;
  final String otp;
  final String newPassword;

  const AuthResetPasswordRequested({
    required this.email,
    required this.otp,
    required this.newPassword,
  });

  @override
  List<Object> get props => [email, otp, newPassword];
}

class AuthRefreshTokenRequested extends AuthEvent {}

class AuthLogoutRequested extends AuthEvent {}

class AuthUpdateProfileRequested extends AuthEvent {
  final String firstName;
  final String lastName;
  final String phoneNumber;
  final String? profileImageUrl;

  const AuthUpdateProfileRequested({
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    this.profileImageUrl,
  });

  @override
  List<Object?> get props => [firstName, lastName, phoneNumber, profileImageUrl];
}

class AuthChangePasswordRequested extends AuthEvent {
  final String currentPassword;
  final String newPassword;

  const AuthChangePasswordRequested({
    required this.currentPassword,
    required this.newPassword,
  });

  @override
  List<Object> get props => [currentPassword, newPassword];
}

class AuthUpdatePreferencesRequested extends AuthEvent {
  final UserPreferences preferences;

  const AuthUpdatePreferencesRequested({required this.preferences});

  @override
  List<Object> get props => [preferences];
}

class AuthDeleteAccountRequested extends AuthEvent {}

class AuthUserChanged extends AuthEvent {
  final User? user;

  const AuthUserChanged({this.user});

  @override
  List<Object?> get props => [user];
}