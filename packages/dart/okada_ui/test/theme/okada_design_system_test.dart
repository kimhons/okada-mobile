import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:okada_ui/okada_ui.dart';

void main() {
  group('OkadaDesignSystem', () {
    group('Primary Colors (Cameroon Flag)', () {
      test('should have correct Okada Green color', () {
        expect(OkadaDesignSystem.okadaGreen, equals(const Color(0xFF007A5E)));
      });

      test('should have correct Okada Red color', () {
        expect(OkadaDesignSystem.okadaRed, equals(const Color(0xFFCE1126)));
      });

      test('should have correct Okada Yellow color', () {
        expect(OkadaDesignSystem.okadaYellow, equals(const Color(0xFFFCD116)));
      });
    });

    group('Secondary Colors (Cultural)', () {
      test('should have correct Ndop Blue color', () {
        expect(OkadaDesignSystem.ndopBlue, equals(const Color(0xFF1A3263)));
      });

      test('should have correct Market White color', () {
        expect(OkadaDesignSystem.marketWhite, equals(const Color(0xFFF7F3E9)));
      });
    });

    group('Accent Colors', () {
      test('should have correct Plantain Yellow', () {
        expect(OkadaDesignSystem.plantainYellow, equals(const Color(0xFFFFE566)));
      });

      test('should have correct Chili Red', () {
        expect(OkadaDesignSystem.chiliRed, equals(const Color(0xFFE63946)));
      });

      test('should have correct Palm Green', () {
        expect(OkadaDesignSystem.palmGreen, equals(const Color(0xFF2A9D8F)));
      });

      test('should have correct Textile Blue', () {
        expect(OkadaDesignSystem.textileBlue, equals(const Color(0xFF457B9D)));
      });
    });

    group('Neutral Colors', () {
      test('should have correct Market Soil', () {
        expect(OkadaDesignSystem.marketSoil, equals(const Color(0xFF5C4033)));
      });

      test('should have correct Basket Gray', () {
        expect(OkadaDesignSystem.basketGray, equals(const Color(0xFF8D99AE)));
      });

      test('should have correct Soft Clay', () {
        expect(OkadaDesignSystem.softClay, equals(const Color(0xFFE9ECEF)));
      });
    });

    group('Typography Scale (Mobile)', () {
      test('should have correct H1 size', () {
        expect(OkadaDesignSystem.fontSizeH1Mobile, equals(24.0));
      });

      test('should have correct H2 size', () {
        expect(OkadaDesignSystem.fontSizeH2Mobile, equals(20.0));
      });

      test('should have correct body size', () {
        expect(OkadaDesignSystem.fontSizeBody, equals(16.0));
      });
    });

    group('Spacing System', () {
      test('should use 8px base unit', () {
        expect(OkadaDesignSystem.spacingSm, equals(8.0));
        expect(OkadaDesignSystem.spacingMd, equals(16.0));
        expect(OkadaDesignSystem.spacingLg, equals(24.0));
        expect(OkadaDesignSystem.spacingXl, equals(32.0));
      });
    });

    group('Payment Provider Colors', () {
      test('should have MTN Mobile Money yellow', () {
        expect(OkadaDesignSystem.mtnMobileMoneyYellow, equals(const Color(0xFFFFCC00)));
      });

      test('should have Orange Money orange', () {
        expect(OkadaDesignSystem.orangeMoneyOrange, equals(const Color(0xFFFF6600)));
      });
    });

    group('Helper Methods', () {
      test('getTextColorForBackground should return light text for dark backgrounds', () {
        final textColor = OkadaDesignSystem.getTextColorForBackground(
          OkadaDesignSystem.okadaGreen,
        );
        expect(textColor, equals(OkadaDesignSystem.textPrimaryDark));
      });

      test('getTextColorForBackground should return dark text for light backgrounds', () {
        final textColor = OkadaDesignSystem.getTextColorForBackground(
          OkadaDesignSystem.pureWhite,
        );
        expect(textColor, equals(OkadaDesignSystem.textPrimaryLight));
      });
    });
  });

  group('OkadaColorScheme', () {
    test('lightColorScheme should have correct primary color', () {
      expect(
        OkadaColorScheme.lightColorScheme.primary,
        equals(OkadaDesignSystem.okadaGreen),
      );
    });

    test('darkColorScheme should have correct primary color', () {
      expect(
        OkadaColorScheme.darkColorScheme.primary,
        equals(OkadaDesignSystem.okadaGreen),
      );
    });
  });
}
