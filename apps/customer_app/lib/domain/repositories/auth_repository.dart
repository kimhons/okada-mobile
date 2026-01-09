import 'package:dartz/dartz.dart';
import '../entities/user.dart';
import '../../core/errors/failures.dart';

abstract class AuthRepository {
  Future<Either<Failure, User>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, User>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  });

  Future<Either<Failure, bool>> verifyOtp({
    required String email,
    required String otp,
  });

  Future<Either<Failure, bool>> resendOtp({
    required String email,
  });

  Future<Either<Failure, bool>> forgotPassword({
    required String email,
  });

  Future<Either<Failure, bool>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  });

  Future<Either<Failure, User>> refreshToken();

  Future<Either<Failure, bool>> logout();

  Future<Either<Failure, User?>> getCurrentUser();

  Future<Either<Failure, bool>> updateProfile({
    required String firstName,
    required String lastName,
    required String phoneNumber,
    String? profileImageUrl,
  });

  Future<Either<Failure, bool>> changePassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<Either<Failure, bool>> updatePreferences(UserPreferences preferences);

  Future<Either<Failure, bool>> deleteAccount();

  Stream<User?> get userStream;

  bool get isLoggedIn;
}