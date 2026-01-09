import 'dart:async';
import 'package:dartz/dartz.dart';
import '../../core/errors/exceptions.dart';
import '../../core/errors/failures.dart';
import '../../core/network/dio_client.dart';
import '../../core/network/network_info.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import '../datasources/auth_remote_datasource.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final AuthLocalDataSource _localDataSource;
  final NetworkInfo _networkInfo;
  final DioClient _dioClient;

  UserModel? _currentUser;
  final StreamController<User?> _userStreamController = StreamController<User?>.broadcast();

  AuthRepositoryImpl(
    this._remoteDataSource,
    this._localDataSource,
    this._networkInfo,
    this._dioClient,
  ) {
    _initializeUser();
  }

  Future<void> _initializeUser() async {
    try {
      final cachedUser = await _localDataSource.getCachedUser();
      if (cachedUser != null) {
        _currentUser = cachedUser;
        _userStreamController.add(cachedUser.toEntity());

        // Load tokens for API calls
        final accessToken = await _localDataSource.getAccessToken();
        final refreshToken = await _localDataSource.getRefreshToken();
        if (accessToken != null && refreshToken != null) {
          await _dioClient.setAuthTokens(accessToken, refreshToken);
        }
      }
    } catch (e) {
      // Ignore errors during initialization
    }
  }

  @override
  Future<Either<Failure, User>> login({
    required String email,
    required String password,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.login(
          email: email,
          password: password,
        );

        final accessToken = result['accessToken'] as String;
        final refreshToken = result['refreshToken'] as String;
        final userData = result['user'] as Map<String, dynamic>;

        final user = UserModel.fromJson(userData);

        // Save tokens and user data
        await _localDataSource.saveTokens(accessToken, refreshToken);
        await _localDataSource.cacheUser(user);
        await _dioClient.setAuthTokens(accessToken, refreshToken);

        _currentUser = user;
        _userStreamController.add(user.toEntity());

        return Right(user.toEntity());
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message, code: e.code, details: e.details));
    } on ValidationException catch (e) {
      return Left(ValidationFailure(
        e.message,
        code: e.code,
        details: e.details,
        fieldErrors: e.fieldErrors,
      ));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Login failed: $e'));
    }
  }

  @override
  Future<Either<Failure, User>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.register(
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        );

        final accessToken = result['accessToken'] as String?;
        final refreshToken = result['refreshToken'] as String?;
        final userData = result['user'] as Map<String, dynamic>;

        final user = UserModel.fromJson(userData);

        // If tokens are provided (auto-login after registration)
        if (accessToken != null && refreshToken != null) {
          await _localDataSource.saveTokens(accessToken, refreshToken);
          await _dioClient.setAuthTokens(accessToken, refreshToken);
        }

        await _localDataSource.cacheUser(user);

        _currentUser = user;
        _userStreamController.add(user.toEntity());

        return Right(user.toEntity());
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(
        e.message,
        code: e.code,
        details: e.details,
        fieldErrors: e.fieldErrors,
      ));
    } on ConflictException catch (e) {
      return Left(ConflictFailure(e.message, code: e.code, details: e.details));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Registration failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.verifyOtp(
          email: email,
          otp: otp,
        );
        return Right(result);
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(
        e.message,
        code: e.code,
        details: e.details,
        fieldErrors: e.fieldErrors,
      ));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('OTP verification failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> resendOtp({
    required String email,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.resendOtp(email: email);
        return Right(result);
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Resend OTP failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> forgotPassword({
    required String email,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.forgotPassword(email: email);
        return Right(result);
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Forgot password failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.resetPassword(
          email: email,
          otp: otp,
          newPassword: newPassword,
        );
        return Right(result);
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(
        e.message,
        code: e.code,
        details: e.details,
        fieldErrors: e.fieldErrors,
      ));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Reset password failed: $e'));
    }
  }

  @override
  Future<Either<Failure, User>> refreshToken() async {
    try {
      final refreshToken = await _localDataSource.getRefreshToken();
      if (refreshToken == null) {
        return const Left(UnauthorizedFailure('No refresh token available'));
      }

      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.refreshToken(
          refreshToken: refreshToken,
        );

        final accessToken = result['accessToken'] as String;
        final newRefreshToken = result['refreshToken'] as String;
        final userData = result['user'] as Map<String, dynamic>;

        final user = UserModel.fromJson(userData);

        await _localDataSource.saveTokens(accessToken, newRefreshToken);
        await _localDataSource.cacheUser(user);
        await _dioClient.setAuthTokens(accessToken, newRefreshToken);

        _currentUser = user;
        _userStreamController.add(user.toEntity());

        return Right(user.toEntity());
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on UnauthorizedException catch (e) {
      // Clear invalid tokens
      await _clearUserData();
      return Left(UnauthorizedFailure(e.message, code: e.code, details: e.details));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Token refresh failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> logout() async {
    try {
      if (await _networkInfo.isConnected) {
        try {
          await _remoteDataSource.logout();
        } catch (e) {
          // Continue with local logout even if remote logout fails
        }
      }

      await _clearUserData();
      return const Right(true);
    } catch (e) {
      return Left(ServerFailure('Logout failed: $e'));
    }
  }

  @override
  Future<Either<Failure, User?>> getCurrentUser() async {
    try {
      if (_currentUser != null) {
        return Right(_currentUser!.toEntity());
      }

      final cachedUser = await _localDataSource.getCachedUser();
      if (cachedUser != null) {
        _currentUser = cachedUser;
        return Right(cachedUser.toEntity());
      }

      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(CacheFailure('Failed to get current user: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> updateProfile({
    required String firstName,
    required String lastName,
    required String phoneNumber,
    String? profileImageUrl,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final updatedUser = await _remoteDataSource.updateProfile(
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          profileImageUrl: profileImageUrl,
        );

        await _localDataSource.cacheUser(updatedUser);
        _currentUser = updatedUser;
        _userStreamController.add(updatedUser.toEntity());

        return const Right(true);
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(
        e.message,
        code: e.code,
        details: e.details,
        fieldErrors: e.fieldErrors,
      ));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Update profile failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.changePassword(
          currentPassword: currentPassword,
          newPassword: newPassword,
        );
        return Right(result);
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on ValidationException catch (e) {
      return Left(ValidationFailure(
        e.message,
        code: e.code,
        details: e.details,
        fieldErrors: e.fieldErrors,
      ));
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message, code: e.code, details: e.details));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Change password failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> updatePreferences(UserPreferences preferences) async {
    try {
      if (await _networkInfo.isConnected) {
        final preferencesModel = UserPreferencesModel.fromEntity(preferences);
        final result = await _remoteDataSource.updatePreferences(preferencesModel);

        if (result && _currentUser != null) {
          final updatedUser = UserModel.fromEntity(
            _currentUser!.toEntity().copyWith(preferences: preferences),
          );
          await _localDataSource.cacheUser(updatedUser);
          _currentUser = updatedUser;
          _userStreamController.add(updatedUser.toEntity());
        }

        return Right(result);
      } else {
        // Update locally when offline
        if (_currentUser != null) {
          final updatedUser = UserModel.fromEntity(
            _currentUser!.toEntity().copyWith(preferences: preferences),
          );
          await _localDataSource.cacheUser(updatedUser);
          _currentUser = updatedUser;
          _userStreamController.add(updatedUser.toEntity());
        }
        return const Right(true);
      }
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Update preferences failed: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> deleteAccount() async {
    try {
      if (await _networkInfo.isConnected) {
        final result = await _remoteDataSource.deleteAccount();
        if (result) {
          await _clearUserData();
        }
        return Right(result);
      } else {
        return const Left(NetworkFailure('No internet connection'));
      }
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message, code: e.code, details: e.details));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } on AppException catch (e) {
      return Left(ServerFailure(e.message, code: e.code, details: e.details));
    } catch (e) {
      return Left(ServerFailure('Delete account failed: $e'));
    }
  }

  @override
  Stream<User?> get userStream => _userStreamController.stream;

  @override
  bool get isLoggedIn => _currentUser != null;

  Future<void> _clearUserData() async {
    await _localDataSource.clearTokens();
    await _localDataSource.clearCachedUser();
    await _dioClient.clearAuth();
    _currentUser = null;
    _userStreamController.add(null);
  }

  void dispose() {
    _userStreamController.close();
  }
}