import 'package:flutter/material.dart';
import '../theme/african_countries.dart';
import '../theme/okada_border_radius.dart';

/// Display style for country flags
enum FlagDisplayStyle {
  /// Emoji flag
  emoji,
  
  /// Colored stripes (simplified)
  stripes,
  
  /// Circular badge with stripes
  badge,
  
  /// Small indicator dot with primary color
  dot,
}

/// Widget to display country flag
class CountryFlag extends StatelessWidget {
  final AfricanCountry country;
  final FlagDisplayStyle style;
  final double size;
  final BorderRadius? borderRadius;

  const CountryFlag({
    super.key,
    required this.country,
    this.style = FlagDisplayStyle.emoji,
    this.size = 24,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final config = AfricanCountryRegistry.getConfig(country);

    switch (style) {
      case FlagDisplayStyle.emoji:
        return Text(
          config.flagEmoji,
          style: TextStyle(fontSize: size),
        );

      case FlagDisplayStyle.stripes:
        return _buildStripes(config);

      case FlagDisplayStyle.badge:
        return _buildBadge(config);

      case FlagDisplayStyle.dot:
        return _buildDot(config);
    }
  }

  Widget _buildStripes(CountryConfig config) {
    final colors = config.flagColors.take(3).toList();
    final stripeHeight = size / colors.length;

    return ClipRRect(
      borderRadius: borderRadius ?? OkadaBorderRadius.radiusXs,
      child: SizedBox(
        width: size * 1.5,
        height: size,
        child: Column(
          children: colors.map((color) => Container(
            height: stripeHeight,
            color: color,
          )).toList(),
        ),
      ),
    );
  }

  Widget _buildBadge(CountryConfig config) {
    final colors = config.flagColors.take(3).toList();

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: colors,
        ),
        border: Border.all(
          color: Colors.white,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
    );
  }

  Widget _buildDot(CountryConfig config) {
    return Container(
      width: size / 2,
      height: size / 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: config.primaryAccent,
      ),
    );
  }
}

/// Country selector dropdown
class CountrySelector extends StatelessWidget {
  final AfricanCountry selectedCountry;
  final ValueChanged<AfricanCountry> onCountryChanged;
  final List<AfricanCountry>? availableCountries;
  final bool showFlag;
  final bool showName;

  const CountrySelector({
    super.key,
    required this.selectedCountry,
    required this.onCountryChanged,
    this.availableCountries,
    this.showFlag = true,
    this.showName = true,
  });

  @override
  Widget build(BuildContext context) {
    final countries = availableCountries ?? AfricanCountryRegistry.supportedCountries;

    return DropdownButton<AfricanCountry>(
      value: selectedCountry,
      onChanged: (country) {
        if (country != null) {
          onCountryChanged(country);
        }
      },
      items: countries.map((country) {
        final config = AfricanCountryRegistry.getConfig(country);
        return DropdownMenuItem(
          value: country,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (showFlag) ...[
                CountryFlag(country: country, size: 20),
                const SizedBox(width: 8),
              ],
              if (showName) Text(config.nameEn),
            ],
          ),
        );
      }).toList(),
    );
  }
}

/// Country info card
class CountryInfoCard extends StatelessWidget {
  final AfricanCountry country;
  final bool compact;

  const CountryInfoCard({
    super.key,
    required this.country,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final config = AfricanCountryRegistry.getConfig(country);

    if (compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          CountryFlag(country: country, style: FlagDisplayStyle.badge, size: 32),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(config.nameEn, style: const TextStyle(fontWeight: FontWeight.w600)),
              Text(
                '${config.dialingCode} · ${config.currencyCode}',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
        ],
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CountryFlag(country: country, style: FlagDisplayStyle.stripes, size: 40),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        config.nameEn,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        config.nameFr,
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildInfoRow('Country Code', config.countryCode),
            _buildInfoRow('Dialing Code', config.dialingCode),
            _buildInfoRow('Currency', '${config.currencySymbol} (${config.currencyCode})'),
            _buildInfoRow('Languages', config.languages.join(', ')),
            _buildInfoRow('Mobile Money', config.mobileMoneyProviders.join(', ')),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 14)),
          ),
        ],
      ),
    );
  }
}
