import 'package:logger/logger.dart' as log;

/// Application logger for Okada Platform
class AppLogger {
  static AppLogger? _instance;
  late final log.Logger _logger;
  bool _isDebugMode = false;

  AppLogger._internal() {
    _logger = log.Logger(
      printer: log.PrettyPrinter(
        methodCount: 0,
        errorMethodCount: 5,
        lineLength: 80,
        colors: true,
        printEmojis: true,
        dateTimeFormat: log.DateTimeFormat.onlyTimeAndSinceStart,
      ),
      level: log.Level.debug,
    );
  }

  /// Get singleton instance
  static AppLogger get instance {
    _instance ??= AppLogger._internal();
    return _instance!;
  }

  /// Enable or disable debug mode
  void setDebugMode(bool enabled) {
    _isDebugMode = enabled;
  }

  /// Log debug message
  void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    if (_isDebugMode) {
      _logger.d(message, error: error, stackTrace: stackTrace);
    }
  }

  /// Log info message
  void info(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.i(message, error: error, stackTrace: stackTrace);
  }

  /// Log warning message
  void warning(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.w(message, error: error, stackTrace: stackTrace);
  }

  /// Log error message
  void error(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }

  /// Log fatal message
  void fatal(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.f(message, error: error, stackTrace: stackTrace);
  }

  /// Log API request
  void logRequest(String method, String path, {Map<String, dynamic>? data}) {
    if (_isDebugMode) {
      _logger.d('→ $method $path${data != null ? '\n$data' : ''}');
    }
  }

  /// Log API response
  void logResponse(String method, String path, int statusCode,
      {dynamic data, Duration? duration}) {
    if (_isDebugMode) {
      final durationStr = duration != null ? ' (${duration.inMilliseconds}ms)' : '';
      _logger.d('← $method $path $statusCode$durationStr');
    }
  }

  /// Log API error
  void logApiError(String method, String path, dynamic error) {
    _logger.e('✗ $method $path', error: error);
  }

  /// Log navigation
  void logNavigation(String from, String to) {
    if (_isDebugMode) {
      _logger.d('🧭 Navigation: $from → $to');
    }
  }

  /// Log user action
  void logUserAction(String action, {Map<String, dynamic>? params}) {
    if (_isDebugMode) {
      _logger.d('👆 User: $action${params != null ? ' $params' : ''}');
    }
  }

  /// Log state change
  void logStateChange(String state, {dynamic oldValue, dynamic newValue}) {
    if (_isDebugMode) {
      _logger.d('📊 State: $state changed from $oldValue to $newValue');
    }
  }

  /// Log cache operation
  void logCache(String operation, String key, {bool hit = false}) {
    if (_isDebugMode) {
      final icon = hit ? '✓' : '✗';
      _logger.d('💾 Cache $operation: $key $icon');
    }
  }

  /// Log WebSocket event
  void logWebSocket(String event, {dynamic data}) {
    if (_isDebugMode) {
      _logger.d('🔌 WS: $event${data != null ? ' $data' : ''}');
    }
  }

  /// Log payment event
  void logPayment(String event, {String? transactionId, int? amount}) {
    _logger.i('💳 Payment: $event${transactionId != null ? ' [$transactionId]' : ''}${amount != null ? ' $amount FCFA' : ''}');
  }

  /// Log location update
  void logLocation(double lat, double lng, {String? source}) {
    if (_isDebugMode) {
      _logger.d('📍 Location: $lat, $lng${source != null ? ' ($source)' : ''}');
    }
  }
}

/// Global logger instance
final logger = AppLogger.instance;
