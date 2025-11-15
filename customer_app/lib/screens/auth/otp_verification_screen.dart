import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/colors.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import '../../providers/auth_provider.dart';

/// OTP Verification Screen
/// Matches mockup: 04_otp_verification.png
class OTPVerificationScreen extends ConsumerStatefulWidget {
  final String phoneNumber;

  const OTPVerificationScreen({
    super.key,
    required this.phoneNumber,
  });

  @override
  ConsumerState<OTPVerificationScreen> createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends ConsumerState<OTPVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(
    6,
    (index) => TextEditingController(),
  );
  final List<FocusNode> _focusNodes = List.generate(
    6,
    (index) => FocusNode(),
  );

  bool _isResending = false;

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _otpCode {
    return _controllers.map((c) => c.text).join();
  }

  void _onOtpChanged(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      // Move to next field
      _focusNodes[index + 1].requestFocus();
    }

    // Auto-verify when all 6 digits are entered
    if (_otpCode.length == 6) {
      _verifyOtp();
    }
  }

  void _onOtpBackspace(int index) {
    if (index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  Future<void> _verifyOtp() async {
    final authNotifier = ref.read(authProvider.notifier);
    
    try {
      // TODO: Implement actual OTP verification
      // await authNotifier.verifyOtp(widget.phoneNumber, _otpCode);
      
      // For now, navigate to home on any 6-digit code
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Invalid OTP code. Please try again.'),
            backgroundColor: OkadaColors.error,
          ),
        );
        // Clear all fields
        for (var controller in _controllers) {
          controller.clear();
        }
        _focusNodes[0].requestFocus();
      }
    }
  }

  Future<void> _resendCode() async {
    setState(() => _isResending = true);

    try {
      // TODO: Implement actual resend OTP
      // await ref.read(authProvider.notifier).resendOtp(widget.phoneNumber);
      
      await Future.delayed(Duration(seconds: 1)); // Simulate API call
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Code resent successfully'),
            backgroundColor: OkadaColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to resend code'),
            backgroundColor: OkadaColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isResending = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: OkadaColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(OkadaSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(height: OkadaSpacing.xl),

              // Okada Logo
              Text(
                'OKADA',
                style: OkadaTypography.h1.copyWith(
                  color: OkadaColors.primary,
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),

              SizedBox(height: OkadaSpacing.xs),

              Text(
                'MARKETPLACE',
                style: OkadaTypography.bodyMedium.copyWith(
                  color: OkadaColors.textSecondary,
                  letterSpacing: 4,
                ),
              ),

              SizedBox(height: OkadaSpacing.xxl * 2),

              // Enter Code heading
              Text(
                'Enter Code',
                style: OkadaTypography.h1.copyWith(
                  color: OkadaColors.textPrimary,
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                ),
              ),

              SizedBox(height: OkadaSpacing.lg),

              // Phone number display
              Text(
                'We sent a code to ${_formatPhoneNumber(widget.phoneNumber)}',
                style: OkadaTypography.bodyMedium.copyWith(
                  color: OkadaColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: OkadaSpacing.xxl * 2),

              // OTP Input Fields
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(6, (index) {
                  return _buildOtpBox(index);
                }),
              ),

              SizedBox(height: OkadaSpacing.xxl * 2),

              // Verify Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _otpCode.length == 6 ? _verifyOtp : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: OkadaColors.primary,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: OkadaColors.primary.withOpacity(0.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Verify',
                    style: OkadaTypography.h4.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),

              SizedBox(height: OkadaSpacing.xxl),

              // Resend Code
              TextButton(
                onPressed: _isResending ? null : _resendCode,
                child: _isResending
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            OkadaColors.textSecondary,
                          ),
                        ),
                      )
                    : Text(
                        'Resend Code',
                        style: OkadaTypography.h4.copyWith(
                          color: OkadaColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOtpBox(int index) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        border: Border.all(
          color: _controllers[index].text.isEmpty
              ? OkadaColors.border
              : OkadaColors.primary,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: TextField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: OkadaTypography.h2.copyWith(
          color: OkadaColors.textPrimary,
          fontWeight: FontWeight.bold,
        ),
        inputFormatters: [
          FilteringTextInputFormatter.digitsOnly,
        ],
        decoration: InputDecoration(
          counterText: '',
          border: InputBorder.none,
        ),
        onChanged: (value) => _onOtpChanged(index, value),
        onTap: () {
          // Clear the field when tapped
          _controllers[index].clear();
        },
        onSubmitted: (value) {
          if (index < 5 && value.isNotEmpty) {
            _focusNodes[index + 1].requestFocus();
          }
        },
      ),
    );
  }

  String _formatPhoneNumber(String phone) {
    // Format: +237 XXX XXX XXX
    if (phone.startsWith('+237')) {
      final digits = phone.substring(4);
      if (digits.length >= 9) {
        return '+237 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}';
      }
    }
    return phone;
  }
}

