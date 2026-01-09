# Flutter Customer App Implementation Checklist with AI Features

## 1. Project Setup and Configuration

### 1.1. Create Flutter Project

- [ ] Create a new Flutter project for the customer app:
  ```bash
  flutter create --org com.okada --project-name okada_customer --platforms android,ios okada_customer
  cd okada_customer
  ```

- [ ] Set up project structure:
  ```bash
  mkdir -p lib/src/{config,constants,core,data,domain,presentation,utils}
  mkdir -p lib/src/core/{error,network,storage,theme}
  mkdir -p lib/src/data/{datasources,models,repositories}
  mkdir -p lib/src/domain/{entities,repositories,usecases}
  mkdir -p lib/src/presentation/{blocs,pages,widgets}
  ```

### 1.2. Configure Dependencies

- [ ] Update pubspec.yaml with required dependencies:
  ```yaml
  name: okada_customer
  description: Okada quick commerce customer app for Cameroon
  
  publish_to: 'none'
  version: 1.0.0+1
  
  environment:
    sdk: '>=3.0.0 <4.0.0'
  
  dependencies:
    flutter:
      sdk: flutter
    flutter_localizations:
      sdk: flutter
  
    # State Management
    flutter_bloc: ^8.1.3
    equatable: ^2.0.5
    provider: ^6.0.5
  
    # Network
    dio: ^5.3.2
    connectivity_plus: ^4.0.2
    http: ^1.1.0
  
    # Local Storage
    shared_preferences: ^2.2.1
    sqflite: ^2.3.0
    path_provider: ^2.1.1
    flutter_secure_storage: ^9.0.0
    hive: ^2.2.3
    hive_flutter: ^1.1.0
  
    # UI Components
    flutter_svg: ^2.0.7
    cached_network_image: ^3.2.3
    shimmer: ^3.0.0
    lottie: ^2.6.0
    flutter_spinkit: ^5.2.0
    carousel_slider: ^4.2.1
    pull_to_refresh: ^2.0.0
    flutter_staggered_grid_view: ^0.7.0
    flutter_rating_bar: ^4.0.1
    flutter_slidable: ^3.0.0
    skeletons: ^0.0.3
    flutter_screenutil: ^5.9.0
    google_fonts: ^5.1.0
  
    # Location
    geolocator: ^10.0.1
    geocoding: ^2.1.0
    google_maps_flutter: ^2.5.0
    flutter_polyline_points: ^1.0.0
  
    # Authentication
    firebase_auth: ^4.9.0
    google_sign_in: ^6.1.5
    flutter_facebook_auth: ^6.0.1
  
    # Firebase
    firebase_core: ^2.15.1
    firebase_messaging: ^14.6.7
    firebase_analytics: ^10.4.5
    firebase_crashlytics: ^3.3.5
    cloud_firestore: ^4.9.1
  
    # Utils
    intl: ^0.18.1
    uuid: ^3.0.7
    logger: ^2.0.2
    url_launcher: ^6.1.14
    package_info_plus: ^4.1.0
    device_info_plus: ^9.0.3
    permission_handler: ^10.4.5
    image_picker: ^1.0.4
    image_cropper: ^5.0.0
    share_plus: ^7.1.0
    flutter_local_notifications: ^15.1.1
    flutter_native_splash: ^2.3.2
    flutter_launcher_icons: ^0.13.1
    flutter_dotenv: ^5.1.0
    timeago: ^3.5.0
    flutter_html: ^3.0.0-beta.2
    flutter_markdown: ^0.6.17
    qr_flutter: ^4.1.0
    qr_code_scanner: ^1.0.1
  
    # Payment
    flutter_stripe: ^9.3.0
    flutter_paystack: ^1.0.7
  
    # AI Features
    tflite_flutter: ^0.10.1
    google_ml_kit: ^0.16.2
    camera: ^0.10.5+4
    speech_to_text: ^6.3.0
    flutter_tts: ^3.8.3
    dialogflow_flutter: ^1.0.0
  
    # Cameroon Flag Colors (Branding)
    cameroon_flag_colors: ^1.0.0
  
  dev_dependencies:
    flutter_test:
      sdk: flutter
    flutter_lints: ^2.0.3
    build_runner: ^2.4.6
    flutter_gen_runner: ^5.3.1
    mockito: ^5.4.2
    bloc_test: ^9.1.4
    integration_test:
      sdk: flutter
    flutter_driver:
      sdk: flutter
  
  flutter:
    uses-material-design: true
    assets:
      - assets/images/
      - assets/icons/
      - assets/animations/
      - assets/translations/
      - assets/ml_models/
      - .env
  ```

- [ ] Create .env file for environment variables:
  ```bash
  touch .env
  echo "API_URL=https://api.okada.com" >> .env
  echo "GOOGLE_MAPS_API_KEY=your_google_maps_api_key" >> .env
  echo "AI_BRAIN_URL=https://ai-brain.okada.com" >> .env
  echo "AI_BRAIN_API_KEY=your_ai_brain_api_key" >> .env
  ```

### 1.3. Configure App Theme with Cameroon Flag Colors

- [ ] Create theme configuration file:
  ```bash
  touch lib/src/core/theme/app_theme.dart
  ```

- [ ] Implement theme with Cameroon flag colors:
  ```dart
  // lib/src/core/theme/app_theme.dart
  import 'package:flutter/material.dart';
  import 'package:google_fonts/google_fonts.dart';
  
  class AppColors {
    // Cameroon Flag Colors
    static const Color green = Color(0xFF007A5E);
    static const Color red = Color(0xFFCE1126);
    static const Color yellow = Color(0xFFFCD116);
    
    // App Colors
    static const Color primary = green;
    static const Color secondary = red;
    static const Color accent = yellow;
    
    static const Color background = Color(0xFFF8F9FA);
    static const Color surface = Colors.white;
    static const Color error = Color(0xFFB00020);
    
    static const Color textPrimary = Color(0xFF212121);
    static const Color textSecondary = Color(0xFF757575);
    static const Color textHint = Color(0xFFBDBDBD);
    
    static const Color divider = Color(0xFFEEEEEE);
    static const Color disabled = Color(0xFFE0E0E0);
    
    static const Color success = Color(0xFF4CAF50);
    static const Color info = Color(0xFF2196F3);
    static const Color warning = Color(0xFFFFC107);
  }
  
  class AppTheme {
    static ThemeData get lightTheme {
      return ThemeData(
        primaryColor: AppColors.primary,
        colorScheme: ColorScheme.light(
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.surface,
          background: AppColors.background,
          error: AppColors.error,
        ),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.primary,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        textTheme: GoogleFonts.poppinsTextTheme(),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            textStyle: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            textStyle: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
            textStyle: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.error),
          ),
          hintStyle: GoogleFonts.poppins(
            color: AppColors.textHint,
            fontSize: 14,
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          color: AppColors.surface,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textSecondary,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),
        dividerTheme: const DividerThemeData(
          color: AppColors.divider,
          thickness: 1,
          space: 1,
        ),
        chipTheme: ChipThemeData(
          backgroundColor: AppColors.primary.withOpacity(0.1),
          disabledColor: AppColors.disabled,
          selectedColor: AppColors.primary,
          secondarySelectedColor: AppColors.secondary,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          labelStyle: GoogleFonts.poppins(
            fontSize: 12,
            color: AppColors.primary,
          ),
          secondaryLabelStyle: GoogleFonts.poppins(
            fontSize: 12,
            color: Colors.white,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        progressIndicatorTheme: const ProgressIndicatorThemeData(
          color: AppColors.primary,
          circularTrackColor: AppColors.divider,
          linearTrackColor: AppColors.divider,
        ),
      );
    }
  }
  ```

### 1.4. Configure App Localization

- [ ] Create localization files:
  ```bash
  mkdir -p assets/translations
  touch assets/translations/en.json
  touch assets/translations/fr.json
  ```

- [ ] Add English translations (abbreviated for brevity):
  ```json
  {
    "app": {
      "name": "Okada",
      "tagline": "Your Market, Delivered in Minutes"
    },
    "common": {
      "loading": "Loading...",
      "retry": "Retry",
      "cancel": "Cancel"
    },
    "auth": {
      "login": "Login",
      "register": "Register"
    },
    "home": {
      "title": "Home",
      "welcome": "Welcome"
    },
    "product": {
      "price": "Price",
      "quantity": "Quantity"
    },
    "ai": {
      "voiceSearch": "Voice Search",
      "voiceAssistant": "Voice Assistant",
      "personalizedRecommendations": "Personalized for You"
    }
  }
  ```

- [ ] Add French translations (abbreviated for brevity):
  ```json
  {
    "app": {
      "name": "Okada",
      "tagline": "Votre Marché, Livré en Minutes"
    },
    "common": {
      "loading": "Chargement...",
      "retry": "Réessayer",
      "cancel": "Annuler"
    },
    "auth": {
      "login": "Connexion",
      "register": "S'inscrire"
    },
    "home": {
      "title": "Accueil",
      "welcome": "Bienvenue"
    },
    "product": {
      "price": "Prix",
      "quantity": "Quantité"
    },
    "ai": {
      "voiceSearch": "Recherche vocale",
      "voiceAssistant": "Assistant vocal",
      "personalizedRecommendations": "Personnalisé pour vous"
    }
  }
  ```

- [ ] Create localization service:
  ```bash
  mkdir -p lib/src/core/localization
  touch lib/src/core/localization/app_localizations.dart
  ```

