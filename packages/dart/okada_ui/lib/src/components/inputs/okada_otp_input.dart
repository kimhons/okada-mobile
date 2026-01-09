import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_typography.dart';
import '../../theme/okada_spacing.dart';
import '../../theme/okada_border_radius.dart';

/// Okada Platform OTP Input Component
class OkadaOtpInput extends StatefulWidget {
  final int length;
  final ValueChanged<String>? onCompleted;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final bool enabled;
  final bool obscureText;
  final bool autofocus;

  const OkadaOtpInput({
    super.key,
    this.length = 6,
    this.onCompleted,
    this.onChanged,
    this.errorText,
    this.enabled = true,
    this.obscureText = false,
    this.autofocus = true,
  });

  @override
  State<OkadaOtpInput> createState() => _OkadaOtpInputState();
}

class _OkadaOtpInputState extends State<OkadaOtpInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _otp => _controllers.map((c) => c.text).join();

  void _onChanged(int index, String value) {
    if (value.isNotEmpty && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    
    widget.onChanged?.call(_otp);
    
    if (_otp.length == widget.length) {
      widget.onCompleted?.call(_otp);
    }
  }

  void _onKeyEvent(int index, KeyEvent event) {
    if (event is KeyDownEvent && 
        event.logicalKey == LogicalKeyboardKey.backspace &&
        _controllers[index].text.isEmpty &&
        index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText?.isNotEmpty ?? false;
    
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.length, (index) {
            return Padding(
              padding: EdgeInsets.only(right: index < widget.length - 1 ? OkadaSpacing.sm : 0),
              child: _buildOtpField(index, hasError),
            );
          }),
        ),
        if (hasError) ...[
          OkadaSpacing.gapVerticalSm,
          Text(widget.errorText!, style: OkadaTypography.error, textAlign: TextAlign.center),
        ],
      ],
    );
  }

  Widget _buildOtpField(int index, bool hasError) {
    return SizedBox(
      width: 48,
      height: 56,
      child: KeyboardListener(
        focusNode: FocusNode(),
        onKeyEvent: (event) => _onKeyEvent(index, event),
        child: TextField(
          controller: _controllers[index],
          focusNode: _focusNodes[index],
          enabled: widget.enabled,
          autofocus: widget.autofocus && index == 0,
          obscureText: widget.obscureText,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          maxLength: 1,
          style: OkadaTypography.headlineMedium,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onChanged: (value) => _onChanged(index, value),
          decoration: InputDecoration(
            counterText: '',
            filled: true,
            fillColor: OkadaColors.backgroundSecondary,
            border: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: BorderSide(color: hasError ? OkadaColors.error : OkadaColors.borderLight),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: OkadaBorderRadius.input,
              borderSide: BorderSide(color: hasError ? OkadaColors.error : OkadaColors.primary, width: 2),
            ),
          ),
        ),
      ),
    );
  }
}
