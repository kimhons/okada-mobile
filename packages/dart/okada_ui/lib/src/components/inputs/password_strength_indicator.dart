import 'package:flutter/material.dart';
import '../../theme/okada_design_system.dart';

/// Password Strength Level
enum PasswordStrength {
  /// No password entered
  none,
  
  /// Weak password (red)
  weak,
  
  /// Medium password (amber/yellow)
  medium,
  
  /// Strong password (green)
  strong,
}

/// Password Strength Indicator Widget
/// 
/// Displays a visual indicator of password strength as specified in the
/// Okada UI design specifications (Screen 1.6: Registration).
/// 
/// Colors:
/// - Weak: Red (#CE1126)
/// - Medium: Amber/Yellow (#FCD116)
/// - Strong: Green (#007A5E)
class PasswordStrengthIndicator extends StatelessWidget {
  const PasswordStrengthIndicator({
    super.key,
    required this.password,
    this.showLabel = true,
    this.showRequirements = false,
  });

  /// The password to evaluate
  final String password;
  
  /// Whether to show the strength label
  final bool showLabel;
  
  /// Whether to show detailed requirements
  final bool showRequirements;

  @override
  Widget build(BuildContext context) {
    final strength = evaluateStrength(password);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Strength bars
        Row(
          children: [
            Expanded(
              child: _StrengthBar(
                isActive: strength.index >= PasswordStrength.weak.index,
                color: _getColor(PasswordStrength.weak),
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: _StrengthBar(
                isActive: strength.index >= PasswordStrength.medium.index,
                color: _getColor(PasswordStrength.medium),
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: _StrengthBar(
                isActive: strength.index >= PasswordStrength.strong.index,
                color: _getColor(PasswordStrength.strong),
              ),
            ),
          ],
        ),
        
        // Label
        if (showLabel && password.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            _getLabel(strength),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: _getColor(strength),
            ),
          ),
        ],
        
        // Requirements
        if (showRequirements) ...[
          const SizedBox(height: 8),
          _RequirementItem(
            label: 'At least 8 characters',
            labelFr: 'Au moins 8 caractères',
            isMet: password.length >= 8,
          ),
          _RequirementItem(
            label: 'Contains uppercase letter',
            labelFr: 'Contient une majuscule',
            isMet: password.contains(RegExp(r'[A-Z]')),
          ),
          _RequirementItem(
            label: 'Contains lowercase letter',
            labelFr: 'Contient une minuscule',
            isMet: password.contains(RegExp(r'[a-z]')),
          ),
          _RequirementItem(
            label: 'Contains a number',
            labelFr: 'Contient un chiffre',
            isMet: password.contains(RegExp(r'[0-9]')),
          ),
        ],
      ],
    );
  }

  /// Evaluate password strength
  static PasswordStrength evaluateStrength(String password) {
    if (password.isEmpty) return PasswordStrength.none;
    
    int score = 0;
    
    // Length checks
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character type checks
    if (password.contains(RegExp(r'[a-z]'))) score++;
    if (password.contains(RegExp(r'[A-Z]'))) score++;
    if (password.contains(RegExp(r'[0-9]'))) score++;
    if (password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) score++;
    
    // Determine strength
    if (score <= 2) return PasswordStrength.weak;
    if (score <= 4) return PasswordStrength.medium;
    return PasswordStrength.strong;
  }

  Color _getColor(PasswordStrength strength) {
    switch (strength) {
      case PasswordStrength.none:
        return OkadaDesignSystem.basketGray;
      case PasswordStrength.weak:
        return OkadaDesignSystem.okadaRed;
      case PasswordStrength.medium:
        return OkadaDesignSystem.okadaYellow;
      case PasswordStrength.strong:
        return OkadaDesignSystem.okadaGreen;
    }
  }

  String _getLabel(PasswordStrength strength) {
    switch (strength) {
      case PasswordStrength.none:
        return '';
      case PasswordStrength.weak:
        return 'Weak / Faible';
      case PasswordStrength.medium:
        return 'Medium / Moyen';
      case PasswordStrength.strong:
        return 'Strong / Fort';
    }
  }
}

class _StrengthBar extends StatelessWidget {
  const _StrengthBar({
    required this.isActive,
    required this.color,
  });

  final bool isActive;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      height: 4,
      decoration: BoxDecoration(
        color: isActive ? color : OkadaDesignSystem.softClay,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }
}

class _RequirementItem extends StatelessWidget {
  const _RequirementItem({
    required this.label,
    required this.labelFr,
    required this.isMet,
  });

  final String label;
  final String labelFr;
  final bool isMet;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(
            isMet ? Icons.check_circle : Icons.circle_outlined,
            size: 16,
            color: isMet 
                ? OkadaDesignSystem.palmGreen 
                : OkadaDesignSystem.basketGray,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isMet 
                    ? OkadaDesignSystem.marketSoil 
                    : OkadaDesignSystem.basketGray,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Password Validation Result
class PasswordValidation {
  const PasswordValidation({
    required this.isValid,
    required this.strength,
    required this.errors,
  });

  final bool isValid;
  final PasswordStrength strength;
  final List<String> errors;

  /// Validate a password against Okada requirements
  /// 
  /// Requirements (from Screen 1.6):
  /// - Minimum 8 characters
  /// - At least one number
  factory PasswordValidation.validate(String password) {
    final errors = <String>[];
    
    if (password.length < 8) {
      errors.add('Password must be at least 8 characters');
    }
    
    if (!password.contains(RegExp(r'[0-9]'))) {
      errors.add('Password must contain at least one number');
    }
    
    return PasswordValidation(
      isValid: errors.isEmpty,
      strength: PasswordStrengthIndicator.evaluateStrength(password),
      errors: errors,
    );
  }
}