- [ ] Implement localization service (abbreviated for brevity):
  ```dart
  // lib/src/core/localization/app_localizations.dart
  import 'dart:convert';
  import 'package:flutter/material.dart';
  import 'package:flutter/services.dart';
  
  class AppLocalizations {
    final Locale locale;
    
    AppLocalizations(this.locale);
    
    static AppLocalizations of(BuildContext context) {
      return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
    }
    
    static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();
    
    late Map<String, dynamic> _localizedStrings;
    
    Future<bool> load() async {
      String jsonString = await rootBundle.loadString('assets/translations/${locale.languageCode}.json');
      Map<String, dynamic> jsonMap = json.decode(jsonString);
      
      _localizedStrings = jsonMap;
      
      return true;
    }
    
    String translate(String key) {
      List<String> keys = key.split('.');
      dynamic value = _localizedStrings;
      
      for (String k in keys) {
        if (value is! Map<String, dynamic> || !value.containsKey(k)) {
          return key;
        }
        value = value[k];
      }
      
      return value.toString();
    }
  }
  
  class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
    const _AppLocalizationsDelegate();
    
    @override
    bool isSupported(Locale locale) {
      return ['en', 'fr'].contains(locale.languageCode);
    }
    
    @override
    Future<AppLocalizations> load(Locale locale) async {
      AppLocalizations localizations = AppLocalizations(locale);
      await localizations.load();
      return localizations;
    }
    
    @override
    bool shouldReload(_AppLocalizationsDelegate old) => false;
  }
  
  // Extension method for easier access to translations
  extension TranslateX on BuildContext {
    String tr(String key) {
      return AppLocalizations.of(this).translate(key);
    }
  }
  ```

### 1.5. Configure App Icons and Splash Screen

- [ ] Create app icon configuration:
  ```bash
  touch flutter_launcher_icons.yaml
  ```

- [ ] Configure app icons with Cameroon flag colors:
  ```yaml
  # flutter_launcher_icons.yaml
  flutter_launcher_icons:
  android: "launcher_icon"
  ios: true
  image_path: "assets/icons/app_icon.png"
  min_sdk_android: 21
  web:
    generate: true
    image_path: "assets/icons/app_icon.png"
    background_color: "#007A5E"
    theme_color: "#007A5E"
  windows:
    generate: false
  macos:
    generate: false
  ```

- [ ] Create splash screen configuration:
  ```bash
  touch flutter_native_splash.yaml
  ```

- [ ] Configure splash screen with Cameroon flag colors:
  ```yaml
  # flutter_native_splash.yaml
  flutter_native_splash:
  color: "#007A5E"
  image: assets/images/splash_logo.png
  color_dark: "#007A5E"
  image_dark: assets/images/splash_logo.png
  
  android_12:
    image: assets/images/splash_logo.png
    icon_background_color: "#007A5E"
    image_dark: assets/images/splash_logo.png
    icon_background_color_dark: "#007A5E"
  
  web: false
  ```

## 2. AI Brain Integration

### 2.1. AI Brain Client Setup

- [ ] Create AI Brain client:
  ```bash
  mkdir -p lib/src/core/ai
  touch lib/src/core/ai/ai_brain_client.dart
  ```

- [ ] Implement AI Brain client:
  ```dart
  // lib/src/core/ai/ai_brain_client.dart
  import 'package:dio/dio.dart';
  import 'package:flutter_dotenv/flutter_dotenv.dart';
  
  class AIBrainClient {
    final Dio _dio;
  
    AIBrainClient({required Dio dio}) : _dio = dio {
      _dio.options.baseUrl = dotenv.env['AI_BRAIN_URL'] ?? 'https://ai-brain.okada.com';
      _dio.options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': dotenv.env['AI_BRAIN_API_KEY'] ?? '',
      };
    }
  
    // Set user ID for personalization
    void setUserId(String userId) {
      _dio.options.headers['X-User-ID'] = userId;
    }
  
    // Get personalized recommendations
    Future<Map<String, dynamic>> getPersonalizedRecommendations({
      required String userId,
      int limit = 10,
    }) async {
      final response = await _dio.get(
        '/recommendations/personalized',
        queryParameters: {
          'userId': userId,
          'limit': limit,
        },
      );
      return response.data;
    }
  
    // Process voice command
    Future<Map<String, dynamic>> processVoiceCommand({
      required String audioBase64,
      String? language,
    }) async {
      final response = await _dio.post(
        '/voice/process',
        data: {
          'audio': audioBase64,
          'language': language ?? 'en',
        },
      );
      return response.data;
    }
  
    // Process image search
    Future<Map<String, dynamic>> processImageSearch({
      required String imageBase64,
      int limit = 10,
    }) async {
      final response = await _dio.post(
        '/image/search',
        data: {
          'image': imageBase64,
          'limit': limit,
        },
      );
      return response.data;
    }
  }
  ```

### 2.2. Offline AI Service

- [ ] Create offline AI service:
  ```bash
  touch lib/src/core/ai/offline_ai_service.dart
  ```

- [ ] Implement offline AI service:
  ```dart
  // lib/src/core/ai/offline_ai_service.dart
  import 'dart:io';
  import 'package:tflite_flutter/tflite_flutter.dart';
  import 'package:path_provider/path_provider.dart';
  
  class OfflineAIService {
    // Model paths
    static const String _productRecommendationModel = 'product_recommendation';
    static const String _imageRecognitionModel = 'image_recognition';
    static const String _voiceCommandModel = 'voice_command';
    
    // Load model
    Future<Interpreter?> _loadModel(String modelName) async {
      try {
        final appDir = await getApplicationDocumentsDirectory();
        final modelPath = '${appDir.path}/ai_models/$modelName.tflite';
        
        if (await File(modelPath).exists()) {
          return Interpreter.fromFile(File(modelPath));
        }
        
        return null;
      } catch (e) {
        print('Error loading model: $e');
        return null;
      }
    }
    
    // Get product recommendations
    Future<List<String>> getProductRecommendations({
      required String productId,
      int limit = 5,
    }) async {
      final interpreter = await _loadModel(_productRecommendationModel);
      if (interpreter == null) {
        return [];
      }
      
      try {
        // Simplified example - in a real app, you would have proper input processing
        final input = [productId.hashCode % 1000 / 1000.0];
        final output = List<double>.filled(10, 0);
        
        interpreter.run([input], [output]);
        
        // Process output to get product IDs
        final recommendations = <String>[];
        for (int i = 0; i < limit && i < output.length; i++) {
          recommendations.add('product_${(output[i] * 1000).round()}');
        }
        
        interpreter.close();
        return recommendations;
      } catch (e) {
        print('Error getting recommendations: $e');
        interpreter.close();
        return [];
      }
    }
    
    // Recognize image
    Future<String?> recognizeImage(List<int> imageBytes) async {
      final interpreter = await _loadModel(_imageRecognitionModel);
      if (interpreter == null) {
        return null;
      }
      
      try {
        // Simplified example - in a real app, you would process the image properly
        final input = List<double>.filled(224 * 224 * 3, 0);
        final output = List<double>.filled(10, 0);
        
        interpreter.run([input], [output]);
        
        // Find the category with highest confidence
        int maxIndex = 0;
        double maxValue = output[0];
        for (int i = 1; i < output.length; i++) {
          if (output[i] > maxValue) {
            maxValue = output[i];
            maxIndex = i;
          }
        }
        
        // Map index to category
        final categories = ['apple', 'banana', 'orange', 'tomato', 'potato', 'carrot', 'onion', 'broccoli', 'cucumber', 'pepper'];
        
        interpreter.close();
        return categories[maxIndex];
      } catch (e) {
        print('Error recognizing image: $e');
        interpreter.close();
        return null;
      }
    }
    
    // Process voice command
    Future<Map<String, dynamic>?> processVoiceCommand(List<int> audioBytes) async {
      final interpreter = await _loadModel(_voiceCommandModel);
      if (interpreter == null) {
        return null;
      }
      
      try {
        // Simplified example - in a real app, you would process the audio properly
        final input = List<double>.filled(16000, 0);
        final output = List<double>.filled(10, 0);
        
        interpreter.run([input], [output]);
        
        // Find the command with highest confidence
        int maxIndex = 0;
        double maxValue = output[0];
        for (int i = 1; i < output.length; i++) {
          if (output[i] > maxValue) {
            maxValue = output[i];
            maxIndex = i;
          }
        }
        
        // Map index to command
        final commands = ['search', 'add_to_cart', 'checkout', 'help', 'cancel', 'show_orders', 'show_cart', 'show_profile', 'show_categories', 'show_home'];
        
        interpreter.close();
        return {
          'command': commands[maxIndex],
          'confidence': maxValue,
        };
      } catch (e) {
        print('Error processing voice command: $e');
        interpreter.close();
        return null;
      }
    }
  }
  ```

### 2.3. AI Features Manager

- [ ] Create AI features manager:
  ```bash
  touch lib/src/core/ai/ai_features_manager.dart
  ```

