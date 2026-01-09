/// Represents the application environment
enum Environment {
  /// Development environment - local testing
  dev,
  
  /// Staging environment - pre-production testing
  staging,
  
  /// Production environment - live users
  prod,
  
  /// Test environment - automated testing
  test;

  /// Create an Environment from a string value
  static Environment fromString(String value) {
    switch (value.toLowerCase()) {
      case 'dev':
      case 'development':
        return Environment.dev;
      case 'staging':
      case 'stage':
        return Environment.staging;
      case 'prod':
      case 'production':
        return Environment.prod;
      case 'test':
      case 'testing':
        return Environment.test;
      default:
        return Environment.dev;
    }
  }

  /// Whether this is a development environment
  bool get isDev => this == Environment.dev;

  /// Whether this is a staging environment
  bool get isStaging => this == Environment.staging;

  /// Whether this is a production environment
  bool get isProd => this == Environment.prod;

  /// Whether this is a test environment
  bool get isTest => this == Environment.test;

  /// Whether debug features should be enabled
  bool get isDebugMode => this == Environment.dev || this == Environment.test;

  /// Whether analytics should be enabled
  bool get isAnalyticsEnabled => this == Environment.prod || this == Environment.staging;

  /// Whether crash reporting should be enabled
  bool get isCrashReportingEnabled => this == Environment.prod || this == Environment.staging;

  /// Get the environment name as a string
  String get name {
    switch (this) {
      case Environment.dev:
        return 'Development';
      case Environment.staging:
        return 'Staging';
      case Environment.prod:
        return 'Production';
      case Environment.test:
        return 'Test';
    }
  }
}
