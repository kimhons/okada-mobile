import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'okada_colors.dart';
import 'okada_typography.dart';
import 'okada_spacing.dart';
import 'okada_border_radius.dart';

/// Okada Platform Theme Configuration
/// 
/// Provides complete Material 3 theme configuration for the Okada apps.
/// Includes both light and dark theme variants.
class OkadaTheme {
  OkadaTheme._();

  // ============================================
  // LIGHT THEME
  // ============================================
  
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      
      // Color Scheme
      colorScheme: const ColorScheme.light(
        primary: OkadaColors.primary,
        onPrimary: OkadaColors.textInverse,
        primaryContainer: OkadaColors.primary100,
        onPrimaryContainer: OkadaColors.primary900,
        secondary: OkadaColors.secondary,
        onSecondary: OkadaColors.textInverse,
        secondaryContainer: OkadaColors.secondary100,
        onSecondaryContainer: OkadaColors.secondary900,
        tertiary: OkadaColors.accent,
        onTertiary: OkadaColors.textInverse,
        tertiaryContainer: OkadaColors.accent100,
        onTertiaryContainer: OkadaColors.accent900,
        error: OkadaColors.error,
        onError: OkadaColors.textInverse,
        errorContainer: OkadaColors.errorLight,
        onErrorContainer: OkadaColors.errorDark,
        surface: OkadaColors.surface,
        onSurface: OkadaColors.textPrimary,
        surfaceContainerHighest: OkadaColors.surfaceVariant,
        onSurfaceVariant: OkadaColors.textSecondary,
        outline: OkadaColors.borderMedium,
        outlineVariant: OkadaColors.borderLight,
        shadow: OkadaColors.neutral900,
        scrim: OkadaColors.neutral900,
        inverseSurface: OkadaColors.neutral900,
        onInverseSurface: OkadaColors.textInverse,
        inversePrimary: OkadaColors.primary300,
      ),
      
      // Typography
      textTheme: OkadaTypography.textTheme,
      fontFamily: OkadaTypography.fontFamily,
      
      // Scaffold
      scaffoldBackgroundColor: OkadaColors.backgroundPrimary,
      
