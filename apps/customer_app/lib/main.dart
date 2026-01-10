import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:get_it/get_it.dart';
import 'package:okada_core/okada_core.dart';
import 'package:okada_ui/okada_ui.dart';

import 'l10n/generated/app_localizations.dart';

/// Global service locator instance
final getIt = GetIt.instance;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Initialize services
  await _initializeServices();
  
  runApp(const OkadaCustomerApp());
}

/// Initialize all required services
Future<void> _initializeServices() async {
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Register services with GetIt
  _registerServices();
  
  // Initialize storage services
  await getIt<StorageService>().init();
  await getIt<HiveStorageService>().init();
  await getIt<NetworkService>().init();
  
  // Initialize preferences
  await getIt<PreferencesService>().init();
}

/// Register all services with dependency injection
void _registerServices() {
  // Core services
  getIt.registerLazySingleton<LoggerService>(() => LoggerService(
    environment: Environment.dev,
  ));
  getIt.registerLazySingleton<StorageService>(() => StorageService());
  getIt.registerLazySingleton<HiveStorageService>(() => HiveStorageService());
  getIt.registerLazySingleton<PreferencesService>(() => PreferencesService());
  getIt.registerLazySingleton<NetworkService>(() => NetworkService());
  getIt.registerLazySingleton<ErrorHandler>(() => ErrorHandler(
    logger: getIt<LoggerService>(),
  ));
}

/// Main application widget
class OkadaCustomerApp extends StatefulWidget {
  const OkadaCustomerApp({super.key});

  @override
  State<OkadaCustomerApp> createState() => _OkadaCustomerAppState();
}

class _OkadaCustomerAppState extends State<OkadaCustomerApp> {
  late final HiveStorageService _hiveStorage;
  late Locale _locale;
  late ThemeMode _themeMode;
  late AfricanCountry _selectedCountry;

  @override
  void initState() {
    super.initState();
    _hiveStorage = getIt<HiveStorageService>();
    _loadSettings();
  }

  void _loadSettings() {
    // Load saved settings
    final languageCode = _hiveStorage.getLanguage();
    _locale = Locale(languageCode);
    
    final themeModeStr = _hiveStorage.getThemeMode();
    _themeMode = _parseThemeMode(themeModeStr);
    
    final countryCode = _hiveStorage.getCountry();
    _selectedCountry = _getCountryFromCode(countryCode);
  }

  AfricanCountry _getCountryFromCode(String code) {
    final config = AfricanCountryRegistry.getByCountryCode(code);
    return config?.country ?? AfricanCountry.cameroon;
  }

  ThemeMode _parseThemeMode(String mode) {
    switch (mode) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  void _setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
    _hiveStorage.setLanguage(locale.languageCode);
  }

  @override
  Widget build(BuildContext context) {
    final countryTheme = CountryTheme(country: _selectedCountry);
    
    return CountryThemeProvider(
      countryTheme: countryTheme,
      child: MaterialApp(
        title: 'Okada',
        debugShowCheckedModeBanner: false,
        
        // Localization
        locale: _locale,
        supportedLocales: const [
          Locale('en'), // English
          Locale('fr'), // French
        ],
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        
        // Theming
        theme: OkadaTheme.light,
        darkTheme: OkadaTheme.dark,
        themeMode: _themeMode,
        
        // Home
        home: const OkadaHomePage(),
        
        // Navigation
        onGenerateRoute: _generateRoute,
      ),
    );
  }

  Route<dynamic>? _generateRoute(RouteSettings settings) {
    // Route generation will be implemented in Sequence 2
    // For now, return null to use default routing
    return null;
  }
}

/// Temporary home page - will be replaced with proper screens in Sequence 2
class OkadaHomePage extends StatelessWidget {
  const OkadaHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final countryTheme = CountryThemeProvider.of(context);
    
    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      appBar: AppBar(
        title: Text(
          l10n.appTitle,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: countryTheme.primaryColor,
        foregroundColor: Colors.white,
        actions: [
          // Language toggle
          IconButton(
            icon: const Icon(Icons.language),
            onPressed: () {
              final currentLocale = Localizations.localeOf(context);
              final newLocale = currentLocale.languageCode == 'en'
                  ? const Locale('fr')
                  : const Locale('en');
              // Access parent state to change locale
              context.findAncestorStateOfType<_OkadaCustomerAppState>()?._setLocale(newLocale);
            },
            tooltip: l10n.changeLanguage,
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(OkadaSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Welcome card
              OkadaCard(
                child: Column(
                  children: [
                    CountryFlag(
                      country: countryTheme.country,
                      size: 48,
                    ),
                    const SizedBox(height: OkadaSpacing.md),
                    Text(
                      l10n.welcomeMessage,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: OkadaSpacing.sm),
                    Text(
                      l10n.welcomeSubtitle,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: OkadaSpacing.xl),
              
              // Network status indicator
              StreamBuilder<NetworkStatus>(
                stream: getIt<NetworkService>().statusStream,
                initialData: getIt<NetworkService>().currentStatus,
                builder: (context, snapshot) {
                  final status = snapshot.data ?? NetworkStatus.unknown;
                  return OfflineIndicator(
                    isOffline: !status.isConnected,
                  );
                },
              ),
              
              const Spacer(),
              
              // Info text
              Text(
                'Sequence 1 Complete ✓\nAuthentication screens coming in Sequence 2',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: OkadaSpacing.lg),
            ],
          ),
        ),
      ),
    );
  }
}
