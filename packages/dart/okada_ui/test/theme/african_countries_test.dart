import 'package:flutter_test/flutter_test.dart';
import 'package:okada_ui/okada_ui.dart';

void main() {
  group('AfricanCountryRegistry', () {
    test('should have Cameroon as default country', () {
      final defaultCountry = AfricanCountryRegistry.defaultCountry;
      expect(defaultCountry.country, equals(AfricanCountry.cameroon));
      expect(defaultCountry.countryCode, equals('CM'));
      expect(defaultCountry.dialingCode, equals('+237'));
    });

    test('should support all 10 initial African countries', () {
      final countries = AfricanCountryRegistry.supportedCountries;
      expect(countries.length, equals(10));
      expect(countries, contains(AfricanCountry.cameroon));
      expect(countries, contains(AfricanCountry.nigeria));
      expect(countries, contains(AfricanCountry.ghana));
      expect(countries, contains(AfricanCountry.kenya));
      expect(countries, contains(AfricanCountry.southAfrica));
    });

    test('should return correct config for Cameroon', () {
      final config = AfricanCountryRegistry.getConfig(AfricanCountry.cameroon);
      expect(config.nameEn, equals('Cameroon'));
      expect(config.nameFr, equals('Cameroun'));
      expect(config.currencyCode, equals('XAF'));
      expect(config.currencySymbol, equals('FCFA'));
      expect(config.flagEmoji, equals('🇨🇲'));
      expect(config.languages, contains('fr'));
      expect(config.languages, contains('en'));
      expect(config.mobileMoneyProviders, contains('MTN MoMo'));
      expect(config.mobileMoneyProviders, contains('Orange Money'));
    });

    test('should return correct config for Nigeria', () {
      final config = AfricanCountryRegistry.getConfig(AfricanCountry.nigeria);
      expect(config.nameEn, equals('Nigeria'));
      expect(config.currencyCode, equals('NGN'));
      expect(config.currencySymbol, equals('₦'));
      expect(config.dialingCode, equals('+234'));
      expect(config.flagEmoji, equals('🇳🇬'));
    });

    test('should return correct config for Kenya', () {
      final config = AfricanCountryRegistry.getConfig(AfricanCountry.kenya);
      expect(config.nameEn, equals('Kenya'));
      expect(config.currencyCode, equals('KES'));
      expect(config.dialingCode, equals('+254'));
      expect(config.mobileMoneyProviders, contains('M-Pesa'));
    });

    test('should find country by country code', () {
      final config = AfricanCountryRegistry.getByCountryCode('GH');
      expect(config, isNotNull);
      expect(config!.country, equals(AfricanCountry.ghana));
    });

    test('should find country by dialing code', () {
      final config = AfricanCountryRegistry.getByDialingCode('+27');
      expect(config, isNotNull);
      expect(config!.country, equals(AfricanCountry.southAfrica));
    });

    test('should return null for unsupported country code', () {
      final config = AfricanCountryRegistry.getByCountryCode('XX');
      expect(config, isNull);
    });

    test('should have flag colors for all countries', () {
      for (final country in AfricanCountryRegistry.supportedCountries) {
        final config = AfricanCountryRegistry.getConfig(country);
        expect(config.flagColors, isNotEmpty);
        expect(config.flagColors.length, greaterThanOrEqualTo(2));
      }
    });

    test('should have mobile money providers for all countries', () {
      for (final country in AfricanCountryRegistry.supportedCountries) {
        final config = AfricanCountryRegistry.getConfig(country);
        expect(config.mobileMoneyProviders, isNotEmpty);
      }
    });

    test('should have cultural pattern name for all countries', () {
      for (final country in AfricanCountryRegistry.supportedCountries) {
        final config = AfricanCountryRegistry.getConfig(country);
        expect(config.culturalPatternName, isNotEmpty);
      }
    });
  });

  group('CountryConfig', () {
    test('should have valid timezone for Cameroon', () {
      final config = AfricanCountryRegistry.getConfig(AfricanCountry.cameroon);
      expect(config.timezone, equals('Africa/Douala'));
    });

    test('should have primary and secondary accent colors', () {
      final config = AfricanCountryRegistry.getConfig(AfricanCountry.cameroon);
      expect(config.primaryAccent, isNotNull);
      expect(config.secondaryAccent, isNotNull);
      expect(config.primaryAccent, isNot(equals(config.secondaryAccent)));
    });
  });

  group('CulturalPatternRegistry', () {
    test('should have pattern for all supported countries', () {
      for (final country in AfricanCountryRegistry.supportedCountries) {
        final pattern = CulturalPatternRegistry.getPattern(country);
        expect(pattern.name, isNotEmpty);
        expect(pattern.colors, isNotEmpty);
        expect(pattern.significance, isNotEmpty);
      }
    });

    test('should have Toghu pattern for Cameroon', () {
      final pattern = CulturalPatternRegistry.getPattern(AfricanCountry.cameroon);
      expect(pattern.name, equals('Toghu'));
      expect(pattern.type, equals(CulturalPatternType.embroidery));
    });

    test('should have Kente pattern for Ghana', () {
      final pattern = CulturalPatternRegistry.getPattern(AfricanCountry.ghana);
      expect(pattern.name, equals('Kente'));
      expect(pattern.type, equals(CulturalPatternType.geometric));
    });

    test('should have Ndebele pattern for South Africa', () {
      final pattern = CulturalPatternRegistry.getPattern(AfricanCountry.southAfrica);
      expect(pattern.name, equals('Ndebele'));
      expect(pattern.type, equals(CulturalPatternType.geometric));
    });
  });
}
