import 'package:get_it/get_it.dart';

import '../utils/logger_service.dart';
import '../utils/storage_service.dart';
import '../utils/preferences_service.dart';
import '../config/environment.dart' as env;
import '../config/app_config.dart';

/// Global service locator instance
final GetIt getIt = GetIt.instance;

/// Environment names for dependency injection
abstract class Env {
  static const String dev = 'dev';
  static const String staging = 'staging';
  static const String prod = 'prod';
  static const String test = 'test';
}

/// Configure dependencies for the application
/// 
/// This should be called once at app startup before any services are used.
/// The [environment] parameter determines which configuration to use.
Future<void> configureDependencies({
  required String environment,
}) async {
  // Register environment
  getIt.registerSingleton<env.Environment>(
    env.Environment.fromString(environment),
  );

  // Register app config
  getIt.registerSingleton<AppConfig>(
    AppConfig(environment: getIt<env.Environment>()),
  );

  // Register logger
  getIt.registerSingleton<LoggerService>(
    LoggerService(environment: getIt<env.Environment>()),
  );

  // Register storage services
  final storageService = StorageService();
  await storageService.init();
  getIt.registerSingleton<StorageService>(storageService);

  final preferencesService = PreferencesService();
  await preferencesService.init();
  getIt.registerSingleton<PreferencesService>(preferencesService);
}

/// Reset all dependencies (useful for testing)
Future<void> resetDependencies() async {
  await getIt.reset();
}

/// Check if a dependency is registered
bool isRegistered<T extends Object>() {
  return getIt.isRegistered<T>();
}

/// Get a registered dependency
T get<T extends Object>() {
  return getIt<T>();
}

/// Register a singleton dependency
void registerSingleton<T extends Object>(T instance) {
  if (!getIt.isRegistered<T>()) {
    getIt.registerSingleton<T>(instance);
  }
}

/// Register a lazy singleton dependency
void registerLazySingleton<T extends Object>(T Function() factory) {
  if (!getIt.isRegistered<T>()) {
    getIt.registerLazySingleton<T>(factory);
  }
}

/// Register a factory dependency
void registerFactory<T extends Object>(T Function() factory) {
  if (!getIt.isRegistered<T>()) {
    getIt.registerFactory<T>(factory);
  }
}
