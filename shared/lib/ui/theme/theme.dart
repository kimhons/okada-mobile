import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'colors.dart';
import 'typography.dart';
import 'spacing.dart';

/// Okada Platform Theme Configuration
/// Complete Material Theme based on design tokens
/// Version: 1.0.0

class OkadaTheme {
  OkadaTheme._(); // Private constructor

  // ============================================================================
  // LIGHT THEME
  // ============================================================================

  static ThemeData get lightTheme {
    return ThemeData(
      // Color scheme
      colorScheme: ColorScheme.light(
        primary: OkadaColors.primary,
        onPrimary: OkadaColors.white,
        secondary: OkadaColors.secondary,
        onSecondary: OkadaColors.white,
        error: OkadaColors.error,
        onError: OkadaColors.white,
        background: OkadaColors.backgroundPrimary,
        onBackground: OkadaColors.textPrimary,
        surface: OkadaColors.white,
        onSurface: OkadaColors.textPrimary,
      ),

      // Typography
      textTheme: OkadaTypography.createTextTheme(),
      fontFamily: OkadaTypography.fontFamily,

      // App bar theme
      appBarTheme: AppBarTheme(
        backgroundColor: OkadaColors.white,
        foregroundColor: OkadaColors.textPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: OkadaTypography.h5,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        iconTheme: const IconThemeData(
          color: OkadaColors.textPrimary,
          size: OkadaSpacing.iconLg,
        ),
      ),

      // Button themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: OkadaColors.primary,
          foregroundColor: OkadaColors.white,
          elevation: OkadaSpacing.elevationSm,
          padding: const EdgeInsets.symmetric(
            horizontal: OkadaSpacing.buttonPaddingHorizontal,
            vertical: OkadaSpacing.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(OkadaSpacing.buttonRadius),
          ),
          textStyle: OkadaTypography.buttonMedium,
          minimumSize: const Size(0, OkadaSpacing.touchTarget),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: OkadaColors.primary,
          side: const BorderSide(color: OkadaColors.primary, width: 1.5),
          padding: const EdgeInsets.symmetric(
            horizontal: OkadaSpacing.buttonPaddingHorizontal,
            vertical: OkadaSpacing.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(OkadaSpacing.buttonRadius),
          ),
          textStyle: OkadaTypography.buttonMedium,
          minimumSize: const Size(0, OkadaSpacing.touchTarget),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: OkadaColors.primary,
          padding: const EdgeInsets.symmetric(
            horizontal: OkadaSpacing.buttonPaddingHorizontal,
            vertical: OkadaSpacing.buttonPaddingVertical,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(OkadaSpacing.buttonRadius),
          ),
          textStyle: OkadaTypography.buttonMedium,
          minimumSize: const Size(0, OkadaSpacing.touchTarget),
        ),
      ),

      // Input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: OkadaColors.backgroundSecondary,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: OkadaSpacing.inputPaddingHorizontal,
          vertical: OkadaSpacing.inputPaddingVertical,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.inputRadius),
          borderSide: const BorderSide(color: OkadaColors.borderDefault),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.inputRadius),
          borderSide: const BorderSide(color: OkadaColors.borderDefault),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.inputRadius),
          borderSide: const BorderSide(color: OkadaColors.borderFocus, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.inputRadius),
          borderSide: const BorderSide(color: OkadaColors.borderError),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.inputRadius),
          borderSide: const BorderSide(color: OkadaColors.borderError, width: 2),
        ),
        labelStyle: OkadaTypography.labelMedium,
        hintStyle: OkadaTypography.bodyMedium.copyWith(
          color: OkadaColors.textSecondary,
        ),
        errorStyle: OkadaTypography.bodySmall.copyWith(
          color: OkadaColors.error,
        ),
      ),

      // Card theme
      cardTheme: CardTheme(
        color: OkadaColors.white,
        elevation: OkadaSpacing.elevationSm,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.cardRadius),
        ),
        margin: const EdgeInsets.all(OkadaSpacing.marginSm),
      ),

      // Chip theme
      chipTheme: ChipThemeData(
        backgroundColor: OkadaColors.backgroundSecondary,
        deleteIconColor: OkadaColors.textSecondary,
        disabledColor: OkadaColors.gray200,
        selectedColor: OkadaColors.primary,
        secondarySelectedColor: OkadaColors.secondary,
        padding: const EdgeInsets.symmetric(
          horizontal: OkadaSpacing.paddingMd,
          vertical: OkadaSpacing.paddingSm,
        ),
        labelStyle: OkadaTypography.labelMedium,
        secondaryLabelStyle: OkadaTypography.labelMedium,
        brightness: Brightness.light,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.chipRadius),
        ),
      ),

      // Dialog theme
      dialogTheme: DialogTheme(
        backgroundColor: OkadaColors.white,
        elevation: OkadaSpacing.elevationLg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.radiusLg),
        ),
        titleTextStyle: OkadaTypography.h4,
        contentTextStyle: OkadaTypography.bodyMedium,
      ),

      // Bottom sheet theme
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: OkadaColors.white,
        elevation: OkadaSpacing.elevationLg,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(OkadaSpacing.radiusXl),
          ),
        ),
      ),

      // Snackbar theme
      snackBarTheme: SnackBarThemeData(
        backgroundColor: OkadaColors.gray800,
        contentTextStyle: OkadaTypography.bodyMedium.copyWith(
          color: OkadaColors.white,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.radiusMd),
        ),
      ),

      // Floating action button theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: OkadaColors.primary,
        foregroundColor: OkadaColors.white,
        elevation: OkadaSpacing.elevationMd,
      ),

      // Bottom navigation bar theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: OkadaColors.white,
        selectedItemColor: OkadaColors.primary,
        unselectedItemColor: OkadaColors.textSecondary,
        selectedLabelStyle: OkadaTypography.labelSmall,
        unselectedLabelStyle: OkadaTypography.labelSmall,
        type: BottomNavigationBarType.fixed,
        elevation: OkadaSpacing.elevationMd,
      ),

      // Divider theme
      dividerTheme: const DividerThemeData(
        color: OkadaColors.borderDefault,
        thickness: 1,
        space: OkadaSpacing.marginLg,
      ),

      // Icon theme
      iconTheme: const IconThemeData(
        color: OkadaColors.textPrimary,
        size: OkadaSpacing.iconLg,
      ),

      // Switch theme
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return OkadaColors.white;
          }
          return OkadaColors.gray400;
        }),
        trackColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return OkadaColors.primary;
          }
          return OkadaColors.gray300;
        }),
      ),

      // Checkbox theme
      checkboxTheme: CheckboxThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return OkadaColors.primary;
          }
          return OkadaColors.white;
        }),
        checkColor: MaterialStateProperty.all(OkadaColors.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(OkadaSpacing.radiusXs),
        ),
      ),

      // Radio theme
      radioTheme: RadioThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return OkadaColors.primary;
          }
          return OkadaColors.gray400;
        }),
      ),

      // Progress indicator theme
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: OkadaColors.primary,
        linearTrackColor: OkadaColors.gray200,
        circularTrackColor: OkadaColors.gray200,
      ),

      // Scaffold background
      scaffoldBackgroundColor: OkadaColors.backgroundPrimary,

      // Use Material 3
      useMaterial3: true,
    );
  }

  // ============================================================================
  // DARK THEME (Optional - for future implementation)
  // ============================================================================

  static ThemeData get darkTheme {
    // TODO: Implement dark theme when needed
    return lightTheme;
  }
}

