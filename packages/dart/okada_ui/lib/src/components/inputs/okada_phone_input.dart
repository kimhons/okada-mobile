import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_typography.dart';
import '../../theme/okada_spacing.dart';
import '../../theme/okada_border_radius.dart';

/// Cameroon phone number prefixes
enum CameroonCarrier {
  mtn,
  orange,
  unknown,
}

/// Okada Platform Phone Input Component
class OkadaPhoneInput extends StatefulWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? errorText;
  final String? helperText;
  final bool enabled;
  final ValueChanged<String>? onChanged;
  final ValueChanged<CameroonCarrier>? onCarrierDetected;
  final ValueChanged<String>? onSubmitted;
  final FocusNode? focusNode;

  const OkadaPhoneInput({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.errorText,
    this.helperText,
    this.enabled = true,
    this.onChanged,
    this.onCarrierDetected,
    this.onSubmitted,
    this.focusNode,
  });

  @override
  State<OkadaPhoneInput> createState() => _OkadaPhoneInputState();
}

class _OkadaPhoneInputState extends State<OkadaPhoneInput> {
  late TextEditingController _controller;
  late FocusNode _focusNode;
  bool _isFocused = false;
  CameroonCarrier _detectedCarrier = CameroonCarrier.unknown;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_handleFocusChange);
    _controller.addListener(_detectCarrier);
  }

  @override
  void dispose() {
    if (widget.controller == null) _controller.dispose();
    if (widget.focusNode == null) _focusNode.dispose();
    super.dispose();
  }

  void _handleFocusChange() {
    setState(() => _isFocused = _focusNode.hasFocus);
  }

  void _detectCarrier() {
    final phone = _controller.text.replaceAll(RegExp(r'\D'), '');
    CameroonCarrier carrier = CameroonCarrier.unknown;
    
    if (phone.length >= 2) {
      final prefix = phone.substring(0, 2);
      if (prefix == '67' || prefix == '68') {
        carrier = CameroonCarrier.mtn;
      } else if (prefix == '69') {
        carrier = CameroonCarrier.orange;
      } else if (prefix == '65' && phone.length >= 3) {
        final thirdDigit = int.tryParse(phone[2]) ?? 0;
        carrier = thirdDigit <= 4 ? CameroonCarrier.mtn : CameroonCarrier.orange;
      }
    }
    
    if (carrier != _detectedCarrier) {
      setState(() => _detectedCarrier = carrier);
      widget.onCarrierDetected?.call(carrier);
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText?.isNotEmpty ?? false;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(widget.label!, style: OkadaTypography.labelMedium.copyWith(
            color: hasError ? OkadaColors.error : _isFocused ? OkadaColors.primary : OkadaColors.textSecondary,
          )),
          OkadaSpacing.gapVerticalXxs,
        ],
        TextFormField(
          controller: _controller,
          focusNode: _focusNode,
          enabled: widget.enabled,
          keyboardType: TextInputType.phone,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(9),
          ],
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          style: OkadaTypography.bodyMedium,
          decoration: InputDecoration(
            hintText: widget.hint ?? '6XX XXX XXX',
            prefixIcon: _buildPrefix(),
            suffixIcon: _buildCarrierIndicator(),
          ),
        ),
        if (hasError) ...[
          OkadaSpacing.gapVerticalXxs,
          Text(widget.errorText!, style: OkadaTypography.error),
        ],
      ],
    );
  }

  Widget _buildPrefix() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🇨🇲', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 8),
          Text('+237', style: OkadaTypography.bodyMedium.copyWith(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget? _buildCarrierIndicator() {
    if (_detectedCarrier == CameroonCarrier.unknown) return null;
    final isMtn = _detectedCarrier == CameroonCarrier.mtn;
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: (isMtn ? OkadaColors.mtnYellow : OkadaColors.orangeMoney).withOpacity(0.2),
        borderRadius: OkadaBorderRadius.radiusSm,
      ),
      child: Text(
        isMtn ? 'MTN' : 'Orange',
        style: OkadaTypography.labelSmall.copyWith(
          color: isMtn ? OkadaColors.mtnYellow : OkadaColors.orangeMoney,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
