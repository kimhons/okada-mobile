/// Okada Platform - Core Package
/// 
/// This package contains shared business logic, utilities, constants,
/// dependency injection setup, and error handling for the Okada Platform.
library okada_core;

// Dependency Injection
export 'src/di/injection.dart';

// Configuration
export 'src/config/environment.dart';
export 'src/config/api_config.dart';
export 'src/config/app_config.dart';

// Errors
export 'src/errors/app_error.dart';
export 'src/errors/network_error.dart';
export 'src/errors/auth_error.dart';
export 'src/errors/payment_error.dart';
export 'src/errors/validation_error.dart';
export 'src/errors/server_error.dart';
export 'src/errors/error_handler.dart';

// Utils
export 'src/utils/result.dart';
export 'src/utils/logger_service.dart';
export 'src/utils/storage_service.dart';
export 'src/utils/preferences_service.dart';
export 'src/utils/validators.dart';

// Constants
export 'src/constants/app_constants.dart';
export 'src/constants/api_endpoints.dart';
export 'src/constants/storage_keys.dart';
