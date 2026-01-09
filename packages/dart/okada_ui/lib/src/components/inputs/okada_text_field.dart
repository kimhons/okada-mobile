import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_typography.dart';
import '../../theme/okada_spacing.dart';
import '../../theme/okada_border_radius.dart';

/// Okada Platform Text Field Component
/// 
/// A versatile text input component with support for labels, hints,
/// validation, icons, and various input types.
class OkadaTextField extends StatefulWidget {
  /// Text editing controller
  final TextEditingController? controller;
  
  /// Label text displayed above the field
  final String? label;
  
  /// Hint text displayed when field is empty
  final String? hint;
  
  /// Helper text displayed below the field
  final String? helperText;
  
  /// Error text displayed below the field
  final String? errorText;
  
  /// Leading icon
  final IconData? prefixIcon;
  
  /// Trailing icon
  final IconData? suffixIcon;
  
  /// Callback when suffix icon is tapped
  final VoidCallback? onSuffixTap;
  
  /// Whether the field is obscured (for passwords)
  final bool obscureText;
  
  /// Whether the field is enabled
  final bool enabled;
  
  /// Whether the field is read-only
  final bool readOnly;
  
  /// Whether the field should autofocus
  final bool autofocus;
  
  /// Maximum number of lines
  final int maxLines;
  
  /// Minimum number of lines
  final int minLines;
  
  /// Maximum length of input
  final int? maxLength;
  
  /// Keyboard type
  final TextInputType keyboardType;
  
  /// Text input action
  final TextInputAction? textInputAction;
  
  /// Text capitalization
  final TextCapitalization textCapitalization;
  
  /// Input formatters
  final List<TextInputFormatter>? inputFormatters;
  
  /// Callback when text changes
  final ValueChanged<String>? onChanged;
  
  /// Callback when editing is complete
  final VoidCallback? onEditingComplete;
  
  /// Callback when submitted
  final ValueChanged<String>? onSubmitted;
  
  /// Validator function
  final String? Function(String?)? validator;
  
  /// Focus node
  final FocusNode? focusNode;
  
  /// Whether to show character counter
  final bool showCounter;

  const OkadaTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.maxLines = 1,
    this.minLines = 1,
    this.maxLength,
    this.keyboardType = TextInputType.text,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.onChanged,
    this.onEditingComplete,
    this.onSubmitted,
    this.validator,
    this.focusNode,
    this.showCounter = false,
  });

  @override
  State<OkadaTextField> createState() => _OkadaTextFieldState();
}

class _OkadaTextFieldState extends State<OkadaTextField> {
  late bool _obscureText;
  late FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.obscureText;
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  void _handleFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null && widget.errorText!.isNotEmpty;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: OkadaTypography.labelMedium.copyWith(
              color: hasError 
                  ? OkadaColors.error 
                  : _isFocused 
                      ? OkadaColors.primary 
                      : OkadaColors.textSecondary,
            ),
          ),
          OkadaSpacing.gapVerticalXxs,
        ],
        TextFormField(
          controller: widget.controller,
          focusNode: _focusNode,
          obscureText: _obscureText,
          enabled: widget.enabled,
          readOnly: widget.readOnly,
          autofocus: widget.autofocus,
          maxLines: widget.obscureText ? 1 : widget.maxLines,
          minLines: widget.minLines,
          maxLength: widget.maxLength,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          textCapitalization: widget.textCapitalization,
          inputFormatters: widget.inputFormatters,
          onChanged: widget.onChanged,
          onEditingComplete: widget.onEditingComplete,
          onFieldSubmitted: widget.onSubmitted,
          validator: widget.validator,
          style: OkadaTypography.bodyMedium.copyWith(
            color: widget.enabled 
                ? OkadaColors.textPrimary 
                : OkadaColors.textDisabled,
          ),
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: OkadaTypography.bodyMedium.copyWith(
              color: OkadaColors.textTertiary,
            ),
            filled: true,
            fillColor: widget.enabled
                ? OkadaColors.backgroundSecondary
                : OkadaColors.neutral100,
            contentPadding: OkadaSpacing.inputEdgeInsets,
            counterText: widget.showCounter ? null : '',
            prefixIcon: widget.prefixIcon != null
                ? Icon(
                    widget.prefixIcon,
                    color: hasError
                        ? OkadaColors.error
                        : _isFocused
                            ? OkadaColors.primary
                            : OkadaColors.textTertiary,
                    size: 20,
                  )
                : null,
            suffixIcon: _buildSuffixIcon(hasError),
            border: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: BorderSide(
                color: hasError ? OkadaColors.error : OkadaColors.borderLight,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: BorderSide(
                color: hasError ? OkadaColors.error : OkadaColors.primary,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: const BorderSide(color: OkadaColors.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: const BorderSide(color: OkadaColors.error, width: 2),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: const BorderSide(color: OkadaColors.neutral200),
            ),
          ),
        ),
        if (widget.errorText != null && widget.errorText!.isNotEmpty) ...[
          OkadaSpacing.gapVerticalXxs,
          Text(
            widget.errorText!,
            style: OkadaTypography.error,
          ),
        ] else if (widget.helperText != null) ...[
          OkadaSpacing.gapVerticalXxs,
          Text(
            widget.helperText!,
            style: OkadaTypography.bodySmall.copyWith(
              color: OkadaColors.textTertiary,
            ),
          ),
        ],
      ],
    );
  }

  Widget? _buildSuffixIcon(bool hasError) {
    // Password toggle
    if (widget.obscureText) {
      return IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          color: OkadaColors.textTertiary,
          size: 20,
        ),
        onPressed: () {
          setState(() {
            _obscureText = !_obscureText;
          });
        },
      );
    }
    
    // Custom suffix icon
    if (widget.suffixIcon != null) {
      return IconButton(
        icon: Icon(
          widget.suffixIcon,
          color: hasError
              ? OkadaColors.error
              : _isFocused
                  ? OkadaColors.primary
                  : OkadaColors.textTertiary,
          size: 20,
        ),
        onPressed: widget.onSuffixTap,
      );
    }
    
    return null;
  }
}
