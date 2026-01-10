import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';
import '../widgets/ndop_pattern.dart';

/// Language Selection Screen (Screen 1.2)
/// 
/// Allows users to choose their preferred language (French or English).
/// Based on the Okada UI design specifications.
/// 
/// Layout:
/// - White background
/// - Centered content area
/// - Okada logo at top (smaller, 80x80px)
/// - Heading: "Choose Your Language / Choisissez Votre Langue"
/// - Two large language option cards
/// - Continue button
class LanguageSelectionScreen extends StatefulWidget {
  const LanguageSelectionScreen({
    super.key,
    required this.onLanguageSelected,
    this.initialLanguage,
    this.logoWidget,
  });

  /// Callback when language is selected and confirmed
  final void Function(String languageCode) onLanguageSelected;
  
  /// Initial language selection (defaults to device language)
  final String? initialLanguage;
  
  /// Custom logo widget (optional)
  final Widget? logoWidget;

  @override
  State<LanguageSelectionScreen> createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends State<LanguageSelectionScreen> {
  late String _selectedLanguage;

  @override
  void initState() {
    super.initState();
    _selectedLanguage = widget.initialLanguage ?? 'fr'; // Default to French for Cameroon
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OkadaDesignSystem.pureWhite,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 48),
              
              // Logo
              widget.logoWidget ?? _buildDefaultLogo(),
              
              const SizedBox(height: 32),
              
              // Heading
              const Text(
                'Choose Your Language',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: OkadaDesignSystem.marketSoil,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Choisissez Votre Langue',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: OkadaDesignSystem.basketGray,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 48),
              
              // Language Options
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // French Option
                    _LanguageOptionCard(
                      languageCode: 'fr',
                      languageName: 'Français',
                      languageSubtitle: 'French',
                      isSelected: _selectedLanguage == 'fr',
                      onTap: () => setState(() => _selectedLanguage = 'fr'),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // English Option
                    _LanguageOptionCard(
                      languageCode: 'en',
                      languageName: 'English',
                      languageSubtitle: 'Anglais',
                      isSelected: _selectedLanguage == 'en',
                      onTap: () => setState(() => _selectedLanguage = 'en'),
                    ),
                  ],
                ),
              ),
              
              // Ndop Pattern Decoration
              const NdopPattern(
                height: 6,
                patternType: NdopPatternType.dots,
                opacity: 0.3,
              ),
              
              const SizedBox(height: 24),
              
              // Continue Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () => widget.onLanguageSelected(_selectedLanguage),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: OkadaDesignSystem.okadaGreen,
                    foregroundColor: OkadaDesignSystem.pureWhite,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Continue / Continuer',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDefaultLogo() {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: OkadaDesignSystem.okadaGreen,
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Center(
        child: Text(
          'O',
          style: TextStyle(
            fontSize: 40,
            fontWeight: FontWeight.bold,
            color: OkadaDesignSystem.okadaYellow,
          ),
        ),
      ),
    );
  }
}

class _LanguageOptionCard extends StatelessWidget {
  const _LanguageOptionCard({
    required this.languageCode,
    required this.languageName,
    required this.languageSubtitle,
    required this.isSelected,
    required this.onTap,
  });

  final String languageCode;
  final String languageName;
  final String languageSubtitle;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected 
              ? OkadaDesignSystem.okadaGreen.withOpacity(0.1)
              : OkadaDesignSystem.pureWhite,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected 
                ? OkadaDesignSystem.okadaGreen 
                : OkadaDesignSystem.softClay,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            // Cameroon Flag Icon
            _CameroonFlag(size: 48),
            
            const SizedBox(width: 16),
            
            // Language Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    languageName,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: OkadaDesignSystem.marketSoil,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    languageSubtitle,
                    style: const TextStyle(
                      fontSize: 16,
                      color: OkadaDesignSystem.basketGray,
                    ),
                  ),
                ],
              ),
            ),
            
            // Radio Indicator
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected 
                      ? OkadaDesignSystem.okadaGreen 
                      : OkadaDesignSystem.basketGray,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: OkadaDesignSystem.okadaGreen,
                        ),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

/// Cameroon Flag Widget
class _CameroonFlag extends StatelessWidget {
  const _CameroonFlag({this.size = 32});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size * 0.67, // Standard flag aspect ratio
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Row(
        children: [
          // Green stripe
          Expanded(
            child: Container(color: OkadaDesignSystem.okadaGreen),
          ),
          // Red stripe with yellow star
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(color: OkadaDesignSystem.okadaRed),
                Icon(
                  Icons.star,
                  color: OkadaDesignSystem.okadaYellow,
                  size: size * 0.3,
                ),
              ],
            ),
          ),
          // Yellow stripe
          Expanded(
            child: Container(color: OkadaDesignSystem.okadaYellow),
          ),
        ],
      ),
    );
  }
}

/// Language Selection Result
class LanguageSelectionResult {
  const LanguageSelectionResult({
    required this.languageCode,
    required this.languageName,
  });

  final String languageCode;
  final String languageName;

  /// Get the locale for this language
  Locale get locale => Locale(languageCode);

  /// French
  static const french = LanguageSelectionResult(
    languageCode: 'fr',
    languageName: 'Français',
  );

  /// English
  static const english = LanguageSelectionResult(
    languageCode: 'en',
    languageName: 'English',
  );
}
