import 'package:flutter/material.dart';
import 'african_countries.dart';
import 'okada_colors.dart';
import 'okada_typography.dart';
import 'okada_spacing.dart';
import 'okada_border_radius.dart';

/// Country-specific theme configuration
class CountryTheme {
  /// Current country
  final AfricanCountry country;
  
  /// Country configuration
  final CountryConfig config;
  
  /// Whether to use flag colors as accents
  final bool useFlagAccents;
  
  /// Whether to show cultural patterns
  final bool showCulturalPatterns;

  CountryTheme({
    required this.country,
    this.useFlagAccents = false,
    this.showCulturalPatterns = false,
  }) : config = AfricanCountryRegistry.getConfig(country);

  /// Get primary color (optionally flag-based)
  Color get primaryColor => useFlagAccents 
      ? config.primaryAccent 
      : OkadaColors.primary;

  /// Get secondary color (optionally flag-based)
  Color get secondaryColor => useFlagAccents 
      ? config.secondaryAccent 
      : OkadaColors.secondary;

  /// Get flag colors for decorative use
  List<Color> get flagColors => config.flagColors;

  /// Get gradient using flag colors
  LinearGradient get flagGradient => LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: config.flagColors.take(3).toList(),
  );

  /// Get subtle flag accent gradient (for backgrounds)
  LinearGradient get subtleFlagGradient => LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: config.flagColors.take(2).map((c) => c.withOpacity(0.1)).toList(),
  );

  /// Build Material theme with country customizations
  ThemeData buildTheme({bool isDark = false}) {
    final baseTheme = isDark ? _buildDarkTheme() : _buildLightTheme();
    
    if (!useFlagAccents) return baseTheme;

    // Apply country-specific color overrides
    return baseTheme.copyWith(
      colorScheme: baseTheme.colorScheme.copyWith(
        primary: config.primaryAccent,
        secondary: config.secondaryAccent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: config.primaryAccent,
          foregroundColor: _getContrastColor(config.primaryAccent),
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: config.primaryAccent,
        foregroundColor: _getContrastColor(config.primaryAccent),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: config.primaryAccent,
      ),
    );
  }

  ThemeData _buildLightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: OkadaColors.surface,
        error: OkadaColors.error,
      ),
      textTheme: OkadaTypography.textTheme,
      fontFamily: OkadaTypography.fontFamily,
      scaffoldBackgroundColor: OkadaColors.backgroundPrimary,
    );
  }

  ThemeData _buildDarkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.dark(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: OkadaColors.surfaceDark,
        error: OkadaColors.error,
      ),
      textTheme: OkadaTypography.textThemeDark,
      fontFamily: OkadaTypography.fontFamily,
      scaffoldBackgroundColor: OkadaColors.backgroundPrimaryDark,
    );
  }

  Color _getContrastColor(Color background) {
    return background.computeLuminance() > 0.5 
        ? OkadaColors.textPrimary 
        : OkadaColors.textInverse;
  }
}

/// InheritedWidget to provide country theme throughout the app
class CountryThemeProvider extends InheritedWidget {
  final CountryTheme countryTheme;

  const CountryThemeProvider({
    super.key,
    required this.countryTheme,
    required super.child,
  });

  static CountryTheme of(BuildContext context) {
    final provider = context.dependOnInheritedWidgetOfExactType<CountryThemeProvider>();
    return provider?.countryTheme ?? CountryTheme(country: AfricanCountry.cameroon);
  }

  static CountryTheme? maybeOf(BuildContext context) {
    final provider = context.dependOnInheritedWidgetOfExactType<CountryThemeProvider>();
    return provider?.countryTheme;
  }

  @override
  bool updateShouldNotify(CountryThemeProvider oldWidget) {
    return countryTheme.country != oldWidget.countryTheme.country ||
           countryTheme.useFlagAccents != oldWidget.countryTheme.useFlagAccents;
  }
}

/// Stateful wrapper for country theme with change notifications
class CountryThemeScope extends StatefulWidget {
  final AfricanCountry initialCountry;
  final bool useFlagAccents;
  final bool showCulturalPatterns;
  final Widget child;

  const CountryThemeScope({
    super.key,
    this.initialCountry = AfricanCountry.cameroon,
    this.useFlagAccents = false,
    this.showCulturalPatterns = false,
    required this.child,
  });

  @override
  State<CountryThemeScope> createState() => CountryThemeScopeState();

  /// Get the state to change country programmatically
  static CountryThemeScopeState? of(BuildContext context) {
    return context.findAncestorStateOfType<CountryThemeScopeState>();
  }
}

class CountryThemeScopeState extends State<CountryThemeScope> {
  late CountryTheme _countryTheme;

  @override
  void initState() {
    super.initState();
    _countryTheme = CountryTheme(
      country: widget.initialCountry,
      useFlagAccents: widget.useFlagAccents,
      showCulturalPatterns: widget.showCulturalPatterns,
    );
  }

  /// Change the current country
  void setCountry(AfricanCountry country) {
    setState(() {
      _countryTheme = CountryTheme(
        country: country,
        useFlagAccents: _countryTheme.useFlagAccents,
        showCulturalPatterns: _countryTheme.showCulturalPatterns,
      );
    });
  }

  /// Toggle flag-based accents
  void setUseFlagAccents(bool value) {
    setState(() {
      _countryTheme = CountryTheme(
        country: _countryTheme.country,
        useFlagAccents: value,
        showCulturalPatterns: _countryTheme.showCulturalPatterns,
      );
    });
  }

  /// Toggle cultural patterns
  void setShowCulturalPatterns(bool value) {
    setState(() {
      _countryTheme = CountryTheme(
        country: _countryTheme.country,
        useFlagAccents: _countryTheme.useFlagAccents,
        showCulturalPatterns: value,
      );
    });
  }

  /// Get current country theme
  CountryTheme get countryTheme => _countryTheme;

  @override
  Widget build(BuildContext context) {
    return CountryThemeProvider(
      countryTheme: _countryTheme,
      child: widget.child,
    );
  }
}

/// Extension for easy access to country theme
extension CountryThemeExtension on BuildContext {
  /// Get the current country theme
  CountryTheme get countryTheme => CountryThemeProvider.of(this);
  
  /// Get the current country config
  CountryConfig get countryConfig => countryTheme.config;
  
  /// Get the current country
  AfricanCountry get currentCountry => countryTheme.country;
}
