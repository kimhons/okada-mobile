import 'package:flutter/material.dart';
import 'package:okada_core/okada_core.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_typography.dart';
import '../../theme/okada_spacing.dart';
import '../buttons/okada_button.dart';

/// Okada Platform Error Display Component
/// 
/// Displays error messages with appropriate styling and recovery actions.
/// Integrates with the AppError system for consistent error handling.
class ErrorDisplay extends StatelessWidget {
  /// Error to display
  final AppError? error;
  
  /// Custom error message (overrides error.userMessage)
  final String? message;
  
  /// Custom error title
  final String? title;
  
  /// Retry callback
  final VoidCallback? onRetry;
  
  /// Go back callback
  final VoidCallback? onGoBack;
  
  /// Contact support callback
  final VoidCallback? onContactSupport;
  
  /// Language code for localization
  final String languageCode;
  
  /// Whether to use inline (compact) display
  final bool inline;
  
  /// Whether to show error code
  final bool showErrorCode;

  const ErrorDisplay({
    super.key,
    this.error,
    this.message,
    this.title,
    this.onRetry,
    this.onGoBack,
    this.onContactSupport,
    this.languageCode = 'en',
    this.inline = false,
    this.showErrorCode = false,
  });

  /// Create from AppError
  factory ErrorDisplay.fromError(
    AppError error, {
    VoidCallback? onRetry,
    VoidCallback? onGoBack,
    VoidCallback? onContactSupport,
    String languageCode = 'en',
    bool inline = false,
    bool showErrorCode = false,
  }) {
    return ErrorDisplay(
      error: error,
      onRetry: onRetry,
      onGoBack: onGoBack,
      onContactSupport: onContactSupport,
      languageCode: languageCode,
      inline: inline,
      showErrorCode: showErrorCode,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (inline) {
      return _buildInline(context);
    }
    return _buildFullScreen(context);
  }

  Widget _buildInline(BuildContext context) {
    return Container(
      padding: OkadaSpacing.allMd,
      decoration: BoxDecoration(
        color: OkadaColors.errorLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: OkadaColors.error.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(
            _getIcon(),
            color: OkadaColors.error,
            size: 24,
          ),
          OkadaSpacing.gapHorizontalMd,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _getMessage(),
                  style: OkadaTypography.bodyMedium.copyWith(
                    color: OkadaColors.errorDark,
                  ),
                ),
                if (showErrorCode && error != null) ...[
                  OkadaSpacing.gapVerticalXxs,
                  Text(
                    'Error code: ${error!.code}',
                    style: OkadaTypography.labelSmall.copyWith(
                      color: OkadaColors.error,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (onRetry != null) ...[
            OkadaSpacing.gapHorizontalMd,
            IconButton(
              icon: const Icon(Icons.refresh),
              color: OkadaColors.error,
              onPressed: onRetry,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFullScreen(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: OkadaColors.errorLight,
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getIcon(),
                size: 48,
                color: OkadaColors.error,
              ),
            ),
            OkadaSpacing.gapVerticalXl,
            Text(
              title ?? _getTitle(),
              style: OkadaTypography.headlineSmall,
              textAlign: TextAlign.center,
            ),
            OkadaSpacing.gapVerticalSm,
            Text(
              _getMessage(),
              style: OkadaTypography.bodyMedium.copyWith(
                color: OkadaColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            if (showErrorCode && error != null) ...[
              OkadaSpacing.gapVerticalXs,
              Text(
                'Error code: ${error!.code}',
                style: OkadaTypography.labelSmall.copyWith(
                  color: OkadaColors.textTertiary,
                ),
              ),
            ],
            OkadaSpacing.gapVerticalXl,
            _buildActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildActions() {
    final recoveryAction = error?.recoveryAction ?? RecoveryAction.retry;
    
    return Column(
      children: [
        // Primary action based on recovery action
        if (_shouldShowPrimaryAction(recoveryAction))
          OkadaButton(
            label: _getPrimaryActionLabel(recoveryAction),
            onPressed: _getPrimaryAction(recoveryAction),
          ),
        
        // Secondary action
        if (_shouldShowSecondaryAction(recoveryAction)) ...[
          OkadaSpacing.gapVerticalSm,
          OkadaButton(
            label: _getSecondaryActionLabel(recoveryAction),
            variant: OkadaButtonVariant.text,
            onPressed: _getSecondaryAction(recoveryAction),
          ),
        ],
      ],
    );
  }

  IconData _getIcon() {
    if (error == null) return Icons.error_outline;
    
    if (error is NetworkError) {
      if (error!.code == 'E001') return Icons.wifi_off_outlined;
      return Icons.cloud_off_outlined;
    }
    
    if (error is AuthError) {
      return Icons.lock_outline;
    }
    
    if (error is PaymentError) {
      return Icons.payment_outlined;
    }
    
    if (error is ServerError) {
      return Icons.dns_outlined;
    }
    
    return Icons.error_outline;
  }

  String _getTitle() {
    if (error == null) return 'Error';
    
    if (error is NetworkError) {
      if (error!.code == 'E001') return 'No Connection';
      return 'Network Error';
    }
    
    if (error is AuthError) {
      return 'Authentication Error';
    }
    
    if (error is PaymentError) {
      return 'Payment Error';
    }
    
    if (error is ServerError) {
      return 'Server Error';
    }
    
    return 'Error';
  }

  String _getMessage() {
    if (message != null) return message!;
    if (error != null) return error!.getLocalizedMessage(languageCode);
    return 'An unexpected error occurred.';
  }

  bool _shouldShowPrimaryAction(RecoveryAction action) {
    switch (action) {
      case RecoveryAction.retry:
      case RecoveryAction.refresh:
        return onRetry != null;
      case RecoveryAction.relogin:
        return true; // Always show for relogin
      case RecoveryAction.goBack:
        return onGoBack != null;
      case RecoveryAction.contactSupport:
        return onContactSupport != null;
      case RecoveryAction.checkConnection:
        return onRetry != null;
      case RecoveryAction.tryDifferentPayment:
        return onGoBack != null;
      case RecoveryAction.updateApp:
        return true; // Always show for update
      case RecoveryAction.clearCache:
        return onRetry != null;
      case RecoveryAction.none:
        return onRetry != null || onGoBack != null;
    }
  }

  String _getPrimaryActionLabel(RecoveryAction action) {
    switch (action) {
      case RecoveryAction.retry:
      case RecoveryAction.refresh:
      case RecoveryAction.checkConnection:
      case RecoveryAction.clearCache:
        return 'Try Again';
      case RecoveryAction.relogin:
        return 'Log In Again';
      case RecoveryAction.goBack:
        return 'Go Back';
      case RecoveryAction.contactSupport:
        return 'Contact Support';
      case RecoveryAction.tryDifferentPayment:
        return 'Try Different Payment';
      case RecoveryAction.updateApp:
        return 'Update App';
      case RecoveryAction.none:
        return onRetry != null ? 'Try Again' : 'Go Back';
    }
  }

  VoidCallback? _getPrimaryAction(RecoveryAction action) {
    switch (action) {
      case RecoveryAction.retry:
      case RecoveryAction.refresh:
      case RecoveryAction.checkConnection:
      case RecoveryAction.clearCache:
        return onRetry;
      case RecoveryAction.relogin:
        return onGoBack; // Navigate to login
      case RecoveryAction.goBack:
        return onGoBack;
      case RecoveryAction.contactSupport:
        return onContactSupport;
      case RecoveryAction.tryDifferentPayment:
        return onGoBack;
      case RecoveryAction.updateApp:
        return null; // Would open app store
      case RecoveryAction.none:
        return onRetry ?? onGoBack;
    }
  }

  bool _shouldShowSecondaryAction(RecoveryAction action) {
    switch (action) {
      case RecoveryAction.retry:
      case RecoveryAction.refresh:
      case RecoveryAction.checkConnection:
        return onContactSupport != null;
      case RecoveryAction.contactSupport:
        return onGoBack != null;
      default:
        return false;
    }
  }

  String _getSecondaryActionLabel(RecoveryAction action) {
    switch (action) {
      case RecoveryAction.retry:
      case RecoveryAction.refresh:
      case RecoveryAction.checkConnection:
        return 'Contact Support';
      case RecoveryAction.contactSupport:
        return 'Go Back';
      default:
        return 'Go Back';
    }
  }

  VoidCallback? _getSecondaryAction(RecoveryAction action) {
    switch (action) {
      case RecoveryAction.retry:
      case RecoveryAction.refresh:
      case RecoveryAction.checkConnection:
        return onContactSupport;
      case RecoveryAction.contactSupport:
        return onGoBack;
      default:
        return onGoBack;
    }
  }
}
