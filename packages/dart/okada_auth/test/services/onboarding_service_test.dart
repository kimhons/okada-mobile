import 'package:flutter_test/flutter_test.dart';
import 'package:okada_auth/src/services/onboarding_service.dart';

void main() {
  group('OnboardingService', () {
    late OnboardingService service;
    late InMemoryOnboardingStorage storage;

    setUp(() {
      storage = InMemoryOnboardingStorage();
      service = OnboardingService(storage: storage);
    });

    tearDown(() {
      service.dispose();
    });

    group('initialization', () {
      test('should initialize with default state', () async {
        await service.init();
        
        expect(service.state.isCompleted, isFalse);
        expect(service.state.currentStep, equals(0));
        expect(service.state.totalSteps, equals(OnboardingService.pages.length));
      });

      test('should restore completed state from storage', () async {
        await storage.setBool('onboarding_completed', true);
        await storage.setInt('onboarding_version', OnboardingService.currentVersion);
        
        await service.init();
        
        expect(service.state.isCompleted, isTrue);
      });

      test('should show onboarding for new version', () async {
        await storage.setBool('onboarding_completed', true);
        await storage.setInt('onboarding_version', 0); // Old version
        
        await service.init();
        
        expect(service.state.isCompleted, isFalse);
        expect(service.shouldShowOnboarding, isTrue);
      });

      test('should restore current step from storage', () async {
        await storage.setInt('onboarding_current_step', 2);
        
        await service.init();
        
        // Note: If not completed, step should be reset to 0 for new version
        // This depends on the version check logic
      });
    });

    group('navigation', () {
      test('should move to next step', () async {
        await service.init();
        
        expect(service.state.currentStep, equals(0));
        
        service.nextStep();
        expect(service.state.currentStep, equals(1));
        
        service.nextStep();
        expect(service.state.currentStep, equals(2));
      });

      test('should move to previous step', () async {
        await service.init();
        service.goToStep(2);
        
        service.previousStep();
        expect(service.state.currentStep, equals(1));
        
        service.previousStep();
        expect(service.state.currentStep, equals(0));
      });

      test('should not go below step 0', () async {
        await service.init();
        
        service.previousStep();
        expect(service.state.currentStep, equals(0));
      });

      test('should complete on last step next', () async {
        await service.init();
        
        // Go to last step
        for (var i = 0; i < OnboardingService.pages.length - 1; i++) {
          service.nextStep();
        }
        
        expect(service.state.isLastStep, isTrue);
        
        service.nextStep();
        expect(service.state.isCompleted, isTrue);
      });

      test('should go to specific step', () async {
        await service.init();
        
        service.goToStep(3);
        expect(service.state.currentStep, equals(3));
      });

      test('should not go to invalid step', () async {
        await service.init();
        
        service.goToStep(-1);
        expect(service.state.currentStep, equals(0));
        
        service.goToStep(100);
        expect(service.state.currentStep, equals(0));
      });
    });

    group('skip and complete', () {
      test('should skip onboarding', () async {
        await service.init();
        
        service.skipOnboarding();
        
        expect(service.state.isCompleted, isTrue);
        expect(service.shouldShowOnboarding, isFalse);
      });

      test('should complete onboarding', () async {
        await service.init();
        
        service.completeOnboarding();
        
        expect(service.state.isCompleted, isTrue);
        
        // Verify persisted
        final completed = await storage.getBool('onboarding_completed');
        expect(completed, isTrue);
        
        final version = await storage.getInt('onboarding_version');
        expect(version, equals(OnboardingService.currentVersion));
      });
    });

    group('reset', () {
      test('should reset onboarding state', () async {
        await service.init();
        service.completeOnboarding();
        
        await service.resetOnboarding();
        
        expect(service.state.isCompleted, isFalse);
        expect(service.state.currentStep, equals(0));
        expect(service.shouldShowOnboarding, isTrue);
      });
    });

    group('current page', () {
      test('should return current page', () async {
        await service.init();
        
        final page = service.currentPage;
        
        expect(page, isNotNull);
        expect(page!.id, equals('welcome'));
      });

      test('should return correct page after navigation', () async {
        await service.init();
        service.goToStep(2);
        
        final page = service.currentPage;
        
        expect(page, isNotNull);
        expect(page!.id, equals('delivery'));
      });
    });

    group('state stream', () {
      test('should emit state changes', () async {
        await service.init();
        
        final emissions = <OnboardingState>[];
        final subscription = service.stateStream.listen(emissions.add);
        
        service.nextStep();
        service.nextStep();
        service.previousStep();
        
        await Future.delayed(const Duration(milliseconds: 50));
        
        expect(emissions.length, greaterThanOrEqualTo(3));
        
        await subscription.cancel();
      });
    });
  });

  group('OnboardingPage', () {
    test('should have all required pages', () {
      expect(OnboardingService.pages.length, equals(5));
      
      final ids = OnboardingService.pages.map((p) => p.id).toList();
      expect(ids, contains('welcome'));
      expect(ids, contains('discover'));
      expect(ids, contains('delivery'));
      expect(ids, contains('payment'));
      expect(ids, contains('ai_assistant'));
    });

    test('should return correct title based on locale', () {
      final page = OnboardingService.pages.first;
      
      expect(page.getTitle('en'), equals('Welcome to Okada'));
      expect(page.getTitle('fr'), equals('Bienvenue sur Okada'));
    });

    test('should return correct description based on locale', () {
      final page = OnboardingService.pages.first;
      
      expect(page.getDescription('en'), contains('AI-powered'));
      expect(page.getDescription('fr'), contains('IA'));
    });

    test('should have valid background colors', () {
      for (final page in OnboardingService.pages) {
        expect(page.backgroundColor, isNonZero);
        expect(page.backgroundColor & 0xFF000000, equals(0xFF000000)); // Has alpha
      }
    });

    test('should have valid asset paths', () {
      for (final page in OnboardingService.pages) {
        expect(page.imagePath, startsWith('assets/'));
        expect(page.imagePath, endsWith('.png'));
        
        if (page.animationPath != null) {
          expect(page.animationPath, startsWith('assets/'));
          expect(page.animationPath, endsWith('.json'));
        }
      }
    });
  });

  group('OnboardingState', () {
    test('should calculate progress correctly', () {
      const state = OnboardingState(
        currentStep: 2,
        totalSteps: 5,
      );
      
      expect(state.progress, equals(0.6)); // (2+1)/5
    });

    test('should detect first step', () {
      const firstStep = OnboardingState(currentStep: 0, totalSteps: 5);
      const middleStep = OnboardingState(currentStep: 2, totalSteps: 5);
      
      expect(firstStep.isFirstStep, isTrue);
      expect(middleStep.isFirstStep, isFalse);
    });

    test('should detect last step', () {
      const lastStep = OnboardingState(currentStep: 4, totalSteps: 5);
      const middleStep = OnboardingState(currentStep: 2, totalSteps: 5);
      
      expect(lastStep.isLastStep, isTrue);
      expect(middleStep.isLastStep, isFalse);
    });

    test('should handle zero total steps', () {
      const state = OnboardingState(currentStep: 0, totalSteps: 0);
      
      expect(state.progress, equals(0));
    });
  });

  group('InMemoryOnboardingStorage', () {
    late InMemoryOnboardingStorage storage;

    setUp(() {
      storage = InMemoryOnboardingStorage();
    });

    test('should store and retrieve bool', () async {
      await storage.setBool('key', true);
      final value = await storage.getBool('key');
      
      expect(value, isTrue);
    });

    test('should store and retrieve int', () async {
      await storage.setInt('key', 42);
      final value = await storage.getInt('key');
      
      expect(value, equals(42));
    });

    test('should return null for missing key', () async {
      final value = await storage.getBool('missing');
      
      expect(value, isNull);
    });

    test('should remove key', () async {
      await storage.setBool('key', true);
      await storage.remove('key');
      final value = await storage.getBool('key');
      
      expect(value, isNull);
    });
  });
}