- [ ] Implement AI features manager:
  ```dart
  // lib/src/core/ai/ai_features_manager.dart
  import 'dart:convert';
  import 'dart:io';
  import 'package:flutter/foundation.dart';
  import 'package:okada_customer/src/core/ai/ai_brain_client.dart';
  import 'package:okada_customer/src/core/ai/offline_ai_service.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/preferences_service.dart';
  import 'package:image_picker/image_picker.dart';
  import 'package:speech_to_text/speech_to_text.dart';
  import 'package:flutter_tts/flutter_tts.dart';
  
  class AIFeaturesManager {
    final AIBrainClient _aiBrainClient;
    final OfflineAIService _offlineAIService;
    final NetworkInfo _networkInfo;
    final PreferencesService _preferencesService;
    final SpeechToText _speechToText;
    final FlutterTts _flutterTts;
    
    AIFeaturesManager({
      required AIBrainClient aiBrainClient,
      required OfflineAIService offlineAIService,
      required NetworkInfo networkInfo,
      required PreferencesService preferencesService,
    }) : _aiBrainClient = aiBrainClient,
         _offlineAIService = offlineAIService,
         _networkInfo = networkInfo,
         _preferencesService = preferencesService,
         _speechToText = SpeechToText(),
         _flutterTts = FlutterTts();
    
    // Initialize speech recognition
    Future<bool> initSpeechRecognition() async {
      return await _speechToText.initialize();
    }
    
    // Start listening for voice commands
    Future<void> startListening({
      required Function(String) onResult,
      required Function(String) onError,
      String? language,
    }) async {
      if (await _speechToText.initialize()) {
        await _speechToText.listen(
          onResult: (result) {
            if (result.finalResult) {
              onResult(result.recognizedWords);
            }
          },
          localeId: language ?? 'en_US',
          listenFor: const Duration(seconds: 30),
          pauseFor: const Duration(seconds: 3),
          onError: (error) => onError(error.errorMsg),
        );
      } else {
        onError('Speech recognition not available');
      }
    }
    
    // Stop listening
    Future<void> stopListening() async {
      await _speechToText.stop();
    }
    
    // Process voice command
    Future<Map<String, dynamic>> processVoiceCommand({
      required String audioBase64,
      String? language,
    }) async {
      final isConnected = await _networkInfo.isConnected;
      final isOfflineAIEnabled = _preferencesService.isOfflineAIEnabled();
      
      if (isConnected) {
        try {
          return await _aiBrainClient.processVoiceCommand(
            audioBase64: audioBase64,
            language: language,
          );
        } catch (e) {
          if (isOfflineAIEnabled) {
            final result = await _offlineAIService.processVoiceCommand(
              base64Decode(audioBase64),
            );
            if (result != null) {
              return result;
            }
          }
          rethrow;
        }
      } else if (isOfflineAIEnabled) {
        final result = await _offlineAIService.processVoiceCommand(
          base64Decode(audioBase64),
        );
        if (result != null) {
          return result;
        }
        throw Exception('Offline processing failed');
      } else {
        throw Exception('No internet connection and offline AI is disabled');
      }
    }
    
    // Process image search
    Future<Map<String, dynamic>> processImageSearch({
      required XFile imageFile,
      int limit = 10,
    }) async {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);
      
      final isConnected = await _networkInfo.isConnected;
      final isOfflineAIEnabled = _preferencesService.isOfflineAIEnabled();
      
      if (isConnected) {
        try {
          return await _aiBrainClient.processImageSearch(
            imageBase64: base64Image,
            limit: limit,
          );
        } catch (e) {
          if (isOfflineAIEnabled) {
            final category = await _offlineAIService.recognizeImage(bytes);
            if (category != null) {
              return {
                'category': category,
                'products': [],
              };
            }
          }
          rethrow;
        }
      } else if (isOfflineAIEnabled) {
        final category = await _offlineAIService.recognizeImage(bytes);
        if (category != null) {
          return {
            'category': category,
            'products': [],
          };
        }
        throw Exception('Offline processing failed');
      } else {
        throw Exception('No internet connection and offline AI is disabled');
      }
    }
    
    // Get personalized recommendations
    Future<List<String>> getPersonalizedRecommendations({
      required String userId,
      String? productId,
      int limit = 10,
    }) async {
      final isConnected = await _networkInfo.isConnected;
      final isOfflineAIEnabled = _preferencesService.isOfflineAIEnabled();
      
      if (isConnected) {
        try {
          final result = await _aiBrainClient.getPersonalizedRecommendations(
            userId: userId,
            limit: limit,
          );
          return List<String>.from(result['recommendations'] ?? []);
        } catch (e) {
          if (isOfflineAIEnabled && productId != null) {
            return await _offlineAIService.getProductRecommendations(
              productId: productId,
              limit: limit,
            );
          }
          return [];
        }
      } else if (isOfflineAIEnabled && productId != null) {
        return await _offlineAIService.getProductRecommendations(
          productId: productId,
          limit: limit,
        );
      } else {
        return [];
      }
    }
    
    // Speak text
    Future<void> speak({
      required String text,
      String? language,
    }) async {
      await _flutterTts.setLanguage(language ?? 'en-US');
      await _flutterTts.setPitch(1.0);
      await _flutterTts.speak(text);
    }
    
    // Stop speaking
    Future<void> stopSpeaking() async {
      await _flutterTts.stop();
    }
  }
  ```

## 3. Core Features Implementation

### 3.1. Authentication

- [ ] Create authentication repository:
  ```bash
  touch lib/src/data/repositories/auth_repository.dart
  ```

- [ ] Implement authentication repository:
  ```dart
  // lib/src/data/repositories/auth_repository.dart
  import 'package:firebase_auth/firebase_auth.dart';
  import 'package:google_sign_in/google_sign_in.dart';
  import 'package:okada_customer/src/core/error/exceptions.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/storage/secure_storage.dart';
  import 'package:okada_customer/src/data/models/user_model.dart';
  
  class AuthRepository {
    final FirebaseAuth _firebaseAuth;
    final GoogleSignIn _googleSignIn;
    final ApiClient _apiClient;
    final SecureStorageService _secureStorage;
    
    AuthRepository({
      required FirebaseAuth firebaseAuth,
      required GoogleSignIn googleSignIn,
      required ApiClient apiClient,
      required SecureStorageService secureStorage,
    }) : _firebaseAuth = firebaseAuth,
         _googleSignIn = googleSignIn,
         _apiClient = apiClient,
         _secureStorage = secureStorage;
    
    // Sign in with phone number
    Future<void> signInWithPhone({
      required String phoneNumber,
      required Function(String, int?) codeSent,
      required Function(UserModel) verificationCompleted,
      required Function(String) verificationFailed,
      required Function(String) codeAutoRetrievalTimeout,
    }) async {
      await _firebaseAuth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Sign in with credential
          final userCredential = await _firebaseAuth.signInWithCredential(credential);
          final user = userCredential.user;
          
          if (user != null) {
            // Get user data from API
            final userData = await _getUserData(user.uid);
            
            // Save auth data
            await _secureStorage.saveAuthData(
              token: await user.getIdToken() ?? '',
              userId: user.uid,
              refreshToken: user.refreshToken ?? '',
            );
            
            // Set API client auth token
            _apiClient.setAuthToken(await user.getIdToken() ?? '');
            
            verificationCompleted(userData);
          } else {
            verificationFailed('User is null');
          }
        },
        verificationFailed: (FirebaseAuthException e) {
          verificationFailed(e.message ?? 'Verification failed');
        },
        codeSent: (String verificationId, int? resendToken) {
          codeSent(verificationId, resendToken);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          codeAutoRetrievalTimeout(verificationId);
        },
        timeout: const Duration(seconds: 60),
      );
    }
    
    // Verify phone number with code
    Future<UserModel> verifyPhoneCode({
      required String verificationId,
      required String smsCode,
    }) async {
      try {
        // Create credential
        final credential = PhoneAuthProvider.credential(
          verificationId: verificationId,
          smsCode: smsCode,
        );
        
        // Sign in with credential
        final userCredential = await _firebaseAuth.signInWithCredential(credential);
        final user = userCredential.user;
        
        if (user != null) {
          // Get user data from API
          final userData = await _getUserData(user.uid);
          
          // Save auth data
          await _secureStorage.saveAuthData(
            token: await user.getIdToken() ?? '',
            userId: user.uid,
            refreshToken: user.refreshToken ?? '',
          );
          
          // Set API client auth token
          _apiClient.setAuthToken(await user.getIdToken() ?? '');
          
          return userData;
        } else {
          throw AuthenticationException('User is null');
        }
      } on FirebaseAuthException catch (e) {
        throw AuthenticationException(e.message ?? 'Verification failed');
      } catch (e) {
        throw AuthenticationException(e.toString());
      }
    }
    
    // Sign in with Google
    Future<UserModel> signInWithGoogle() async {
      try {
        // Sign in with Google
        final googleUser = await _googleSignIn.signIn();
        if (googleUser == null) {
          throw AuthenticationException('Google sign in aborted');
        }
        
        // Get auth
        final googleAuth = await googleUser.authentication;
        
        // Create credential
        final credential = GoogleAuthProvider.credential(
          accessToken: googleAuth.accessToken,
          idToken: googleAuth.idToken,
        );
        
        // Sign in with credential
        final userCredential = await _firebaseAuth.signInWithCredential(credential);
        final user = userCredential.user;
        
        if (user != null) {
          // Get user data from API
          final userData = await _getUserData(user.uid);
          
          // Save auth data
          await _secureStorage.saveAuthData(
            token: await user.getIdToken() ?? '',
            userId: user.uid,
            refreshToken: user.refreshToken ?? '',
          );
          
          // Set API client auth token
          _apiClient.setAuthToken(await user.getIdToken() ?? '');
          
          return userData;
        } else {
          throw AuthenticationException('User is null');
        }
      } catch (e) {
        throw AuthenticationException(e.toString());
      }
    }
    
    // Sign out
    Future<void> signOut() async {
      try {
        await _firebaseAuth.signOut();
        await _googleSignIn.signOut();
        await _secureStorage.clearAuthData();
        _apiClient.clearAuthToken();
      } catch (e) {
        throw AuthenticationException(e.toString());
      }
    }
    
    // Check if user is signed in
    Future<bool> isSignedIn() async {
      final token = await _secureStorage.getAuthToken();
      return token != null && token.isNotEmpty;
    }
    
    // Get current user
    Future<UserModel?> getCurrentUser() async {
      try {
        final userId = await _secureStorage.getUserId();
        if (userId == null) {
          return null;
        }
        
        return await _getUserData(userId);
      } catch (e) {
        return null;
      }
    }
    
    // Get user data from API
    Future<UserModel> _getUserData(String userId) async {
      try {
        final response = await _apiClient.get('/users/$userId');
        return UserModel.fromJson(response['data']);
      } catch (e) {
        // If API fails, create a basic user model from Firebase user
        final user = _firebaseAuth.currentUser;
        if (user != null) {
          return UserModel(
            id: user.uid,
            phoneNumber: user.phoneNumber ?? '',
            email: user.email,
            firstName: user.displayName?.split(' ').first ?? '',
            lastName: user.displayName?.split(' ').last ?? '',
            profileImageUrl: user.photoURL,
            isPhoneVerified: user.phoneNumber != null,
            isEmailVerified: user.emailVerified,
          );
        } else {
          throw AuthenticationException('User not found');
        }
      }
    }
  }
  ```

### 3.2. Product Repository

- [ ] Create product repository:
  ```bash
  touch lib/src/data/repositories/product_repository.dart
  ```

