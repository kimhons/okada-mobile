import 'package:flutter/material.dart';
import 'package:shared/ui/theme/colors.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 3));
    
    if (mounted) {
      // TODO: Check if user is logged in
      // For now, navigate to onboarding
      Navigator.pushReplacementNamed(context, '/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5DC), // Beige background
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Okada Logo (motorcycle icon in circle)
            Container(
              width: 200,
              height: 200,
              decoration: const BoxDecoration(
                color: OkadaColors.primary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.motorcycle,
                size: 100,
                color: Color(0xFFFFD700), // Gold color
              ),
            ),
            const SizedBox(height: 40),
            // Okada Text
            const Text(
              'Okada',
              style: TextStyle(
                fontSize: 64,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 8),
            // Rider Dashboard Text
            const Text(
              'Rider Dashboard',
              style: TextStyle(
                fontSize: 28,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 80),
            // Loading indicator
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildDot(true),
                const SizedBox(width: 12),
                _buildDot(false),
                const SizedBox(width: 12),
                _buildDot(false),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDot(bool isActive) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: isActive ? Colors.black : Colors.black26,
        shape: BoxShape.circle,
      ),
    );
  }
}

