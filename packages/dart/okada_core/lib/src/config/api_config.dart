import 'environment.dart';

/// API configuration for different environments
class ApiConfig {
  final Environment environment;

  const ApiConfig({required this.environment});

  /// Base URL for the API
  String get baseUrl {
    switch (environment) {
      case Environment.dev:
        return 'http://localhost:8000/api/v1';
      case Environment.staging:
        return 'https://staging-api.okadaplatform.com/api/v1';
      case Environment.prod:
        return 'https://api.okadaplatform.com/api/v1';
      case Environment.test:
        return 'http://localhost:8000/api/v1';
    }
  }

  /// WebSocket URL for real-time features
  String get wsUrl {
    switch (environment) {
      case Environment.dev:
        return 'ws://localhost:8000/ws';
      case Environment.staging:
        return 'wss://staging-api.okadaplatform.com/ws';
      case Environment.prod:
        return 'wss://api.okadaplatform.com/ws';
      case Environment.test:
        return 'ws://localhost:8000/ws';
    }
  }

  /// CDN URL for static assets
  String get cdnUrl {
    switch (environment) {
      case Environment.dev:
        return 'http://localhost:8000/static';
      case Environment.staging:
        return 'https://staging-cdn.okadaplatform.com';
      case Environment.prod:
        return 'https://cdn.okadaplatform.com';
      case Environment.test:
        return 'http://localhost:8000/static';
    }
  }

  /// Connection timeout in milliseconds
  int get connectTimeout {
    switch (environment) {
      case Environment.dev:
      case Environment.test:
        return 30000; // 30 seconds for dev/test
      case Environment.staging:
      case Environment.prod:
        return 15000; // 15 seconds for staging/prod
    }
  }

  /// Receive timeout in milliseconds
  int get receiveTimeout {
    switch (environment) {
      case Environment.dev:
      case Environment.test:
        return 30000;
      case Environment.staging:
      case Environment.prod:
        return 15000;
    }
  }

  /// Send timeout in milliseconds
  int get sendTimeout {
    switch (environment) {
      case Environment.dev:
      case Environment.test:
        return 30000;
      case Environment.staging:
      case Environment.prod:
        return 15000;
    }
  }

  /// Whether to enable request logging
  bool get enableLogging => environment.isDebugMode;

  /// Whether to enable response caching
  bool get enableCaching => true;

  /// Cache duration in seconds
  int get cacheDuration {
    switch (environment) {
      case Environment.dev:
      case Environment.test:
        return 60; // 1 minute for dev/test
      case Environment.staging:
        return 300; // 5 minutes for staging
      case Environment.prod:
        return 600; // 10 minutes for prod
    }
  }

  /// Maximum retry attempts for failed requests
  int get maxRetries => 3;

  /// Retry delay in milliseconds
  int get retryDelay => 1000;

  /// Google Maps API Key (should be overridden from env)
  String get googleMapsApiKey {
    // This should be loaded from environment variables in production
    switch (environment) {
      case Environment.dev:
      case Environment.test:
        return 'DEV_GOOGLE_MAPS_API_KEY';
      case Environment.staging:
        return 'STAGING_GOOGLE_MAPS_API_KEY';
      case Environment.prod:
        return 'PROD_GOOGLE_MAPS_API_KEY';
    }
  }
}