- [ ] Implement product repository:
  ```dart
  // lib/src/data/repositories/product_repository.dart
  import 'package:okada_customer/src/core/error/exceptions.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/data/models/product_model.dart';
  import 'package:okada_customer/src/data/models/category_model.dart';
  
  class ProductRepository {
    final ApiClient _apiClient;
    final NetworkInfo _networkInfo;
    final LocalDatabase _localDatabase;
    final RecentlyViewedDao _recentlyViewedDao;
    
    ProductRepository({
      required ApiClient apiClient,
      required NetworkInfo networkInfo,
      required LocalDatabase localDatabase,
      required RecentlyViewedDao recentlyViewedDao,
    }) : _apiClient = apiClient,
         _networkInfo = networkInfo,
         _localDatabase = localDatabase,
         _recentlyViewedDao = recentlyViewedDao;
    
    // Get featured products
    Future<List<ProductModel>> getFeaturedProducts() async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/products/featured');
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get product by ID
    Future<ProductModel> getProductById(String id) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/products/$id');
        final product = ProductModel.fromJson(response['data']);
        
        // Add to recently viewed
        await _recentlyViewedDao.addRecentlyViewed(id);
        
        return product;
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get products by category
    Future<List<ProductModel>> getProductsByCategory(String categoryId, {int page = 1, int limit = 20}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get(
          '/products',
          queryParameters: {
            'categoryId': categoryId,
            'page': page,
            'limit': limit,
          },
        );
        
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Search products
    Future<List<ProductModel>> searchProducts(String query, {int page = 1, int limit = 20}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get(
          '/products/search',
          queryParameters: {
            'query': query,
            'page': page,
            'limit': limit,
          },
        );
        
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get categories
    Future<List<CategoryModel>> getCategories() async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/categories');
        final categories = List<Map<String, dynamic>>.from(response['data']);
        
        return categories.map((category) => CategoryModel.fromJson(category)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get recently viewed products
    Future<List<ProductModel>> getRecentlyViewedProducts({int limit = 10}) async {
      try {
        // Get recently viewed product IDs
        final productIds = await _recentlyViewedDao.getRecentlyViewed(limit: limit);
        
        if (productIds.isEmpty) {
          return [];
        }
        
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        // Get products by IDs
        final response = await _apiClient.post(
          '/products/batch',
          data: {
            'ids': productIds,
          },
        );
        
        final products = List<Map<String, dynamic>>.from(response['data']);
        
        return products.map((product) => ProductModel.fromJson(product)).toList();
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
  }
  ```

### 3.3. Cart Repository

- [ ] Create cart repository:
  ```bash
  touch lib/src/data/repositories/cart_repository.dart
  ```

- [ ] Implement cart repository:
  ```dart
  // lib/src/data/repositories/cart_repository.dart
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/data/models/product_model.dart';
  import 'package:uuid/uuid.dart';
  
  class CartItem {
    final String id;
    final String productId;
    final String productName;
    final double price;
    final int quantity;
    final String? imageUrl;
    final DateTime createdAt;
    
    CartItem({
      required this.id,
      required this.productId,
      required this.productName,
      required this.price,
      required this.quantity,
      this.imageUrl,
      DateTime? createdAt,
    }) : createdAt = createdAt ?? DateTime.now();
    
    factory CartItem.fromMap(Map<String, dynamic> map) {
      return CartItem(
        id: map['id'],
        productId: map['product_id'],
        productName: map['product_name'],
        price: map['price'],
        quantity: map['quantity'],
        imageUrl: map['image_url'],
        createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at']),
      );
    }
    
    Map<String, dynamic> toMap() {
      return {
        'id': id,
        'product_id': productId,
        'product_name': productName,
        'price': price,
        'quantity': quantity,
        'image_url': imageUrl,
        'created_at': createdAt.millisecondsSinceEpoch,
      };
    }
    
    CartItem copyWith({
      String? id,
      String? productId,
      String? productName,
      double? price,
      int? quantity,
      String? imageUrl,
      DateTime? createdAt,
    }) {
      return CartItem(
        id: id ?? this.id,
        productId: productId ?? this.productId,
        productName: productName ?? this.productName,
        price: price ?? this.price,
        quantity: quantity ?? this.quantity,
        imageUrl: imageUrl ?? this.imageUrl,
        createdAt: createdAt ?? this.createdAt,
      );
    }
  }
  
  class CartRepository {
    final CartDao _cartDao;
    final Uuid _uuid;
    
    CartRepository({
      required CartDao cartDao,
    }) : _cartDao = cartDao,
         _uuid = const Uuid();
    
    // Add product to cart
    Future<void> addToCart(ProductModel product, {int quantity = 1}) async {
      await _cartDao.addToCart(
        id: _uuid.v4(),
        productId: product.id,
        productName: product.name,
        price: product.currentPrice,
        quantity: quantity,
        imageUrl: product.primaryImageUrl,
      );
    }
    
    // Get cart items
    Future<List<CartItem>> getCartItems() async {
      final items = await _cartDao.getCartItems();
      return items.map((item) => CartItem.fromMap(item)).toList();
    }
    
    // Update cart item quantity
    Future<void> updateQuantity(String productId, int quantity) async {
      await _cartDao.updateQuantity(productId, quantity);
    }
    
    // Remove item from cart
    Future<void> removeFromCart(String productId) async {
      await _cartDao.removeFromCart(productId);
    }
    
    // Clear cart
    Future<void> clearCart() async {
      await _cartDao.clearCart();
    }
    
    // Get cart count
    Future<int> getCartCount() async {
      return await _cartDao.getCartCount();
    }
    
    // Get cart total
    Future<double> getCartTotal() async {
      return await _cartDao.getCartTotal();
    }
  }
  ```

### 3.4. Order Repository

- [ ] Create order repository:
  ```bash
  touch lib/src/data/repositories/order_repository.dart
  ```

- [ ] Implement order repository:
  ```dart
  // lib/src/data/repositories/order_repository.dart
  import 'dart:convert';
  
  import 'package:okada_customer/src/core/error/exceptions.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/data/repositories/cart_repository.dart';
  import 'package:uuid/uuid.dart';
  
  class OrderRepository {
    final ApiClient _apiClient;
    final NetworkInfo _networkInfo;
    final LocalDatabase _localDatabase;
    final CartRepository _cartRepository;
    final Uuid _uuid;
    
    OrderRepository({
      required ApiClient apiClient,
      required NetworkInfo networkInfo,
      required LocalDatabase localDatabase,
      required CartRepository cartRepository,
    }) : _apiClient = apiClient,
         _networkInfo = networkInfo,
         _localDatabase = localDatabase,
         _cartRepository = cartRepository,
         _uuid = const Uuid();
    
    // Place order
    Future<Map<String, dynamic>> placeOrder({
      required String addressId,
      required String paymentMethod,
      String? couponCode,
      String? notes,
    }) async {
      try {
        // Get cart items
        final cartItems = await _cartRepository.getCartItems();
        
        if (cartItems.isEmpty) {
          throw ValidationException('Cart is empty');
        }
        
        // Check internet connection
        if (!await _networkInfo.isConnected) {
          // Save order offline
          final orderId = _uuid.v4();
          final orderData = {
            'id': orderId,
            'addressId': addressId,
            'paymentMethod': paymentMethod,
            'couponCode': couponCode,
            'notes': notes,
            'items': cartItems.map((item) => item.toMap()).toList(),
            'createdAt': DateTime.now().toIso8601String(),
          };
          
          final db = await _localDatabase.database;
          await db.insert(
            'offline_orders',
            {
              'id': orderId,
              'data': jsonEncode(orderData),
              'status': 'pending',
              'created_at': DateTime.now().millisecondsSinceEpoch,
            },
          );
          
          // Clear cart
          await _cartRepository.clearCart();
          
          return {
            'id': orderId,
            'status': 'pending',
            'message': 'Order saved offline. It will be processed when you are back online.',
            'isOffline': true,
          };
        }
        
        // Place order online
        final response = await _apiClient.post(
          '/orders',
          data: {
            'addressId': addressId,
            'paymentMethod': paymentMethod,
            'couponCode': couponCode,
            'notes': notes,
            'items': cartItems.map((item) => {
              'productId': item.productId,
              'quantity': item.quantity,
              'price': item.price,
            }).toList(),
          },
        );
        
        // Clear cart
        await _cartRepository.clearCart();
        
        return response['data'];
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get order by ID
    Future<Map<String, dynamic>> getOrderById(String id) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/orders/$id');
        return response['data'];
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Get user orders
    Future<List<Map<String, dynamic>>> getUserOrders({int page = 1, int limit = 10}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get(
          '/orders',
          queryParameters: {
            'page': page,
            'limit': limit,
          },
        );
        
        return List<Map<String, dynamic>>.from(response['data']);
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Track order
    Future<Map<String, dynamic>> trackOrder(String id) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        final response = await _apiClient.get('/orders/$id/track');
        return response['data'];
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Cancel order
    Future<void> cancelOrder(String id, {String? reason}) async {
      try {
        if (!await _networkInfo.isConnected) {
          throw NetworkException('No internet connection');
        }
        
        await _apiClient.post(
          '/orders/$id/cancel',
          data: {
            'reason': reason,
          },
        );
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
    
    // Sync offline orders
    Future<void> syncOfflineOrders() async {
      try {
        if (!await _networkInfo.isConnected) {
          return;
        }
        
        final db = await _localDatabase.database;
        final offlineOrders = await db.query('offline_orders', where: 'status = ?', whereArgs: ['pending']);
        
        for (final order in offlineOrders) {
          try {
            final orderData = jsonDecode(order['data'] as String);
            
            // Place order online
            final response = await _apiClient.post(
              '/orders',
              data: {
                'id': orderData['id'],
                'addressId': orderData['addressId'],
                'paymentMethod': orderData['paymentMethod'],
                'couponCode': orderData['couponCode'],
                'notes': orderData['notes'],
                'items': (orderData['items'] as List).map((item) => {
                  'productId': item['product_id'],
                  'quantity': item['quantity'],
                  'price': item['price'],
                }).toList(),
                'createdAt': orderData['createdAt'],
              },
            );
            
            // Update offline order status
            await db.update(
              'offline_orders',
              {
                'status': 'synced',
                'data': jsonEncode({
                  ...orderData,
                  'onlineOrderId': response['data']['id'],
                }),
              },
              where: 'id = ?',
              whereArgs: [order['id']],
            );
          } catch (e) {
            // Update offline order status
            await db.update(
              'offline_orders',
              {'status': 'failed'},
              where: 'id = ?',
              whereArgs: [order['id']],
            );
          }
        }
      } catch (e) {
        throw ServerException(e.toString());
      }
    }
  }
  ```

