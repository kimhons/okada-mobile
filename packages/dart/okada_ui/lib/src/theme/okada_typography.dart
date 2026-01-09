import 'package:flutter/material.dart';
import 'okada_colors.dart';

/// Okada Platform Typography System
/// 
/// Uses Inter font family for clean, modern readability.
/// Optimized for mobile screens with proper line heights and letter spacing.
abstract class OkadaTypography {
  OkadaTypography._();

  /// Font family
  static const String fontFamily = 'Inter';

  // ============================================
  // FONT WEIGHTS
  // ============================================
  
  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semiBold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;

  // ============================================
  // DISPLAY STYLES (Large headlines)
  // ============================================
  
  /// Display Large - 57px
  /// Use: Hero sections, splash screens
  static const TextStyle displayLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 57,
    fontWeight: regular,
    height: 1.12,
    letterSpacing: -0.25,
    color: OkadaColors.textPrimary,
  );

  /// Display Medium - 45px
  /// Use: Major section headers
  static const TextStyle displayMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 45,
    fontWeight: regular,
    height: 1.16,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  /// Display Small - 36px
  /// Use: Page titles, promotional banners
  static const TextStyle displaySmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 36,
    fontWeight: regular,
    height: 1.22,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  // ============================================
  // HEADLINE STYLES (Section headers)
  // ============================================
  
  /// Headline Large - 32px
  /// Use: Screen titles, major headers
  static const TextStyle headlineLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 32,
    fontWeight: semiBold,
    height: 1.25,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  /// Headline Medium - 28px
  /// Use: Section headers, dialog titles
  static const TextStyle headlineMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 28,
    fontWeight: semiBold,
    height: 1.29,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  /// Headline Small - 24px
  /// Use: Card titles, subsection headers
  static const TextStyle headlineSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 24,
    fontWeight: semiBold,
    height: 1.33,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  // ============================================
  // TITLE STYLES (Component headers)
  // ============================================
  
  /// Title Large - 22px
  /// Use: App bar titles, list headers
  static const TextStyle titleLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 22,
    fontWeight: semiBold,
    height: 1.27,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  /// Title Medium - 16px
  /// Use: List item titles, card headers
  static const TextStyle titleMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: semiBold,
    height: 1.5,
    letterSpacing: 0.15,
    color: OkadaColors.textPrimary,
  );

  /// Title Small - 14px
  /// Use: Tab labels, chip text
  static const TextStyle titleSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: semiBold,
    height: 1.43,
    letterSpacing: 0.1,
    color: OkadaColors.textPrimary,
  );

  // ============================================
  // BODY STYLES (Main content)
  // ============================================
  
  /// Body Large - 16px
  /// Use: Primary body text, descriptions
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: regular,
    height: 1.5,
    letterSpacing: 0.5,
    color: OkadaColors.textPrimary,
  );

  /// Body Medium - 14px
  /// Use: Secondary body text, list items
  static const TextStyle bodyMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: regular,
    height: 1.43,
    letterSpacing: 0.25,
    color: OkadaColors.textPrimary,
  );

  /// Body Small - 12px
  /// Use: Captions, helper text
  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: regular,
    height: 1.33,
    letterSpacing: 0.4,
    color: OkadaColors.textSecondary,
  );

  // ============================================
  // LABEL STYLES (UI elements)
  // ============================================
  
  /// Label Large - 14px
  /// Use: Button text, prominent labels
  static const TextStyle labelLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: medium,
    height: 1.43,
    letterSpacing: 0.1,
    color: OkadaColors.textPrimary,
  );

  /// Label Medium - 12px
  /// Use: Form labels, navigation labels
  static const TextStyle labelMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: medium,
    height: 1.33,
    letterSpacing: 0.5,
    color: OkadaColors.textPrimary,
  );

  /// Label Small - 11px
  /// Use: Badges, timestamps
  static const TextStyle labelSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 11,
    fontWeight: medium,
    height: 1.45,
    letterSpacing: 0.5,
    color: OkadaColors.textSecondary,
  );

  // ============================================
  // SPECIAL STYLES
  // ============================================
  
  /// Price - Large prominent price display
  static const TextStyle priceLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 24,
    fontWeight: bold,
    height: 1.2,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  /// Price - Medium price display
  static const TextStyle priceMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 18,
    fontWeight: bold,
    height: 1.2,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  /// Price - Small price display
  static const TextStyle priceSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: semiBold,
    height: 1.2,
    letterSpacing: 0,
    color: OkadaColors.textPrimary,
  );

  /// Strikethrough price (for discounts)
  static const TextStyle priceStrikethrough = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: regular,
    height: 1.2,
    letterSpacing: 0,
    color: OkadaColors.textTertiary,
    decoration: TextDecoration.lineThrough,
  );

  /// Button text
  static const TextStyle button = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: semiBold,
    height: 1.43,
    letterSpacing: 0.1,
    color: OkadaColors.textInverse,
  );

  /// Link text
  static const TextStyle link = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: medium,
    height: 1.43,
    letterSpacing: 0.25,
    color: OkadaColors.primary,
    decoration: TextDecoration.underline,
  );

  /// Error text
  static const TextStyle error = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: regular,
    height: 1.33,
    letterSpacing: 0.4,
    color: OkadaColors.error,
  );

  /// Success text
  static const TextStyle success = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: regular,
    height: 1.33,
    letterSpacing: 0.4,
    color: OkadaColors.success,
  );

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /// Get TextTheme for Material theme
  static TextTheme get textTheme => const TextTheme(
    displayLarge: displayLarge,
    displayMedium: displayMedium,
    displaySmall: displaySmall,
    headlineLarge: headlineLarge,
    headlineMedium: headlineMedium,
    headlineSmall: headlineSmall,
    titleLarge: titleLarge,
    titleMedium: titleMedium,
    titleSmall: titleSmall,
    bodyLarge: bodyLarge,
    bodyMedium: bodyMedium,
    bodySmall: bodySmall,
    labelLarge: labelLarge,
    labelMedium: labelMedium,
    labelSmall: labelSmall,
  );

  /// Get dark theme TextTheme
  static TextTheme get textThemeDark => TextTheme(
    displayLarge: displayLarge.copyWith(color: OkadaColors.textPrimaryDark),
    displayMedium: displayMedium.copyWith(color: OkadaColors.textPrimaryDark),
    displaySmall: displaySmall.copyWith(color: OkadaColors.textPrimaryDark),
    headlineLarge: headlineLarge.copyWith(color: OkadaColors.textPrimaryDark),
    headlineMedium: headlineMedium.copyWith(color: OkadaColors.textPrimaryDark),
    headlineSmall: headlineSmall.copyWith(color: OkadaColors.textPrimaryDark),
    titleLarge: titleLarge.copyWith(color: OkadaColors.textPrimaryDark),
    titleMedium: titleMedium.copyWith(color: OkadaColors.textPrimaryDark),
    titleSmall: titleSmall.copyWith(color: OkadaColors.textPrimaryDark),
    bodyLarge: bodyLarge.copyWith(color: OkadaColors.textPrimaryDark),
    bodyMedium: bodyMedium.copyWith(color: OkadaColors.textPrimaryDark),
    bodySmall: bodySmall.copyWith(color: OkadaColors.textSecondaryDark),
    labelLarge: labelLarge.copyWith(color: OkadaColors.textPrimaryDark),
    labelMedium: labelMedium.copyWith(color: OkadaColors.textPrimaryDark),
    labelSmall: labelSmall.copyWith(color: OkadaColors.textSecondaryDark),
  );

  /// Apply color to a text style
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  /// Apply weight to a text style
  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }
}
