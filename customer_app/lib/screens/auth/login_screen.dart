import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/colors.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import 'package:okada_shared/ui/constants/cameroon_constants.dart';
import '../../providers/auth_provider.dart';

/// Login/Register Screen
/// Matches mockup: 03_login_register.png
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showEmailLogin = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleContinue() {
    if (_formKey.currentState!.validate()) {
      if (_showEmailLogin) {
        // Email/password login
        ref.read(authProvider.notifier).loginWithEmail(
          _emailController.text,
          _passwordController.text,
        );
      } else {
        // Phone number login (would trigger OTP)
        final phone = CameroonConstants.phonePrefix + _phoneController.text;
        ref.read(authProvider.notifier).loginWithPhone(phone);
        
        // TODO: Navigate to OTP screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('OTP sent to your phone'),
            backgroundColor: OkadaColors.success,
          ),
        );
      }
    }
  }

  void _handleGoogleLogin() {
    // TODO: Implement Google Sign-In
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Google Sign-In coming soon')),
    );
  }

  void _handleFacebookLogin() {
    // TODO: Implement Facebook Login
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Facebook Login coming soon')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    // Show error if any
    if (authState.error != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authState.error!),
            backgroundColor: OkadaColors.error,
          ),
        );
        ref.read(authProvider.notifier).clearError();
      });
    }

    // Navigate to home if authenticated
    if (authState.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed('/home');
      });
    }

    return Scaffold(
      backgroundColor: OkadaColors.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(OkadaSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: OkadaSpacing.xl * 2),
                
                // Logo
                _buildLogo(),
                
                SizedBox(height: OkadaSpacing.xl * 2),
                
                // Title
                Text(
                  'Login or register',
                  style: OkadaTypography.h1.copyWith(
                    color: OkadaColors.textPrimary,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                SizedBox(height: OkadaSpacing.xl),
                
                // Phone or Email input
                if (!_showEmailLogin) ...[
                  _buildPhoneInput(),
                ] else ...[
                  _buildEmailInput(),
                  SizedBox(height: OkadaSpacing.md),
                  _buildPasswordInput(),
                ],
                
                SizedBox(height: OkadaSpacing.sm),
                
                // Toggle between phone and email
                TextButton(
                  onPressed: () {
                    setState(() {
                      _showEmailLogin = !_showEmailLogin;
                    });
                  },
                  child: Text(
                    _showEmailLogin
                        ? 'Use phone number instead'
                        : 'Use email/password instead',
                    style: OkadaTypography.bodySmall.copyWith(
                      color: OkadaColors.primary,
                    ),
                  ),
                ),
                
                SizedBox(height: OkadaSpacing.md),
                
                // Continue button
                _buildContinueButton(authState.isLoading),
                
                SizedBox(height: OkadaSpacing.xl),
                
                // Divider
                _buildDivider(),
                
                SizedBox(height: OkadaSpacing.xl),
                
                // Social login buttons
                _buildSocialLoginButtons(),
                
                SizedBox(height: OkadaSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.shopping_cart,
          color: OkadaColors.primary,
          size: 48,
        ),
        SizedBox(width: OkadaSpacing.sm),
        Text(
          'Okada',
          style: OkadaTypography.h1.copyWith(
            color: OkadaColors.primary,
            fontSize: 48,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildPhoneInput() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: OkadaColors.borderLight),
      ),
      child: Row(
        children: [
          // Country flag and code
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: OkadaSpacing.md,
              vertical: OkadaSpacing.sm,
            ),
            decoration: BoxDecoration(
              border: Border(
                right: BorderSide(color: OkadaColors.borderLight),
              ),
            ),
            child: Row(
              children: [
                Text(
                  '🇨🇲',
                  style: TextStyle(fontSize: 24),
                ),
                SizedBox(width: OkadaSpacing.xs),
                Text(
                  '+237',
                  style: OkadaTypography.bodyMedium.copyWith(
                    color: OkadaColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          
          // Phone number input
          Expanded(
            child: TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(9),
              ],
              decoration: InputDecoration(
                hintText: 'Phone number',
                hintStyle: OkadaTypography.bodyMedium.copyWith(
                  color: OkadaColors.textSecondary,
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: OkadaSpacing.md,
                  vertical: OkadaSpacing.md,
                ),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your phone number';
                }
                if (value.length != 9) {
                  return 'Phone number must be 9 digits';
                }
                return null;
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmailInput() {
    return TextFormField(
      controller: _emailController,
      keyboardType: TextInputType.emailAddress,
      decoration: InputDecoration(
        hintText: 'Email',
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: OkadaColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: OkadaColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: OkadaColors.primary, width: 2),
        ),
        contentPadding: EdgeInsets.all(OkadaSpacing.md),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your email';
        }
        if (!value.contains('@')) {
          return 'Please enter a valid email';
        }
        return null;
      },
    );
  }

  Widget _buildPasswordInput() {
    return TextFormField(
      controller: _passwordController,
      obscureText: true,
      decoration: InputDecoration(
        hintText: 'Password',
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: OkadaColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: OkadaColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: OkadaColors.primary, width: 2),
        ),
        contentPadding: EdgeInsets.all(OkadaSpacing.md),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your password';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return null;
      },
    );
  }

  Widget _buildContinueButton(bool isLoading) {
    return ElevatedButton(
      onPressed: isLoading ? null : _handleContinue,
      style: ElevatedButton.styleFrom(
        backgroundColor: OkadaColors.primary,
        foregroundColor: Colors.white,
        padding: EdgeInsets.symmetric(vertical: OkadaSpacing.md),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      ),
      child: isLoading
          ? SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : Text(
              'Continue',
              style: OkadaTypography.button.copyWith(
                color: Colors.white,
              ),
            ),
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        Expanded(child: Divider(color: OkadaColors.borderLight)),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: OkadaSpacing.md),
          child: Text(
            'Or sign in with',
            style: OkadaTypography.bodySmall.copyWith(
              color: OkadaColors.textSecondary,
            ),
          ),
        ),
        Expanded(child: Divider(color: OkadaColors.borderLight)),
      ],
    );
  }

  Widget _buildSocialLoginButtons() {
    return Row(
      children: [
        Expanded(
          child: _buildSocialButton(
            label: 'Google',
            icon: Icons.g_mobiledata, // Placeholder, use actual Google icon
            onPressed: _handleGoogleLogin,
          ),
        ),
        SizedBox(width: OkadaSpacing.md),
        Expanded(
          child: _buildSocialButton(
            label: 'Facebook',
            icon: Icons.facebook,
            onPressed: _handleFacebookLogin,
          ),
        ),
      ],
    );
  }

  Widget _buildSocialButton({
    required String label,
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 24),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: OkadaColors.textPrimary,
        side: BorderSide(color: OkadaColors.borderLight),
        padding: EdgeInsets.symmetric(vertical: OkadaSpacing.md),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