## 4. UI Implementation

### 4.1. Common Widgets

- [ ] Create app bar widget:
  ```bash
  mkdir -p lib/src/presentation/widgets/common
  touch lib/src/presentation/widgets/common/app_bar.dart
  ```

- [ ] Implement app bar widget:
  ```dart
  // lib/src/presentation/widgets/common/app_bar.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  
  class OkadaAppBar extends StatelessWidget implements PreferredSizeWidget {
    final String title;
    final List<Widget>? actions;
    final bool showBackButton;
    final VoidCallback? onBackPressed;
    final Widget? leading;
    final bool centerTitle;
    final double elevation;
    final Color? backgroundColor;
    
    const OkadaAppBar({
      Key? key,
      required this.title,
      this.actions,
      this.showBackButton = true,
      this.onBackPressed,
      this.leading,
      this.centerTitle = true,
      this.elevation = 0,
      this.backgroundColor,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return AppBar(
        title: Text(title),
        actions: actions,
        leading: showBackButton
            ? leading ??
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios),
                  onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
                )
            : leading,
        centerTitle: centerTitle,
        elevation: elevation,
        backgroundColor: backgroundColor ?? AppColors.primary,
      );
    }
    
    @override
    Size get preferredSize => const Size.fromHeight(kToolbarHeight);
  }
  ```

- [ ] Create loading widget:
  ```bash
  touch lib/src/presentation/widgets/common/loading_widget.dart
  ```

- [ ] Implement loading widget:
  ```dart
  // lib/src/presentation/widgets/common/loading_widget.dart
  import 'package:flutter/material.dart';
  import 'package:flutter_spinkit/flutter_spinkit.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  
  class LoadingWidget extends StatelessWidget {
    final double size;
    final Color? color;
    
    const LoadingWidget({
      Key? key,
      this.size = 50.0,
      this.color,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return Center(
        child: SpinKitDoubleBounce(
          color: color ?? AppColors.primary,
          size: size,
        ),
      );
    }
  }
  ```

- [ ] Create error widget:
  ```bash
  touch lib/src/presentation/widgets/common/error_widget.dart
  ```

- [ ] Implement error widget:
  ```dart
  // lib/src/presentation/widgets/common/error_widget.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  
  class ErrorDisplayWidget extends StatelessWidget {
    final String message;
    final VoidCallback? onRetry;
    
    const ErrorDisplayWidget({
      Key? key,
      required this.message,
      this.onRetry,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                color: AppColors.error,
                size: 60,
              ),
              const SizedBox(height: 16),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                ),
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: onRetry,
                  child: const Text('Retry'),
                ),
              ],
            ],
          ),
        ),
      );
    }
  }
  ```

### 4.2. AI Feature Widgets

- [ ] Create voice search widget:
  ```bash
  mkdir -p lib/src/presentation/widgets/ai
  touch lib/src/presentation/widgets/ai/voice_search_widget.dart
  ```

- [ ] Implement voice search widget:
  ```dart
  // lib/src/presentation/widgets/ai/voice_search_widget.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:lottie/lottie.dart';
  
  class VoiceSearchWidget extends StatefulWidget {
    final AIFeaturesManager aiManager;
    final Function(String) onResult;
    final Function(String) onError;
    final String? language;
    
    const VoiceSearchWidget({
      Key? key,
      required this.aiManager,
      required this.onResult,
      required this.onError,
      this.language,
    }) : super(key: key);
    
    @override
    State<VoiceSearchWidget> createState() => _VoiceSearchWidgetState();
  }
  
  class _VoiceSearchWidgetState extends State<VoiceSearchWidget> with SingleTickerProviderStateMixin {
    bool _isListening = false;
    String _statusText = 'Tap to speak';
    late AnimationController _animationController;
    
    @override
    void initState() {
      super.initState();
      _animationController = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 2),
      );
    }
    
    @override
    void dispose() {
      _animationController.dispose();
      if (_isListening) {
        widget.aiManager.stopListening();
      }
      super.dispose();
    }
    
    void _toggleListening() async {
      if (_isListening) {
        setState(() {
          _isListening = false;
          _statusText = 'Processing...';
        });
        _animationController.stop();
        await widget.aiManager.stopListening();
      } else {
        final available = await widget.aiManager.initSpeechRecognition();
        if (available) {
          setState(() {
            _isListening = true;
            _statusText = 'Listening...';
          });
          _animationController.repeat();
          
          await widget.aiManager.startListening(
            onResult: (result) {
              setState(() {
                _isListening = false;
                _statusText = 'Tap to speak';
              });
              _animationController.stop();
              widget.onResult(result);
            },
            onError: (error) {
              setState(() {
                _isListening = false;
                _statusText = 'Tap to speak';
              });
              _animationController.stop();
              widget.onError(error);
            },
            language: widget.language,
          );
        } else {
          widget.onError('Speech recognition not available');
        }
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: _toggleListening,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _isListening ? AppColors.primary : AppColors.primary.withOpacity(0.8),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: _isListening
                  ? Lottie.asset(
                      'assets/animations/voice_animation.json',
                      controller: _animationController,
                      width: 60,
                      height: 60,
                    )
                  : const Icon(
                      Icons.mic,
                      color: Colors.white,
                      size: 40,
                    ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            _statusText,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 16,
            ),
          ),
        ],
      );
    }
  }
  ```

- [ ] Create image search widget:
  ```bash
  touch lib/src/presentation/widgets/ai/image_search_widget.dart
  ```

- [ ] Implement image search widget:
  ```dart
  // lib/src/presentation/widgets/ai/image_search_widget.dart
  import 'dart:io';
  
  import 'package:flutter/material.dart';
  import 'package:image_picker/image_picker.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  
  class ImageSearchWidget extends StatefulWidget {
    final AIFeaturesManager aiManager;
    final Function(Map<String, dynamic>) onResult;
    final Function(String) onError;
    
    const ImageSearchWidget({
      Key? key,
      required this.aiManager,
      required this.onResult,
      required this.onError,
    }) : super(key: key);
    
    @override
    State<ImageSearchWidget> createState() => _ImageSearchWidgetState();
  }
  
  class _ImageSearchWidgetState extends State<ImageSearchWidget> {
    bool _isProcessing = false;
    XFile? _image;
    final ImagePicker _picker = ImagePicker();
    
    Future<void> _getImage(ImageSource source) async {
      try {
        final XFile? image = await _picker.pickImage(
          source: source,
          maxWidth: 800,
          maxHeight: 800,
          imageQuality: 80,
        );
        
        if (image != null) {
          setState(() {
            _image = image;
            _isProcessing = true;
          });
          
          try {
            final result = await widget.aiManager.processImageSearch(
              imageFile: image,
            );
            
            widget.onResult(result);
          } catch (e) {
            widget.onError(e.toString());
          } finally {
            if (mounted) {
              setState(() {
                _isProcessing = false;
              });
            }
          }
        }
      } catch (e) {
        widget.onError('Failed to pick image: ${e.toString()}');
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_image != null && !_isProcessing)
            Container(
              width: 200,
              height: 200,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                image: DecorationImage(
                  image: FileImage(File(_image!.path)),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          if (_isProcessing) ...[
            const SizedBox(height: 16),
            const LoadingWidget(size: 40),
            const SizedBox(height: 16),
            Text(
              'Processing image...',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 16,
              ),
            ),
          ] else ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildOptionButton(
                  icon: Icons.camera_alt,
                  label: 'Take Photo',
                  onTap: () => _getImage(ImageSource.camera),
                ),
                const SizedBox(width: 24),
                _buildOptionButton(
                  icon: Icons.photo_library,
                  label: 'Gallery',
                  onTap: () => _getImage(ImageSource.gallery),
                ),
              ],
            ),
          ],
        ],
      );
    }
    
    Widget _buildOptionButton({
      required IconData icon,
      required String label,
      required VoidCallback onTap,
    }) {
      return GestureDetector(
        onTap: onTap,
        child: Column(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary,
              ),
              child: Icon(
                icon,
                color: Colors.white,
                size: 30,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }
  }
  ```

- [ ] Create AI recommendations widget:
  ```bash
  touch lib/src/presentation/widgets/ai/ai_recommendations_widget.dart
  ```

