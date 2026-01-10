import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';
import '../widgets/ndop_pattern.dart';
import '../widgets/cultural_symbols.dart';

/// Onboarding Carousel Screen (Screens 1.3-1.5)
/// 
/// Educates new users about Okada's value proposition through 3 screens:
/// 1. Benefits - Fresh Groceries Delivered
/// 2. Features - Thousands of Products
/// 3. Delivery - Track Your Order
/// 
/// Based on the Okada UI design specifications.
class OnboardingCarouselScreen extends StatefulWidget {
  const OnboardingCarouselScreen({
    super.key,
    required this.onComplete,
    required this.onSkip,
    this.autoAdvance = false,
    this.autoAdvanceDuration = const Duration(seconds: 5),
  });

  /// Callback when onboarding is completed
  final VoidCallback onComplete;
  
  /// Callback when user skips onboarding
  final VoidCallback onSkip;
  
  /// Whether to auto-advance after inactivity
  final bool autoAdvance;
  
  /// Duration before auto-advancing
  final Duration autoAdvanceDuration;

  @override
  State<OnboardingCarouselScreen> createState() => _OnboardingCarouselScreenState();
}

class _OnboardingCarouselScreenState extends State<OnboardingCarouselScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPageData> _pages = const [
    // Screen 1.3: Benefits
    OnboardingPageData(
      headlineEn: 'Fresh Groceries Delivered to Your Door',
      headlineFr: 'Produits frais livrés à votre porte',
      descriptionEn: 'Get everything you need from your local market delivered in 30-45 minutes',
      descriptionFr: 'Recevez tout ce dont vous avez besoin de votre marché local en 30-45 minutes',
      symbol: CulturalSymbol.basket,
      backgroundColor: OkadaDesignSystem.marketWhite,
      accentColor: OkadaDesignSystem.okadaGreen,
    ),
    // Screen 1.4: Features
    OnboardingPageData(
      headlineEn: 'Thousands of Products at Your Fingertips',
      headlineFr: 'Des milliers de produits à portée de main',
      descriptionEn: 'Browse fresh produce, household essentials, and more with easy search and filters',
      descriptionFr: 'Parcourez les produits frais, les essentiels ménagers et plus avec une recherche facile',
      symbol: CulturalSymbol.palmTree,
      backgroundColor: OkadaDesignSystem.pureWhite,
      accentColor: OkadaDesignSystem.palmGreen,
    ),
    // Screen 1.5: Delivery
    OnboardingPageData(
      headlineEn: 'Track Your Order in Real-Time',
      headlineFr: 'Suivez votre commande en temps réel',
      descriptionEn: 'Know exactly when your order will arrive with live tracking and notifications',
      descriptionFr: 'Sachez exactement quand votre commande arrivera avec le suivi en direct',
      symbol: CulturalSymbol.motorcycle,
      backgroundColor: OkadaDesignSystem.marketWhite,
      accentColor: OkadaDesignSystem.okadaYellow,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      widget.onComplete();
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Progress Dots
                  _ProgressDots(
                    currentPage: _currentPage,
                    totalPages: _pages.length,
                  ),
                  
                  // Skip Button
                  TextButton(
                    onPressed: widget.onSkip,
                    child: Text(
                      'Skip',
                      style: TextStyle(
                        color: OkadaDesignSystem.basketGray,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Page Content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                },
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _OnboardingPage(data: _pages[index]);
                },
              ),
            ),
            
            // Ndop Pattern Border
            const NdopPattern(
              height: 8,
              patternType: NdopPatternType.border,
            ),
            
            // Navigation Buttons
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  // Back Button (hidden on first screen)
                  if (_currentPage > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _previousPage,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: OkadaDesignSystem.okadaGreen,
                          side: const BorderSide(
                            color: OkadaDesignSystem.okadaGreen,
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Back',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    )
                  else
                    const Spacer(),
                  
                  if (_currentPage > 0) const SizedBox(width: 16),
                  
                  // Next/Get Started Button
                  Expanded(
                    flex: _currentPage > 0 ? 1 : 2,
                    child: ElevatedButton(
                      onPressed: _nextPage,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: OkadaDesignSystem.okadaGreen,
                        foregroundColor: OkadaDesignSystem.pureWhite,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        _currentPage == _pages.length - 1 
                            ? 'Get Started' 
                            : 'Next',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
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
}

/// Data for a single onboarding page
class OnboardingPageData {
  const OnboardingPageData({
    required this.headlineEn,
    required this.headlineFr,
    required this.descriptionEn,
    required this.descriptionFr,
    required this.symbol,
    required this.backgroundColor,
    required this.accentColor,
  });

  final String headlineEn;
  final String headlineFr;
  final String descriptionEn;
  final String descriptionFr;
  final CulturalSymbol symbol;
  final Color backgroundColor;
  final Color accentColor;
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.data});

  final OnboardingPageData data;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: data.backgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Illustration Area (60% of screen height)
          Expanded(
            flex: 6,
            child: Center(
              child: _IllustrationArea(
                symbol: data.symbol,
                accentColor: data.accentColor,
              ),
            ),
          ),
          
          // Text Content
          Expanded(
            flex: 4,
            child: Column(
              children: [
                // Headline (English)
                Text(
                  data.headlineEn,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: OkadaDesignSystem.marketSoil,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 8),
                
                // Headline (French)
                Text(
                  data.headlineFr,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: OkadaDesignSystem.basketGray,
                    fontStyle: FontStyle.italic,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                const SizedBox(height: 24),
                
                // Description
                Text(
                  data.descriptionEn,
                  style: TextStyle(
                    fontSize: 16,
                    color: OkadaDesignSystem.basketGray,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _IllustrationArea extends StatelessWidget {
  const _IllustrationArea({
    required this.symbol,
    required this.accentColor,
  });

  final CulturalSymbol symbol;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Background circle
        Container(
          width: 240,
          height: 240,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: accentColor.withOpacity(0.1),
          ),
        ),
        
        // Inner circle
        Container(
          width: 180,
          height: 180,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: accentColor.withOpacity(0.2),
          ),
        ),
        
        // Cultural Symbol
        CulturalSymbolIcon(
          symbol: symbol,
          size: 120,
          color: accentColor,
        ),
        
        // Decorative Ndop elements
        Positioned(
          top: 20,
          right: 40,
          child: _NdopDecorativeElement(color: OkadaDesignSystem.ndopBlue),
        ),
        Positioned(
          bottom: 30,
          left: 30,
          child: _NdopDecorativeElement(color: OkadaDesignSystem.ndopBlue),
        ),
      ],
    );
  }
}

class _NdopDecorativeElement extends StatelessWidget {
  const _NdopDecorativeElement({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: color.withOpacity(0.3),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}

class _ProgressDots extends StatelessWidget {
  const _ProgressDots({
    required this.currentPage,
    required this.totalPages,
  });

  final int currentPage;
  final int totalPages;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(totalPages, (index) {
        final isActive = index == currentPage;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: isActive ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: isActive 
                ? OkadaDesignSystem.okadaGreen 
                : OkadaDesignSystem.softClay,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}
