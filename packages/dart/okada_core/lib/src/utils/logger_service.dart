import 'package:logger/logger.dart';
import '../config/environment.dart';

/// Centralized logging service for the application
class LoggerService {
  final Environment environment;
  late final Logger _logger;

  LoggerService({required this.environment}) {
    _logger = Logger(
      printer: PrettyPrinter(
        methodCount: environment.isDebugMode ? 2 : 0,
        errorMethodCount: 8,
        lineLength: 120,
        colors: true,
        printEmojis: true,
        dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
      ),
      level: _getLogLevel(),
    );
  }

  Level _getLogLevel() {
    switch (environment) {
      case Environment.dev:
      case Environment.test:
        return Level.trace;
      case Environment.staging:
        return Level.debug;
      case Environment.prod:
        return Level.warning;
    }
  }

  /// Log a trace message (most verbose)
  void trace(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.t(message, error: error, stackTrace: stackTrace);
  }

  /// Log a debug message
  void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.d(message, error: error, stackTrace: stackTrace);
  }

  /// Log an info message
  void info(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.i(message, error: error, stackTrace: stackTrace);
  }

  /// Log a warning message
  void warning(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.w(message, error: error, stackTrace: stackTrace);
  }

  /// Log an error message
  void error(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }

  /// Log a fatal error message
  void fatal(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.f(message, error: error, stackTrace: stackTrace);
  }

  /// Log an API request
  void logRequest({
    required String method,
    required String url,
    Map<String, dynamic>? headers,
    dynamic body,
  }) {
    if (!environment.isDebugMode) return;
    
    debug('→ $method $url');
    if (headers != null && headers.isNotEmpty) {
      trace('Headers: $headers');
    }
    if (body != null) {
      trace('Body: $body');
    }
  }

  /// Log an API response
  void logResponse({
    required String method,
    required String url,
    required int statusCode,
    dynamic body,
    Duration? duration,
  }) {
    if (!environment.isDebugMode) return;
    
    final durationStr = duration != null ? ' (${duration.inMilliseconds}ms)' : '';
    if (statusCode >= 200 && statusCode < 300) {
      debug('← $statusCode $method $url$durationStr');
    } else {
      warning('← $statusCode $method $url$durationStr');
    }
    if (body != null) {
      trace('Response: $body');
    }
  }

  /// Log a user action for analytics
  void logUserAction(String action, [Map<String, dynamic>? params]) {
    info('User Action: $action${params != null ? ' - $params' : ''}');
  }

  /// Log a screen view for analytics
  void logScreenView(String screenName, [Map<String, dynamic>? params]) {
    info('Screen View: $screenName${params != null ? ' - $params' : ''}');
  }

  /// Log a performance metric
  void logPerformance(String metric, Duration duration, [Map<String, dynamic>? params]) {
    debug('Performance: $metric - ${duration.inMilliseconds}ms${params != null ? ' - $params' : ''}');
  }
}

/// Global logger instance for convenience
/// Should be initialized after dependency injection is configured
LoggerService? _globalLogger;

LoggerService get logger {
  if (_globalLogger == null) {
    throw StateError('Logger not initialized. Call initGlobalLogger() first.');
  }
  return _globalLogger!;
}

void initGlobalLogger(LoggerService loggerService) {
  _globalLogger = loggerService;
}