- [ ] Implement AI recommendations widget:
  ```dart
  // lib/src/presentation/widgets/ai/ai_recommendations_widget.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/models/product_model.dart';
  import 'package:okada_customer/src/data/repositories/product_repository.dart';
  import 'package:okada_customer/src/presentation/widgets/common/error_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/product/product_card.dart';
  
  class AIRecommendationsWidget extends StatefulWidget {
    final AIFeaturesManager aiManager;
    final ProductRepository productRepository;
    final String userId;
    final String? productId;
    final String title;
    final int limit;
    
    const AIRecommendationsWidget({
      Key? key,
      required this.aiManager,
      required this.productRepository,
      required this.userId,
      this.productId,
      required this.title,
      this.limit = 10,
    }) : super(key: key);
    
    @override
    State<AIRecommendationsWidget> createState() => _AIRecommendationsWidgetState();
  }
  
  class _AIRecommendationsWidgetState extends State<AIRecommendationsWidget> {
    late Future<List<ProductModel>> _recommendationsFuture;
    
    @override
    void initState() {
      super.initState();
      _loadRecommendations();
    }
    
    void _loadRecommendations() {
      _recommendationsFuture = _getRecommendations();
    }
    
    Future<List<ProductModel>> _getRecommendations() async {
      try {
        // Get recommended product IDs from AI Brain
        final recommendedIds = await widget.aiManager.getPersonalizedRecommendations(
          userId: widget.userId,
          productId: widget.productId,
          limit: widget.limit,
        );
        
        if (recommendedIds.isEmpty) {
          return [];
        }
        
        // Get product details for each ID
        final products = <ProductModel>[];
        for (final id in recommendedIds) {
          try {
            final product = await widget.productRepository.getProductById(id);
            products.add(product);
          } catch (e) {
            // Skip products that couldn't be fetched
            continue;
          }
        }
        
        return products;
      } catch (e) {
        throw Exception('Failed to load recommendations: ${e.toString()}');
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // Navigate to all recommendations
                  },
                  child: const Text('See All'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 220,
            child: FutureBuilder<List<ProductModel>>(
              future: _recommendationsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const LoadingWidget(size: 30);
                } else if (snapshot.hasError) {
                  return ErrorDisplayWidget(
                    message: 'Failed to load recommendations',
                    onRetry: () {
                      setState(() {
                        _loadRecommendations();
                      });
                    },
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                    child: Text('No recommendations available'),
                  );
                } else {
                  final products = snapshot.data!;
                  return ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: SizedBox(
                          width: 140,
                          child: ProductCard(
                            product: products[index],
                            onTap: () {
                              // Navigate to product details
                            },
                          ),
                        ),
                      );
                    },
                  );
                }
              },
            ),
          ),
        ],
      );
    }
  }
  ```

### 4.3. Main App Pages

- [ ] Create splash screen:
  ```bash
  mkdir -p lib/src/presentation/pages
  touch lib/src/presentation/pages/splash_screen.dart
  ```

- [ ] Implement splash screen:
  ```dart
  // lib/src/presentation/pages/splash_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  
  class SplashScreen extends StatefulWidget {
    final AuthRepository authRepository;
    
    const SplashScreen({
      Key? key,
      required this.authRepository,
    }) : super(key: key);
    
    @override
    State<SplashScreen> createState() => _SplashScreenState();
  }
  
  class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
    late AnimationController _animationController;
    late Animation<double> _fadeAnimation;
    
    @override
    void initState() {
      super.initState();
      _animationController = AnimationController(
        vsync: this,
        duration: const Duration(seconds: 2),
      );
      
      _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
          parent: _animationController,
          curve: Curves.easeIn,
        ),
      );
      
      _animationController.forward();
      
      _checkAuthStatus();
    }
    
    Future<void> _checkAuthStatus() async {
      await Future.delayed(const Duration(seconds: 2));
      
      final isSignedIn = await widget.authRepository.isSignedIn();
      
      if (mounted) {
        if (isSignedIn) {
          Navigator.of(context).pushReplacementNamed('/home');
        } else {
          Navigator.of(context).pushReplacementNamed('/onboarding');
        }
      }
    }
    
    @override
    void dispose() {
      _animationController.dispose();
      super.dispose();
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        backgroundColor: AppColors.primary,
        body: Center(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  'assets/images/logo.png',
                  width: 150,
                  height: 150,
                ),
                const SizedBox(height: 24),
                const Text(
                  'Okada',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Your Market, Delivered in Minutes',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }
  }
  ```

- [ ] Create onboarding screen:
  ```bash
  touch lib/src/presentation/pages/onboarding_screen.dart
  ```

- [ ] Implement onboarding screen:
  ```dart
  // lib/src/presentation/pages/onboarding_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/core/storage/preferences_service.dart';
  
  class OnboardingScreen extends StatefulWidget {
    final PreferencesService preferencesService;
    
    const OnboardingScreen({
      Key? key,
      required this.preferencesService,
    }) : super(key: key);
    
    @override
    State<OnboardingScreen> createState() => _OnboardingScreenState();
  }
  
  class _OnboardingScreenState extends State<OnboardingScreen> {
    final PageController _pageController = PageController();
    int _currentPage = 0;
    
    final List<Map<String, String>> _onboardingData = [
      {
        'title': 'Welcome to Okada',
        'description': 'Your market, delivered in minutes. Get fresh groceries and essentials delivered to your doorstep.',
        'image': 'assets/images/onboarding_1.png',
      },
      {
        'title': 'Fast Delivery',
        'description': 'Experience lightning-fast delivery within minutes. Our dark stores are strategically located to serve you quickly.',
        'image': 'assets/images/onboarding_2.png',
      },
      {
        'title': 'AI-Powered Experience',
        'description': 'Enjoy personalized recommendations and smart features powered by our AI Brain technology.',
        'image': 'assets/images/onboarding_3.png',
      },
    ];
    
    @override
    void dispose() {
      _pageController.dispose();
      super.dispose();
    }
    
    void _onPageChanged(int page) {
      setState(() {
        _currentPage = page;
      });
    }
    
    void _completeOnboarding() async {
      await widget.preferencesService.setOnboardingCompleted(true);
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/auth');
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: _onPageChanged,
                  itemCount: _onboardingData.length,
                  itemBuilder: (context, index) {
                    return _buildPage(
                      title: _onboardingData[index]['title']!,
                      description: _onboardingData[index]['description']!,
                      image: _onboardingData[index]['image']!,
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Page indicators
                    Row(
                      children: List.generate(
                        _onboardingData.length,
                        (index) => Container(
                          margin: const EdgeInsets.only(right: 8),
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _currentPage == index
                                ? AppColors.primary
                                : AppColors.divider,
                          ),
                        ),
                      ),
                    ),
                    // Next or Get Started button
                    ElevatedButton(
                      onPressed: () {
                        if (_currentPage == _onboardingData.length - 1) {
                          _completeOnboarding();
                        } else {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeIn,
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                      child: Text(
                        _currentPage == _onboardingData.length - 1
                            ? 'Get Started'
                            : 'Next',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    Widget _buildPage({
      required String title,
      required String description,
      required String image,
    }) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              image,
              height: 300,
            ),
            const SizedBox(height: 40),
            Text(
              title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              description,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
  }
  ```

- [ ] Create authentication screen:
  ```bash
  touch lib/src/presentation/pages/auth_screen.dart
  ```

- [ ] Implement authentication screen:
  ```dart
  // lib/src/presentation/pages/auth_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  
  class AuthScreen extends StatefulWidget {
    final AuthRepository authRepository;
    
    const AuthScreen({
      Key? key,
      required this.authRepository,
    }) : super(key: key);
    
    @override
    State<AuthScreen> createState() => _AuthScreenState();
  }
  
  class _AuthScreenState extends State<AuthScreen> {
    final _phoneController = TextEditingController();
    final _formKey = GlobalKey<FormState>();
    bool _isLoading = false;
    String? _errorMessage;
    
    @override
    void dispose() {
      _phoneController.dispose();
      super.dispose();
    }
    
    Future<void> _signInWithPhone() async {
      if (!_formKey.currentState!.validate()) {
        return;
      }
      
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      
      try {
        await widget.authRepository.signInWithPhone(
          phoneNumber: _phoneController.text,
          codeSent: (verificationId, resendToken) {
            setState(() {
              _isLoading = false;
            });
            
            Navigator.of(context).pushNamed(
              '/verify-phone',
              arguments: {
                'verificationId': verificationId,
                'phoneNumber': _phoneController.text,
                'resendToken': resendToken,
              },
            );
          },
          verificationCompleted: (user) {
            setState(() {
              _isLoading = false;
            });
            
            Navigator.of(context).pushReplacementNamed('/home');
          },
          verificationFailed: (error) {
            setState(() {
              _isLoading = false;
              _errorMessage = error;
            });
          },
          codeAutoRetrievalTimeout: (verificationId) {
            // Auto retrieval timeout
          },
        );
      } catch (e) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
    
    Future<void> _signInWithGoogle() async {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      
      try {
        await widget.authRepository.signInWithGoogle();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } catch (e) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),
                  Image.asset(
                    'assets/images/logo.png',
                    height: 100,
                  ),
                  const SizedBox(height: 40),
                  const Text(
                    'Welcome to Okada',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sign in to continue',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: const InputDecoration(
                            labelText: 'Phone Number',
                            hintText: '+237 6XX XXX XXX',
                            prefixIcon: Icon(Icons.phone),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter your phone number';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        if (_errorMessage != null) ...[
                          Text(
                            _errorMessage!,
                            style: TextStyle(
                              color: AppColors.error,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                        ],
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _signInWithPhone,
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text('Continue'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      const Expanded(child: Divider()),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'OR',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      const Expanded(child: Divider()),
                    ],
                  ),
                  const SizedBox(height: 24),
                  OutlinedButton.icon(
                    onPressed: _isLoading ? null : _signInWithGoogle,
                    icon: Image.asset(
                      'assets/icons/google_icon.png',
                      height: 24,
                    ),
                    label: const Text('Continue with Google'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 40),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                      children: [
                        const TextSpan(
                          text: 'By continuing, you agree to our ',
                        ),
                        TextSpan(
                          text: 'Terms of Service',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const TextSpan(
                          text: ' and ',
                        ),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }
  }
  ```

- [ ] Create home screen:
  ```bash
  touch lib/src/presentation/pages/home_screen.dart
  ```

