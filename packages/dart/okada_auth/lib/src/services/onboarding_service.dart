import 'dart:async';

/// Service for managing onboarding flow
class OnboardingService {
  /// Storage key for onboarding completion status
  static const String _completedKey = 'onboarding_completed';
  
  /// Storage key for current onboarding step
  static const String _currentStepKey = 'onboarding_current_step';
  
  /// Storage key for onboarding version
  static const String _versionKey = 'onboarding_version';
  
  /// Current onboarding version (increment to show onboarding again after updates)
  static const int currentVersion = 1;
  
  /// Onboarding pages configuration
  static const List<OnboardingPage> pages = [
    OnboardingPage(
      id: 'welcome',
      titleEn: 'Welcome to Okada',
      titleFr: 'Bienvenue sur Okada',
      descriptionEn: 'Your AI-powered quick commerce platform for Africa. Get anything delivered in minutes.',
      descriptionFr: 'Votre plateforme de commerce rapide alimentée par l\'IA pour l\'Afrique. Faites-vous livrer n\'importe quoi en quelques minutes.',
      imagePath: 'assets/onboarding/welcome.png',
      animationPath: 'assets/animations/welcome.json',
      backgroundColor: 0xFF1A5F2A, // Okada green
    ),
    OnboardingPage(
      id: 'discover',
      titleEn: 'Discover Local Stores',
      titleFr: 'Découvrez les Boutiques Locales',
      descriptionEn: 'Browse thousands of products from stores near you. Support local businesses while getting what you need.',
      descriptionFr: 'Parcourez des milliers de produits des boutiques près de chez vous. Soutenez les entreprises locales tout en obtenant ce dont vous avez besoin.',
      imagePath: 'assets/onboarding/discover.png',
      animationPath: 'assets/animations/discover.json',
      backgroundColor: 0xFF2196F3, // Blue
    ),
    OnboardingPage(
      id: 'delivery',
      titleEn: 'Lightning Fast Delivery',
      titleFr: 'Livraison Ultra Rapide',
      descriptionEn: 'Our network of Okada riders ensures your orders arrive in 15-30 minutes. Track in real-time.',
      descriptionFr: 'Notre réseau de livreurs Okada garantit que vos commandes arrivent en 15-30 minutes. Suivez en temps réel.',
      imagePath: 'assets/onboarding/delivery.png',
      animationPath: 'assets/animations/delivery.json',
      backgroundColor: 0xFFFF9800, // Orange
    ),
    OnboardingPage(
      id: 'payment',
      titleEn: 'Easy Mobile Payments',
      titleFr: 'Paiements Mobiles Faciles',
      descriptionEn: 'Pay with MTN Mobile Money, Orange Money, or cash on delivery. Secure and convenient.',
      descriptionFr: 'Payez avec MTN Mobile Money, Orange Money, ou en espèces à la livraison. Sécurisé et pratique.',
      imagePath: 'assets/onboarding/payment.png',
      animationPath: 'assets/animations/payment.json',
      backgroundColor: 0xFF9C27B0, // Purple
    ),
    OnboardingPage(
      id: 'ai_assistant',
      titleEn: 'AI Shopping Assistant',
      titleFr: 'Assistant Shopping IA',
      descriptionEn: 'Get personalized recommendations and voice-powered shopping. Just tell us what you need!',
      descriptionFr: 'Obtenez des recommandations personnalisées et faites vos achats par la voix. Dites-nous simplement ce dont vous avez besoin!',
      imagePath: 'assets/onboarding/ai.png',
      animationPath: 'assets/animations/ai.json',
      backgroundColor: 0xFF00BCD4, // Cyan
    ),
  ];
  
  /// Storage interface (to be injected)
  final OnboardingStorage _storage;
  
  /// Current onboarding state
  OnboardingState _state = const OnboardingState();
  
  /// State change stream controller
  final _stateController = StreamController<OnboardingState>.broadcast();
  
  /// Stream of state changes
  Stream<OnboardingState> get stateStream => _stateController.stream;
  
  /// Get current state
  OnboardingState get state => _state;
  
  OnboardingService({required OnboardingStorage storage}) : _storage = storage;
  
  /// Initialize onboarding service
  Future<void> init() async {
    final completed = await _storage.getBool(_completedKey) ?? false;
    final currentStep = await _storage.getInt(_currentStepKey) ?? 0;
    final version = await _storage.getInt(_versionKey) ?? 0;
    
    // Check if onboarding needs to be shown again (new version)
    final shouldShowOnboarding = !completed || version < currentVersion;
    
    _state = OnboardingState(
      isCompleted: !shouldShowOnboarding && completed,
      currentStep: shouldShowOnboarding ? 0 : currentStep,
      totalSteps: pages.length,
      version: currentVersion,
    );
    
    _stateController.add(_state);
  }
  
  /// Check if onboarding should be shown
  bool get shouldShowOnboarding => !_state.isCompleted;
  
  /// Get current page
  OnboardingPage? get currentPage {
    if (_state.currentStep >= 0 && _state.currentStep < pages.length) {
      return pages[_state.currentStep];
    }
    return null;
  }
  
