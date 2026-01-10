import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';
import '../widgets/cultural_symbols.dart';

/// Splash Screen (Screen 1.1)
/// 
/// Brand introduction and app initialization screen.
/// Based on the Okada UI design specifications.
/// 
/// Layout:
/// - Full-screen background in Okada Green (#007A5E)
/// - Centered Okada logo (motorcycle rider icon in Okada Yellow)
/// - "OKADA" wordmark in white below logo
/// - Tagline: "Your Market, Delivered" in white, smaller text
/// - Loading indicator at bottom (subtle animation)
class SplashScreen extends StatefulWidget {
  const SplashScreen({
    super.key,
    required this.onInitialized,
    this.minimumDuration = const Duration(seconds: 2),
    this.checkConnectivity = true,
  });

  /// Callback when initialization is complete
  final VoidCallback onInitialized;
  
  /// Minimum time to display splash screen
  final Duration minimumDuration;
  
  /// Whether to check for internet connectivity
  final bool checkConnectivity;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
      ),
    );
    
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );
    
    _animationController.forward();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Wait minimum duration
    await Future.delayed(widget.minimumDuration);
    
    // Check connectivity if enabled
    if (widget.checkConnectivity) {
      // In production, this would check actual connectivity
      await Future.delayed(const Duration(milliseconds: 500));
    }
    
    // Notify initialization complete
    if (mounted) {
      widget.onInitialized();
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
      backgroundColor: OkadaDesignSystem.okadaGreen,
      body: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return FadeTransition(
            opacity: _fadeAnimation,
            child: ScaleTransition(
              scale: _scaleAnimation,
              child: child,
            ),
          );
        },
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 2),
              
              // Logo (Motorcycle Icon)
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: OkadaDesignSystem.okadaYellow,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Center(
                  child: CulturalSymbolIcon(
                    symbol: CulturalSymbol.motorcycle,
                    size: 80,
                    color: OkadaDesignSystem.okadaGreen,
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Wordmark
              const Text(
                'OKADA',
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: OkadaDesignSystem.pureWhite,
                  letterSpacing: 8,
                ),
              ),
              
              const SizedBox(height: 8),
              
              // Tagline
              Text(
                'Your Market, Delivered',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: OkadaDesignSystem.pureWhite.withOpacity(0.9),
                  letterSpacing: 1,
                ),
              ),
              
              // French tagline
              const SizedBox(height: 4),
              Text(
                'Votre Marché, Livré',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w300,
                  color: OkadaDesignSystem.pureWhite.withOpacity(0.7),
                  fontStyle: FontStyle.italic,
                ),
              ),
              
              const Spacer(flex: 2),
              
              // Loading Indicator
              const _LoadingIndicator(),
              
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoadingIndicator extends StatefulWidget {
  const _LoadingIndicator();

  @override
  State<_LoadingIndicator> createState() => _LoadingIndicatorState();
}

class _LoadingIndicatorState extends State<_LoadingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 48,
      height: 24,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(3, (index) {
          return AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final delay = index * 0.2;
              final value = (_controller.value + delay) % 1.0;
              final scale = 0.5 + (0.5 * _bounce(value));
              
              return Transform.scale(
                scale: scale,
                child: Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: OkadaDesignSystem.pureWhite.withOpacity(0.8),
                    shape: BoxShape.circle,
                  ),
                ),
              );
            },
          );
        }),
      ),
    );
  }

  double _bounce(double t) {
    if (t < 0.5) {
      return 4 * t * t * t;
    } else {
      return 1 - ((-2 * t + 2) * (-2 * t + 2) * (-2 * t + 2)) / 2;
    }
  }
}

/// Splash Screen with Connectivity Check
/// 
/// Extended splash screen that shows connectivity status.
class SplashScreenWithConnectivity extends StatefulWidget {
  const SplashScreenWithConnectivity({
    super.key,
    required this.onInitialized,
    required this.onOffline,
  });

  final VoidCallback onInitialized;
  final VoidCallback onOffline;

  @override
  State<SplashScreenWithConnectivity> createState() =>
      _SplashScreenWithConnectivityState();
}

class _SplashScreenWithConnectivityState
    extends State<SplashScreenWithConnectivity> {
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    _checkConnectivity();
  }

  Future<void> _checkConnectivity() async {
    await Future.delayed(const Duration(seconds: 2));
    
    // In production, check actual connectivity
    final hasConnection = true; // Replace with actual check
    
    if (mounted) {
      if (hasConnection) {
        widget.onInitialized();
      } else {
        setState(() => _isOffline = true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OkadaDesignSystem.okadaGreen,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(flex: 2),
            
            // Logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: OkadaDesignSystem.okadaYellow,
                borderRadius: BorderRadius.circular(30),
              ),
              child: Center(
                child: CulturalSymbolIcon(
                  symbol: CulturalSymbol.motorcycle,
                  size: 80,
                  color: OkadaDesignSystem.okadaGreen,
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            const Text(
              'OKADA',
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                color: OkadaDesignSystem.pureWhite,
                letterSpacing: 8,
              ),
            ),
            
            const Spacer(flex: 2),
            
            // Offline indicator
            if (_isOffline) ...[
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 16,
                ),
                margin: const EdgeInsets.symmetric(horizontal: 32),
                decoration: BoxDecoration(
                  color: OkadaDesignSystem.pureWhite.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.wifi_off,
                      color: OkadaDesignSystem.pureWhite,
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'No Internet Connection',
                      style: TextStyle(
                        color: OkadaDesignSystem.pureWhite,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Pas de connexion Internet',
                      style: TextStyle(
                        color: OkadaDesignSystem.pureWhite.withOpacity(0.7),
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        setState(() => _isOffline = false);
                        _checkConnectivity();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: OkadaDesignSystem.pureWhite,
                        foregroundColor: OkadaDesignSystem.okadaGreen,
                      ),
                      child: const Text('Retry / Réessayer'),
                    ),
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: widget.onOffline,
                      child: Text(
                        'Continue Offline',
                        style: TextStyle(
                          color: OkadaDesignSystem.pureWhite.withOpacity(0.8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else
              const _LoadingIndicator(),
            
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