- [ ] Implement home screen:
  ```dart
  // lib/src/presentation/pages/home_screen.dart
  import 'package:flutter/material.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/models/user_model.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  import 'package:okada_customer/src/data/repositories/product_repository.dart';
  import 'package:okada_customer/src/presentation/widgets/ai/ai_recommendations_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/ai/voice_search_widget.dart';
  import 'package:okada_customer/src/presentation/widgets/common/loading_widget.dart';
  
  class HomeScreen extends StatefulWidget {
    final AuthRepository authRepository;
    final ProductRepository productRepository;
    final AIFeaturesManager aiManager;
    
    const HomeScreen({
      Key? key,
      required this.authRepository,
      required this.productRepository,
      required this.aiManager,
    }) : super(key: key);
    
    @override
    State<HomeScreen> createState() => _HomeScreenState();
  }
  
  class _HomeScreenState extends State<HomeScreen> {
    late Future<UserModel?> _userFuture;
    late Future<List<dynamic>> _homeFuture;
    bool _isVoiceSearchActive = false;
    
    @override
    void initState() {
      super.initState();
      _userFuture = widget.authRepository.getCurrentUser();
      _loadHomeData();
    }
    
    void _loadHomeData() {
      _homeFuture = Future.wait([
        widget.productRepository.getFeaturedProducts(),
        widget.productRepository.getCategories(),
        widget.productRepository.getRecentlyViewedProducts(),
      ]);
    }
    
    void _handleVoiceSearchResult(String result) {
      setState(() {
        _isVoiceSearchActive = false;
      });
      
      if (result.isNotEmpty) {
        Navigator.of(context).pushNamed(
          '/search',
          arguments: {'query': result},
        );
      }
    }
    
    void _handleVoiceSearchError(String error) {
      setState(() {
        _isVoiceSearchActive = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Voice search error: $error'),
          backgroundColor: AppColors.error,
        ),
      );
    }
    
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        appBar: AppBar(
          title: Image.asset(
            'assets/images/logo_horizontal.png',
            height: 30,
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                Navigator.of(context).pushNamed('/search');
              },
            ),
            IconButton(
              icon: const Icon(Icons.mic),
              onPressed: () {
                setState(() {
                  _isVoiceSearchActive = true;
                });
                showModalBottomSheet(
                  context: context,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(20),
                    ),
                  ),
                  builder: (context) {
                    return Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: VoiceSearchWidget(
                        aiManager: widget.aiManager,
                        onResult: _handleVoiceSearchResult,
                        onError: _handleVoiceSearchError,
                      ),
                    );
                  },
                ).then((_) {
                  setState(() {
                    _isVoiceSearchActive = false;
                  });
                });
              },
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: () async {
            setState(() {
              _loadHomeData();
            });
          },
          child: FutureBuilder<UserModel?>(
            future: _userFuture,
            builder: (context, userSnapshot) {
              if (userSnapshot.connectionState == ConnectionState.waiting) {
                return const LoadingWidget();
              }
              
              final user = userSnapshot.data;
              
              return FutureBuilder<List<dynamic>>(
                future: _homeFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const LoadingWidget();
                  } else if (snapshot.hasError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Error loading data: ${snapshot.error}',
                            style: TextStyle(color: AppColors.error),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              setState(() {
                                _loadHomeData();
                              });
                            },
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    );
                  }
                  
                  final featuredProducts = snapshot.data![0];
                  final categories = snapshot.data![1];
                  final recentlyViewed = snapshot.data![2];
                  
                  return ListView(
                    children: [
                      // Address bar
                      Container(
                        padding: const EdgeInsets.all(16),
                        color: AppColors.primary.withOpacity(0.1),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              color: AppColors.primary,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Delivery to',
                                    style: TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const Text(
                                    'Douala, Cameroon',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pushNamed('/addresses');
                              },
                              child: const Text('Change'),
                            ),
                          ],
                        ),
                      ),
                      
                      // Welcome message
                      if (user != null)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'Welcome, ${user.firstName}!',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      
                      // AI Recommendations
                      if (user != null)
                        AIRecommendationsWidget(
                          aiManager: widget.aiManager,
                          productRepository: widget.productRepository,
                          userId: user.id,
                          title: 'Recommended for You',
                        ),
                      
                      // Categories
                      _buildCategoriesSection(categories),
                      
                      // Featured Products
                      _buildProductsSection(
                        title: 'Featured Products',
                        products: featuredProducts,
                      ),
                      
                      // Recently Viewed
                      if (recentlyViewed.isNotEmpty)
                        _buildProductsSection(
                          title: 'Recently Viewed',
                          products: recentlyViewed,
                        ),
                    ],
                  );
                },
              );
            },
          ),
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.category),
              label: 'Categories',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_cart),
              label: 'Cart',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
          onTap: (index) {
            switch (index) {
              case 0:
                // Already on home
                break;
              case 1:
                Navigator.of(context).pushNamed('/categories');
                break;
              case 2:
                Navigator.of(context).pushNamed('/cart');
                break;
              case 3:
                Navigator.of(context).pushNamed('/profile');
                break;
            }
          },
        ),
      );
    }
    
    Widget _buildCategoriesSection(List<dynamic> categories) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Categories',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pushNamed('/categories');
                  },
                  child: const Text('See All'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final category = categories[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.of(context).pushNamed(
                      '/category',
                      arguments: {'category': category},
                    );
                  },
                  child: Container(
                    width: 80,
                    margin: const EdgeInsets.only(right: 12),
                    child: Column(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: category.imageUrl != null
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(30),
                                  child: Image.network(
                                    category.imageUrl!,
                                    fit: BoxFit.cover,
                                  ),
                                )
                              : Icon(
                                  Icons.category,
                                  color: AppColors.primary,
                                ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          category.name,
                          style: const TextStyle(fontSize: 12),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      );
    }
    
    Widget _buildProductsSection({
      required String title,
      required List<dynamic> products,
    }) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // Navigate to all products
                  },
                  child: const Text('See All'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.of(context).pushNamed(
                      '/product',
                      arguments: {'product': product},
                    );
                  },
                  child: Container(
                    width: 140,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.divider),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(8),
                          ),
                          child: product.primaryImageUrl != null
                              ? Image.network(
                                  product.primaryImageUrl!,
                                  height: 120,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                )
                              : Container(
                                  height: 120,
                                  color: AppColors.divider,
                                  child: const Icon(Icons.image),
                                ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                product.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '\$${product.currentPrice.toStringAsFixed(2)}',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (product.isOnSale) ...[
                                const SizedBox(height: 2),
                                Text(
                                  '\$${product.price.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: AppColors.textSecondary,
                                    decoration: TextDecoration.lineThrough,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      );
    }
  }
  ```

## 5. Main App Entry Point

- [ ] Create main.dart file:
  ```bash
  touch lib/main.dart
  ```

- [ ] Implement main.dart:
  ```dart
  // lib/main.dart
  import 'package:flutter/material.dart';
  import 'package:flutter/services.dart';
  import 'package:flutter_dotenv/flutter_dotenv.dart';
  import 'package:firebase_core/firebase_core.dart';
  import 'package:connectivity_plus/connectivity_plus.dart';
  import 'package:dio/dio.dart';
  import 'package:shared_preferences/shared_preferences.dart';
  import 'package:okada_customer/src/core/ai/ai_brain_client.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/core/ai/offline_ai_service.dart';
  import 'package:okada_customer/src/core/localization/app_localizations.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/network/network_info.dart';
  import 'package:okada_customer/src/core/storage/local_database.dart';
  import 'package:okada_customer/src/core/storage/preferences_service.dart';
  import 'package:okada_customer/src/core/storage/secure_storage.dart';
  import 'package:okada_customer/src/core/theme/app_theme.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  import 'package:okada_customer/src/data/repositories/cart_repository.dart';
  import 'package:okada_customer/src/data/repositories/product_repository.dart';
  import 'package:okada_customer/src/presentation/pages/splash_screen.dart';
  import 'package:okada_customer/src/presentation/pages/onboarding_screen.dart';
  import 'package:okada_customer/src/presentation/pages/auth_screen.dart';
  import 'package:okada_customer/src/presentation/pages/home_screen.dart';
  
  void main() async {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Load environment variables
    await dotenv.load();
    
    // Initialize Firebase
    await Firebase.initializeApp();
    
    // Set preferred orientations
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    
    // Initialize services
    final sharedPreferences = await SharedPreferences.getInstance();
    final preferencesService = PreferencesService(sharedPreferences);
    
    final connectivity = Connectivity();
    final networkInfo = NetworkInfoImpl(connectivity);
    
    final secureStorage = SecureStorageService();
    
    final apiClient = ApiClient(
      dio: Dio(),
      networkInfo: networkInfo,
    );
    
    final aiBrainClient = AIBrainClient(
      dio: Dio(),
      networkInfo: networkInfo,
    );
    
    final localDatabase = LocalDatabase();
    final cartDao = CartDao(localDatabase);
    final recentlyViewedDao = RecentlyViewedDao(localDatabase);
    final offlineAIModelsDao = OfflineAIModelsDao(localDatabase);
    
    final offlineAIService = OfflineAIService(offlineAIModelsDao);
    
    final aiManager = AIFeaturesManager(
      aiBrainClient: aiBrainClient,
      offlineAIService: offlineAIService,
      networkInfo: networkInfo,
      preferencesService: preferencesService,
    );
    
    final authRepository = AuthRepository(
      firebaseAuth: FirebaseAuth.instance,
      googleSignIn: GoogleSignIn(),
      apiClient: apiClient,
      secureStorage: secureStorage,
    );
    
    final productRepository = ProductRepository(
      apiClient: apiClient,
      networkInfo: networkInfo,
      localDatabase: localDatabase,
      recentlyViewedDao: recentlyViewedDao,
    );
    
    final cartRepository = CartRepository(
      cartDao: cartDao,
    );
    
    // Check if token exists and set it to API client
    final token = await secureStorage.getAuthToken();
    if (token != null) {
      apiClient.setAuthToken(token);
    }
    
    // Get user language preference
    final language = preferencesService.getLanguage();
    
    runApp(OkadaApp(
      preferencesService: preferencesService,
      authRepository: authRepository,
      productRepository: productRepository,
      cartRepository: cartRepository,
      aiManager: aiManager,
      initialLanguage: language,
    ));
  }
  
  class OkadaApp extends StatelessWidget {
    final PreferencesService preferencesService;
    final AuthRepository authRepository;
    final ProductRepository productRepository;
    final CartRepository cartRepository;
    final AIFeaturesManager aiManager;
    final String initialLanguage;
    
    const OkadaApp({
      Key? key,
      required this.preferencesService,
      required this.authRepository,
      required this.productRepository,
      required this.cartRepository,
      required this.aiManager,
      required this.initialLanguage,
    }) : super(key: key);
    
    @override
    Widget build(BuildContext context) {
      return MaterialApp(
        title: 'Okada',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en', ''),
          Locale('fr', ''),
        ],
        locale: Locale(initialLanguage),
        home: SplashScreen(authRepository: authRepository),
        routes: {
          '/onboarding': (context) => OnboardingScreen(
                preferencesService: preferencesService,
              ),
          '/auth': (context) => AuthScreen(
                authRepository: authRepository,
              ),
          '/home': (context) => HomeScreen(
                authRepository: authRepository,
                productRepository: productRepository,
                aiManager: aiManager,
              ),
          // Add other routes here
        },
      );
    }
  }
  ```

