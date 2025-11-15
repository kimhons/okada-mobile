import 'package:flutter/material.dart';
import 'colors.dart';

/// Okada Platform Design Tokens - Typography
/// Generated from design-tokens.json
/// Version: 1.0.0
/// Last Updated: 2024-04-01

class OkadaTypography {
  OkadaTypography._(); // Private constructor

  // ============================================================================
  // FONT FAMILY
  // ============================================================================

  static const String fontFamily = 'Inter';

  // ============================================================================
  // FONT WEIGHTS
  // ============================================================================

  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;

  // ============================================================================
  // TEXT STYLES
  // ============================================================================

  // Headings
  static const TextStyle h1 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 32,
    fontWeight: bold,
    height: 1.25, // 40px line height
    letterSpacing: -0.5,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle h2 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 24,
    fontWeight: bold,
    height: 1.33, // 32px line height
    letterSpacing: -0.25,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle h3 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 20,
    fontWeight: semiBold,
    height: 1.4, // 28px line height
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle h4 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 18,
    fontWeight: semiBold,
    height: 1.44, // 26px line height
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle h5 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: semiBold,
    height: 1.5, // 24px line height
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle h6 = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: semiBold,
    height: 1.43, // 20px line height
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  // Body text
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: regular,
    height: 1.5, // 24px line height
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: regular,
    height: 1.43, // 20px line height
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: regular,
    height: 1.33, // 16px line height
    letterSpacing: 0,
    color: OkadaColors.textSecondary,
  );

  // Labels
  static const TextStyle labelLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: medium,
    height: 1.43, // 20px line height
    letterSpacing: 0.1,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle labelMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: medium,
    height: 1.33, // 16px line height
    letterSpacing: 0.5,
    color: OkadaColors.textPrimary,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 10,
    fontWeight: medium,
    height: 1.2, // 12px line height
    letterSpacing: 0.5,
    color: OkadaColors.textSecondary,
  );

  // Button text
  static const TextStyle buttonLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: semiBold,
    height: 1.5, // 24px line height
    letterSpacing: 0.5,
    color: OkadaColors.white,
  );

  static const TextStyle buttonMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: semiBold,
    height: 1.43, // 20px line height
    letterSpacing: 0.5,
    color: OkadaColors.white,
  );

  static const TextStyle buttonSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: semiBold,
    height: 1.33, // 16px line height
    letterSpacing: 0.5,
    color: OkadaColors.white,
  );

  // Caption
  static const TextStyle caption = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: regular,
    height: 1.33, // 16px line height
    letterSpacing: 0.4,
    color: OkadaColors.textSecondary,
  );

  // Overline
  static const TextStyle overline = TextStyle(
    fontFamily: fontFamily,
    fontSize: 10,
    fontWeight: medium,
    height: 1.6, // 16px line height
    letterSpacing: 1.5,
    color: OkadaColors.textSecondary,
  );

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /// Apply color to text style
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  /// Apply weight to text style
  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }

  /// Apply size to text style
  static TextStyle withSize(TextStyle style, double size) {
    return style.copyWith(fontSize: size);
  }

  /// Create text theme for Material app
  static TextTheme createTextTheme() {
    return const TextTheme(
      displayLarge: h1,
      displayMedium: h2,
      displaySmall: h3,
      headlineMedium: h4,
      headlineSmall: h5,
      titleLarge: h6,
      bodyLarge: bodyLarge,
      bodyMedium: bodyMedium,
      bodySmall: bodySmall,
      labelLarge: labelLarge,
      labelMedium: labelMedium,
      labelSmall: labelSmall,
    );
  }
}

