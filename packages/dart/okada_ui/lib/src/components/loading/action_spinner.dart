import 'package:flutter/material.dart';
import '../../theme/okada_colors.dart';

/// Inline action spinner for buttons and small areas
class ActionSpinner extends StatelessWidget {
  final double size;
  final Color? color;
  final double strokeWidth;

  const ActionSpinner({
    super.key,
    this.size = 20,
    this.color,
    this.strokeWidth = 2,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        valueColor: AlwaysStoppedAnimation<Color>(color ?? OkadaColors.primary),
      ),
    );
  }
}