## 6. Testing

### 6.1. Unit Tests

- [ ] Create test directory:
  ```bash
  mkdir -p test/unit
  ```

- [ ] Create auth repository test:
  ```bash
  touch test/unit/auth_repository_test.dart
  ```

- [ ] Implement auth repository test:
  ```dart
  // test/unit/auth_repository_test.dart
  import 'package:flutter_test/flutter_test.dart';
  import 'package:mockito/mockito.dart';
  import 'package:mockito/annotations.dart';
  import 'package:firebase_auth/firebase_auth.dart';
  import 'package:google_sign_in/google_sign_in.dart';
  import 'package:okada_customer/src/core/network/api_client.dart';
  import 'package:okada_customer/src/core/storage/secure_storage.dart';
  import 'package:okada_customer/src/data/repositories/auth_repository.dart';
  
  @GenerateMocks([
    FirebaseAuth,
    GoogleSignIn,
    ApiClient,
    SecureStorageService,
    UserCredential,
    User,
  ])
  void main() {
    late AuthRepository authRepository;
    late MockFirebaseAuth mockFirebaseAuth;
    late MockGoogleSignIn mockGoogleSignIn;
    late MockApiClient mockApiClient;
    late MockSecureStorageService mockSecureStorage;
    
    setUp(() {
      mockFirebaseAuth = MockFirebaseAuth();
      mockGoogleSignIn = MockGoogleSignIn();
      mockApiClient = MockApiClient();
      mockSecureStorage = MockSecureStorageService();
      
      authRepository = AuthRepository(
        firebaseAuth: mockFirebaseAuth,
        googleSignIn: mockGoogleSignIn,
        apiClient: mockApiClient,
        secureStorage: mockSecureStorage,
      );
    });
    
    group('isSignedIn', () {
      test('should return true when token exists', () async {
        // Arrange
        when(mockSecureStorage.getAuthToken()).thenAnswer((_) async => 'token');
        
        // Act
        final result = await authRepository.isSignedIn();
        
        // Assert
        expect(result, true);
        verify(mockSecureStorage.getAuthToken()).called(1);
      });
      
      test('should return false when token does not exist', () async {
        // Arrange
        when(mockSecureStorage.getAuthToken()).thenAnswer((_) async => null);
        
        // Act
        final result = await authRepository.isSignedIn();
        
        // Assert
        expect(result, false);
        verify(mockSecureStorage.getAuthToken()).called(1);
      });
    });
    
    // Add more tests for other methods
  }
  ```

### 6.2. Widget Tests

- [ ] Create widget test directory:
  ```bash
  mkdir -p test/widget
  ```

- [ ] Create voice search widget test:
  ```bash
  touch test/widget/voice_search_widget_test.dart
  ```

- [ ] Implement voice search widget test:
  ```dart
  // test/widget/voice_search_widget_test.dart
  import 'package:flutter/material.dart';
  import 'package:flutter_test/flutter_test.dart';
  import 'package:mockito/mockito.dart';
  import 'package:mockito/annotations.dart';
  import 'package:okada_customer/src/core/ai/ai_features_manager.dart';
  import 'package:okada_customer/src/presentation/widgets/ai/voice_search_widget.dart';
  
  @GenerateMocks([AIFeaturesManager])
  void main() {
    late MockAIFeaturesManager mockAiManager;
    
    setUp(() {
      mockAiManager = MockAIFeaturesManager();
    });
    
    testWidgets('VoiceSearchWidget displays correctly', (WidgetTester tester) async {
      // Arrange
      when(mockAiManager.initSpeechRecognition()).thenAnswer((_) async => true);
      
      // Act
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: VoiceSearchWidget(
              aiManager: mockAiManager,
              onResult: (result) {},
              onError: (error) {},
            ),
          ),
        ),
      );
      
      // Assert
      expect(find.text('Tap to speak'), findsOneWidget);
      expect(find.byIcon(Icons.mic), findsOneWidget);
    });
    
    // Add more widget tests
  }
  ```

### 6.3. Integration Tests

- [ ] Create integration test directory:
  ```bash
  mkdir -p integration_test
  ```

- [ ] Create app test:
  ```bash
  touch integration_test/app_test.dart
  ```

- [ ] Implement app test:
  ```dart
  // integration_test/app_test.dart
  import 'package:flutter_test/flutter_test.dart';
  import 'package:integration_test/integration_test.dart';
  import 'package:okada_customer/main.dart' as app;
  
  void main() {
    IntegrationTestWidgetsFlutterBinding.ensureInitialized();
    
    group('end-to-end test', () {
      testWidgets('tap on the floating action button, verify counter',
          (tester) async {
        // Load app widget
        app.main();
        
        // Wait for app to load
        await tester.pumpAndSettle();
        
        // Verify splash screen is displayed
        expect(find.byType(app.SplashScreen), findsOneWidget);
        
        // Wait for navigation
        await tester.pumpAndSettle(const Duration(seconds: 3));
        
        // Add more test steps
      });
    });
  }
  ```

## 7. Build and Deploy

### 7.1. Build Configuration

- [ ] Create build configuration for Android:
  ```bash
  touch android/app/build.gradle
  ```

- [ ] Update Android build configuration:
  ```gradle
  // android/app/build.gradle
  def localProperties = new Properties()
  def localPropertiesFile = rootProject.file('local.properties')
  if (localPropertiesFile.exists()) {
      localPropertiesFile.withReader('UTF-8') { reader ->
          localProperties.load(reader)
      }
  }
  
  def flutterRoot = localProperties.getProperty('flutter.sdk')
  if (flutterRoot == null) {
      throw new GradleException("Flutter SDK not found. Define location with flutter.sdk in the local.properties file.")
  }
  
  def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
  if (flutterVersionCode == null) {
      flutterVersionCode = '1'
  }
  
  def flutterVersionName = localProperties.getProperty('flutter.versionName')
  if (flutterVersionName == null) {
      flutterVersionName = '1.0'
  }
  
  apply plugin: 'com.android.application'
  apply plugin: 'kotlin-android'
  apply from: "$flutterRoot/packages/flutter_tools/gradle/flutter.gradle"
  apply plugin: 'com.google.gms.google-services'
  
  android {
      compileSdkVersion 33
      
      compileOptions {
          sourceCompatibility JavaVersion.VERSION_1_8
          targetCompatibility JavaVersion.VERSION_1_8
      }
      
      kotlinOptions {
          jvmTarget = '1.8'
      }
      
      sourceSets {
          main.java.srcDirs += 'src/main/kotlin'
      }
      
      defaultConfig {
          applicationId "com.okada.customer"
          minSdkVersion 21
          targetSdkVersion 33
          versionCode flutterVersionCode.toInteger()
          versionName flutterVersionName
          multiDexEnabled true
      }
      
      buildTypes {
          release {
              signingConfig signingConfigs.debug
              minifyEnabled true
              shrinkResources true
              proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
          }
      }
  }
  
  flutter {
      source '../..'
  }
  
  dependencies {
      implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
      implementation platform('com.google.firebase:firebase-bom:30.0.0')
      implementation 'com.google.firebase:firebase-analytics'
      implementation 'com.android.support:multidex:1.0.3'
  }
  ```

### 7.2. Release Commands

- [ ] Create release build script:
  ```bash
  touch build_release.sh
  ```

- [ ] Implement release build script:
  ```bash
  #!/bin/bash
  
  # Generate app icons
  flutter pub run flutter_launcher_icons
  
  # Generate splash screen
  flutter pub run flutter_native_splash:create
  
  # Build Android release
  flutter build apk --release
  
  # Build iOS release
  # flutter build ios --release
  
  echo "Build completed successfully!"
  ```

- [ ] Make script executable:
  ```bash
  chmod +x build_release.sh
  ```

## 8. Documentation

### 8.1. Create README.md

- [ ] Create README.md:
  ```bash
  touch README.md
  ```

- [ ] Implement README.md:
  ```markdown
  # Okada Customer App
  
  A Flutter-based quick commerce application for the Okada platform in Cameroon.
  
  ## Features
  
  - AI-powered personalized recommendations
  - Voice search and image search capabilities
  - Offline functionality for low-connectivity areas
  - Multi-language support (English and French)
  - Dark store-based quick commerce model
  
  ## Getting Started
  
  ### Prerequisites
  
  - Flutter SDK (3.0.0 or higher)
  - Dart SDK (3.0.0 or higher)
  - Android Studio / Xcode
  - Firebase project
  
  ### Installation
  
  1. Clone the repository:
  
  ```bash
  git clone https://github.com/okada/customer-app.git
  cd customer-app
  ```
  
  2. Install dependencies:
  
  ```bash
  flutter pub get
  ```
  
  3. Create a `.env` file in the root directory with the following content:
  
  ```
  API_URL=https://api.okada.com
  GOOGLE_MAPS_API_KEY=your_google_maps_api_key
  AI_BRAIN_URL=https://ai-brain.okada.com
  AI_BRAIN_API_KEY=your_ai_brain_api_key
  ```
  
  4. Run the app:
  
  ```bash
  flutter run
  ```
  
  ## Architecture
  
  The app follows a clean architecture approach with the following layers:
  
  - **Presentation**: UI components, screens, and widgets
  - **Domain**: Business logic and use cases
  - **Data**: Repositories, data sources, and models
  - **Core**: Shared utilities, services, and configurations
  
  ## AI Features
  
  The app includes several AI-powered features:
  
  - **Personalized Recommendations**: AI-driven product recommendations based on user behavior

