import 'package:flutter_test/flutter_test.dart';
import 'package:okada_ui/okada_ui.dart';

void main() {
  group('CulturalSymbol', () {
    test('should have all expected symbols', () {
      expect(CulturalSymbol.values.length, equals(6));
      expect(CulturalSymbol.values, contains(CulturalSymbol.crocodile));
      expect(CulturalSymbol.values, contains(CulturalSymbol.sun));
      expect(CulturalSymbol.values, contains(CulturalSymbol.linkedHearts));
      expect(CulturalSymbol.values, contains(CulturalSymbol.palmTree));
      expect(CulturalSymbol.values, contains(CulturalSymbol.basket));
      expect(CulturalSymbol.values, contains(CulturalSymbol.motorcycle));
    });
  });

  group('getCulturalSymbolMeaning', () {
    group('English meanings', () {
      test('crocodile should mean Adaptability', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.crocodile, locale: 'en'),
          equals('Adaptability'),
        );
      });

      test('sun should mean Prosperity', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.sun, locale: 'en'),
          equals('Prosperity'),
        );
      });

      test('linkedHearts should mean Unity', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.linkedHearts, locale: 'en'),
          equals('Unity'),
        );
      });

      test('palmTree should mean Growth', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.palmTree, locale: 'en'),
          equals('Growth'),
        );
      });

      test('basket should mean Abundance', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.basket, locale: 'en'),
          equals('Abundance'),
        );
      });

      test('motorcycle should mean Speed & Reliability', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.motorcycle, locale: 'en'),
          equals('Speed & Reliability'),
        );
      });
    });

    group('French meanings', () {
      test('crocodile should mean Adaptabilité', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.crocodile, locale: 'fr'),
          equals('Adaptabilité'),
        );
      });

      test('sun should mean Prospérité', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.sun, locale: 'fr'),
          equals('Prospérité'),
        );
      });

      test('linkedHearts should mean Unité', () {
        expect(
          getCulturalSymbolMeaning(CulturalSymbol.linkedHearts, locale: 'fr'),
          equals('Unité'),
        );
      });
    });

    test('should default to English for unknown locale', () {
      expect(
        getCulturalSymbolMeaning(CulturalSymbol.sun, locale: 'de'),
        equals('Prosperity'),
      );
    });
  });
}
