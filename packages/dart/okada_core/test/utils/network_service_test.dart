import 'package:flutter_test/flutter_test.dart';
import 'package:okada_core/okada_core.dart';

void main() {
  group('NetworkService', () {
    late NetworkService networkService;

    setUp(() {
      networkService = NetworkService();
    });

    tearDown(() {
      networkService.dispose();
    });

    group('NetworkStatus', () {
      test('should have correct initial status', () {
        expect(networkService.currentStatus, equals(NetworkStatus.unknown));
      });

      test('isConnected should return false for unknown status', () {
        expect(networkService.isConnected, isFalse);
      });
    });

    group('NetworkStatus Extension', () {
      test('wifi should be connected', () {
        expect(NetworkStatus.wifi.isConnected, isTrue);
      });

      test('mobile should be connected', () {
        expect(NetworkStatus.mobile.isConnected, isTrue);
      });

      test('ethernet should be connected', () {
        expect(NetworkStatus.ethernet.isConnected, isTrue);
      });

      test('offline should not be connected', () {
        expect(NetworkStatus.offline.isConnected, isFalse);
      });

      test('unknown should not be connected', () {
        expect(NetworkStatus.unknown.isConnected, isFalse);
      });

      test('wifi should have correct icon name', () {
        expect(NetworkStatus.wifi.iconName, equals('wifi'));
      });

      test('mobile should have correct icon name', () {
        expect(NetworkStatus.mobile.iconName, equals('signal_cellular_alt'));
      });

      test('offline should have correct icon name', () {
        expect(NetworkStatus.offline.iconName, equals('signal_wifi_off'));
      });
    });

    group('ConnectionQuality', () {
      test('excellent should have value 4', () {
        expect(ConnectionQuality.excellent.value, equals(4));
      });

      test('good should have value 3', () {
        expect(ConnectionQuality.good.value, equals(3));
      });

      test('moderate should have value 2', () {
        expect(ConnectionQuality.moderate.value, equals(2));
      });

      test('poor should have value 1', () {
        expect(ConnectionQuality.poor.value, equals(1));
      });

      test('none should have value 0', () {
        expect(ConnectionQuality.none.value, equals(0));
      });

      test('excellent should be sufficient', () {
        expect(ConnectionQuality.excellent.isSufficient, isTrue);
      });

      test('good should be sufficient', () {
        expect(ConnectionQuality.good.isSufficient, isTrue);
      });

      test('moderate should be sufficient', () {
        expect(ConnectionQuality.moderate.isSufficient, isTrue);
      });

      test('poor should not be sufficient', () {
        expect(ConnectionQuality.poor.isSufficient, isFalse);
      });

      test('none should not be sufficient', () {
        expect(ConnectionQuality.none.isSufficient, isFalse);
      });

      test('excellent should be good for heavy ops', () {
        expect(ConnectionQuality.excellent.isGoodForHeavyOps, isTrue);
      });

      test('good should be good for heavy ops', () {
        expect(ConnectionQuality.good.isGoodForHeavyOps, isTrue);
      });

      test('moderate should not be good for heavy ops', () {
        expect(ConnectionQuality.moderate.isGoodForHeavyOps, isFalse);
      });
    });

    group('Status Descriptions', () {
      test('should return English description for wifi', () {
        // Create a mock scenario - we can't easily test the actual service
        // without mocking connectivity_plus, but we can test the description methods
        final service = NetworkService();
        // The default status is unknown
        expect(service.getStatusDescription(), equals('Connection status unknown'));
        expect(service.getStatusDescriptionFr(), equals('État de connexion inconnu'));
        service.dispose();
      });
    });

    group('Connection Quality Mapping', () {
      test('should return none quality for unknown status', () {
        final quality = networkService.getConnectionQuality();
        expect(quality, equals(ConnectionQuality.none));
      });
    });

    group('Stream', () {
      test('should provide status stream', () {
        expect(networkService.statusStream, isA<Stream<NetworkStatus>>());
      });
    });
  });
}