      // AppBar
      appBarTheme: const AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 1,
        backgroundColor: OkadaColors.backgroundPrimary,
        foregroundColor: OkadaColors.textPrimary,
        surfaceTintColor: Colors.transparent,
        centerTitle: true,
        titleTextStyle: OkadaTypography.titleLarge,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        iconTheme: IconThemeData(
          color: OkadaColors.textPrimary,
          size: 24,
        ),
      ),
      
      // Bottom Navigation
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: OkadaColors.surface,
        selectedItemColor: OkadaColors.primary,
        unselectedItemColor: OkadaColors.textTertiary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: OkadaTypography.labelSmall,
        unselectedLabelStyle: OkadaTypography.labelSmall,
      ),
      
      // Navigation Bar (Material 3)
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: OkadaColors.surface,
        indicatorColor: OkadaColors.primary100,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return OkadaTypography.labelSmall.copyWith(
              color: OkadaColors.primary,
              fontWeight: FontWeight.w600,
            );
          }
          return OkadaTypography.labelSmall.copyWith(
            color: OkadaColors.textTertiary,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(
              color: OkadaColors.primary,
              size: 24,
            );
          }
          return const IconThemeData(
            color: OkadaColors.textTertiary,
            size: 24,
          );
        }),
      ),
      
      // Card
      cardTheme: CardThemeData(
        elevation: 0,
        color: OkadaColors.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.card,
          side: const BorderSide(color: OkadaColors.borderLight),
        ),
        margin: EdgeInsets.zero,
      ),
      
      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: OkadaColors.primary,
          foregroundColor: OkadaColors.textInverse,
          disabledBackgroundColor: OkadaColors.neutral200,
          disabledForegroundColor: OkadaColors.textDisabled,
          elevation: 0,
          padding: OkadaSpacing.buttonEdgeInsets,
          minimumSize: const Size(64, 48),
          shape: RoundedRectangleBorder(
            borderRadius: OkadaBorderRadius.button,
          ),
          textStyle: OkadaTypography.button,
        ),
      ),
      
      // Outlined Button
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: OkadaColors.primary,
          disabledForegroundColor: OkadaColors.textDisabled,
          padding: OkadaSpacing.buttonEdgeInsets,
          minimumSize: const Size(64, 48),
          shape: RoundedRectangleBorder(
            borderRadius: OkadaBorderRadius.button,
          ),
          side: const BorderSide(color: OkadaColors.primary),
          textStyle: OkadaTypography.button.copyWith(
            color: OkadaColors.primary,
          ),
        ),
      ),
      
      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: OkadaColors.primary,
          disabledForegroundColor: OkadaColors.textDisabled,
          padding: OkadaSpacing.buttonEdgeInsets,
          minimumSize: const Size(64, 48),
          shape: RoundedRectangleBorder(
            borderRadius: OkadaBorderRadius.button,
          ),
          textStyle: OkadaTypography.button.copyWith(
            color: OkadaColors.primary,
          ),
        ),
      ),
      
      // Floating Action Button
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: OkadaColors.primary,
        foregroundColor: OkadaColors.textInverse,
        elevation: 4,
        shape: CircleBorder(),
      ),
      
      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: OkadaColors.backgroundSecondary,
        contentPadding: OkadaSpacing.inputEdgeInsets,
        border: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.error, width: 2),
        ),
        hintStyle: OkadaTypography.bodyMedium.copyWith(
          color: OkadaColors.textTertiary,
        ),
        labelStyle: OkadaTypography.bodyMedium.copyWith(
          color: OkadaColors.textSecondary,
        ),
        errorStyle: OkadaTypography.error,
        prefixIconColor: OkadaColors.textTertiary,
        suffixIconColor: OkadaColors.textTertiary,
      ),
      
      // Chip
      chipTheme: ChipThemeData(
        backgroundColor: OkadaColors.backgroundSecondary,
        selectedColor: OkadaColors.primary100,
        disabledColor: OkadaColors.neutral100,
        labelStyle: OkadaTypography.labelMedium,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.chip,
        ),
        side: BorderSide.none,
      ),
      
      // Dialog
      dialogTheme: DialogThemeData(
        backgroundColor: OkadaColors.surface,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.modal,
        ),
        titleTextStyle: OkadaTypography.headlineSmall,
        contentTextStyle: OkadaTypography.bodyMedium,
      ),
      
      // Bottom Sheet
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: OkadaColors.surface,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.bottomSheet,
        ),
        showDragHandle: true,
        dragHandleColor: OkadaColors.neutral300,
        dragHandleSize: Size(32, 4),
      ),
      
      // Snackbar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: OkadaColors.neutral800,
        contentTextStyle: OkadaTypography.bodyMedium.copyWith(
          color: OkadaColors.textInverse,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.snackbar,
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 4,
      ),
      
      // Divider
      dividerTheme: const DividerThemeData(
        color: OkadaColors.borderLight,
        thickness: 1,
        space: 1,
      ),
      
      // List Tile
      listTileTheme: ListTileThemeData(
        contentPadding: OkadaSpacing.listItemEdgeInsets,
        titleTextStyle: OkadaTypography.titleMedium,
        subtitleTextStyle: OkadaTypography.bodySmall,
        leadingAndTrailingTextStyle: OkadaTypography.bodyMedium,
        iconColor: OkadaColors.textSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.radiusMd,
        ),
      ),
      
      // Tab Bar
      tabBarTheme: TabBarThemeData(
        labelColor: OkadaColors.primary,
        unselectedLabelColor: OkadaColors.textTertiary,
        labelStyle: OkadaTypography.labelLarge,
        unselectedLabelStyle: OkadaTypography.labelLarge,
        indicator: const UnderlineTabIndicator(
          borderSide: BorderSide(color: OkadaColors.primary, width: 2),
        ),
        indicatorSize: TabBarIndicatorSize.label,
      ),
      
      // Progress Indicator
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: OkadaColors.primary,
        linearTrackColor: OkadaColors.primary100,
        circularTrackColor: OkadaColors.primary100,
      ),
      
      // Switch
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return OkadaColors.primary;
          }
          return OkadaColors.neutral400;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return OkadaColors.primary200;
          }
          return OkadaColors.neutral200;
        }),
      ),
      
      // Checkbox
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return OkadaColors.primary;
          }
          return Colors.transparent;
        }),
        checkColor: WidgetStateProperty.all(OkadaColors.textInverse),
        side: const BorderSide(color: OkadaColors.borderMedium, width: 2),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      
      // Radio
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return OkadaColors.primary;
          }
          return OkadaColors.borderMedium;
        }),
      ),
    );
  }

  // ============================================
  // DARK THEME
  // ============================================
  
  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: OkadaColors.primary400,
        onPrimary: OkadaColors.primary950,
        primaryContainer: OkadaColors.primary800,
        onPrimaryContainer: OkadaColors.primary100,
        secondary: OkadaColors.secondary400,
        onSecondary: OkadaColors.secondary950,
        secondaryContainer: OkadaColors.secondary800,
        onSecondaryContainer: OkadaColors.secondary100,
        tertiary: OkadaColors.accent400,
        onTertiary: OkadaColors.accent950,
        tertiaryContainer: OkadaColors.accent800,
        onTertiaryContainer: OkadaColors.accent100,
        error: OkadaColors.error,
        onError: OkadaColors.textInverse,
        errorContainer: OkadaColors.errorDark,
        onErrorContainer: OkadaColors.errorLight,
        surface: OkadaColors.surfaceDark,
        onSurface: OkadaColors.textPrimaryDark,
        surfaceContainerHighest: OkadaColors.surfaceVariantDark,
        onSurfaceVariant: OkadaColors.textSecondaryDark,
        outline: OkadaColors.neutral600,
        outlineVariant: OkadaColors.neutral700,
        shadow: OkadaColors.neutral950,
        scrim: OkadaColors.neutral950,
        inverseSurface: OkadaColors.neutral100,
        onInverseSurface: OkadaColors.textPrimary,
        inversePrimary: OkadaColors.primary600,
      ),
      
      // Typography
      textTheme: OkadaTypography.textThemeDark,
      fontFamily: OkadaTypography.fontFamily,
      
      // Scaffold
      scaffoldBackgroundColor: OkadaColors.backgroundPrimaryDark,
      
      // AppBar
      appBarTheme: const AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 1,
        backgroundColor: OkadaColors.backgroundPrimaryDark,
        foregroundColor: OkadaColors.textPrimaryDark,
        surfaceTintColor: Colors.transparent,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: OkadaTypography.fontFamily,
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: OkadaColors.textPrimaryDark,
        ),
        systemOverlayStyle: SystemUiOverlayStyle.light,
        iconTheme: IconThemeData(
          color: OkadaColors.textPrimaryDark,
          size: 24,
        ),
      ),
      
      // Card
      cardTheme: CardThemeData(
        elevation: 0,
        color: OkadaColors.surfaceDark,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.card,
          side: const BorderSide(color: OkadaColors.neutral700),
        ),
        margin: EdgeInsets.zero,
      ),
      
      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: OkadaColors.backgroundSecondaryDark,
        contentPadding: OkadaSpacing.inputEdgeInsets,
        border: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.neutral700),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.primary400, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: OkadaBorderRadius.input,
          borderSide: const BorderSide(color: OkadaColors.error, width: 2),
        ),
        hintStyle: OkadaTypography.bodyMedium.copyWith(
          color: OkadaColors.textTertiaryDark,
        ),
        labelStyle: OkadaTypography.bodyMedium.copyWith(
          color: OkadaColors.textSecondaryDark,
        ),
        errorStyle: OkadaTypography.error,
        prefixIconColor: OkadaColors.textTertiaryDark,
        suffixIconColor: OkadaColors.textTertiaryDark,
      ),
      
      // Divider
      dividerTheme: const DividerThemeData(
        color: OkadaColors.neutral700,
        thickness: 1,
        space: 1,
      ),
      
      // Bottom Sheet
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: OkadaColors.surfaceDark,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: OkadaBorderRadius.bottomSheet,
        ),
        showDragHandle: true,
        dragHandleColor: OkadaColors.neutral600,
        dragHandleSize: Size(32, 4),
      ),
    );
  }
}