  /// Move to next step
  void nextStep() {
    if (_state.currentStep < pages.length - 1) {
      _state = _state.copyWith(currentStep: _state.currentStep + 1);
      _storage.setInt(_currentStepKey, _state.currentStep);
      _stateController.add(_state);
    } else {
      completeOnboarding();
    }
  }
  
  /// Move to previous step
  void previousStep() {
    if (_state.currentStep > 0) {
      _state = _state.copyWith(currentStep: _state.currentStep - 1);
      _storage.setInt(_currentStepKey, _state.currentStep);
      _stateController.add(_state);
    }
  }
  
  /// Go to specific step
  void goToStep(int step) {
    if (step >= 0 && step < pages.length) {
      _state = _state.copyWith(currentStep: step);
      _storage.setInt(_currentStepKey, _state.currentStep);
      _stateController.add(_state);
    }
  }
  
  /// Skip onboarding
  void skipOnboarding() {
    completeOnboarding();
  }
  
  /// Complete onboarding
  void completeOnboarding() {
    _state = _state.copyWith(
      isCompleted: true,
      currentStep: pages.length - 1,
    );
    _storage.setBool(_completedKey, true);
    _storage.setInt(_versionKey, currentVersion);
    _stateController.add(_state);
  }
  
  /// Reset onboarding (for testing or re-showing)
  Future<void> resetOnboarding() async {
    await _storage.remove(_completedKey);
    await _storage.remove(_currentStepKey);
    await _storage.remove(_versionKey);
    
    _state = const OnboardingState(
      isCompleted: false,
      currentStep: 0,
      totalSteps: 5,
      version: currentVersion,
    );
    _stateController.add(_state);
  }
  
  /// Dispose resources
  void dispose() {
    _stateController.close();
  }
}

/// Onboarding page configuration
class OnboardingPage {
  /// Unique identifier
  final String id;
  
  /// Title in English
  final String titleEn;
  
  /// Title in French
  final String titleFr;
  
  /// Description in English
  final String descriptionEn;
  
  /// Description in French
  final String descriptionFr;
  
  /// Path to static image
  final String imagePath;
  
  /// Path to Lottie animation (optional)
  final String? animationPath;
  
  /// Background color (ARGB)
  final int backgroundColor;
  
  /// Whether this page has an action button
  final bool hasAction;
  
  /// Action button text (English)
  final String? actionTextEn;
  
  /// Action button text (French)
  final String? actionTextFr;
  
  const OnboardingPage({
    required this.id,
    required this.titleEn,
    required this.titleFr,
    required this.descriptionEn,
    required this.descriptionFr,
    required this.imagePath,
    this.animationPath,
    required this.backgroundColor,
    this.hasAction = false,
    this.actionTextEn,
    this.actionTextFr,
  });
  
  /// Get title based on locale
  String getTitle(String languageCode) {
    return languageCode == 'fr' ? titleFr : titleEn;
  }
  
  /// Get description based on locale
  String getDescription(String languageCode) {
    return languageCode == 'fr' ? descriptionFr : descriptionEn;
  }
  
  /// Get action text based on locale
  String? getActionText(String languageCode) {
    if (!hasAction) return null;
    return languageCode == 'fr' ? actionTextFr : actionTextEn;
  }
}

/// Onboarding state
class OnboardingState {
  /// Whether onboarding is completed
  final bool isCompleted;
  
  /// Current step index
  final int currentStep;
  
  /// Total number of steps
  final int totalSteps;
  
  /// Onboarding version
  final int version;
  
  const OnboardingState({
    this.isCompleted = false,
    this.currentStep = 0,
    this.totalSteps = 5,
    this.version = 1,
  });
  
  /// Whether this is the first step
  bool get isFirstStep => currentStep == 0;
  
  /// Whether this is the last step
  bool get isLastStep => currentStep == totalSteps - 1;
  
  /// Progress percentage (0.0 to 1.0)
  double get progress => totalSteps > 0 ? (currentStep + 1) / totalSteps : 0;
  
  /// Copy with new values
  OnboardingState copyWith({
    bool? isCompleted,
    int? currentStep,
    int? totalSteps,
    int? version,
  }) {
    return OnboardingState(
      isCompleted: isCompleted ?? this.isCompleted,
      currentStep: currentStep ?? this.currentStep,
      totalSteps: totalSteps ?? this.totalSteps,
      version: version ?? this.version,
    );
  }
}

/// Storage interface for onboarding persistence
abstract class OnboardingStorage {
  Future<bool?> getBool(String key);
  Future<int?> getInt(String key);
  Future<void> setBool(String key, bool value);
  Future<void> setInt(String key, int value);
  Future<void> remove(String key);
}

/// In-memory implementation for testing
class InMemoryOnboardingStorage implements OnboardingStorage {
  final Map<String, dynamic> _data = {};
  
  @override
  Future<bool?> getBool(String key) async => _data[key] as bool?;
  
  @override
  Future<int?> getInt(String key) async => _data[key] as int?;
  
  @override
  Future<void> setBool(String key, bool value) async => _data[key] = value;
  
  @override
  Future<void> setInt(String key, int value) async => _data[key] = value;
  
  @override
  Future<void> remove(String key) async => _data.remove(key);
}
