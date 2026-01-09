import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:okada_ui/okada_ui.dart';

void main() {
  group('CountryFlag', () {
    testWidgets('should display emoji flag by default', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CountryFlag(country: AfricanCountry.cameroon),
          ),
        ),
      );

      expect(find.text('🇨🇲'), findsOneWidget);
    });

    testWidgets('should display stripes flag style', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CountryFlag(
              country: AfricanCountry.cameroon,
              style: FlagDisplayStyle.stripes,
              size: 40,
            ),
          ),
        ),
      );

      // Should render a container with colored stripes
      expect(find.byType(ClipRRect), findsOneWidget);
    });

    testWidgets('should display badge flag style', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CountryFlag(
              country: AfricanCountry.nigeria,
              style: FlagDisplayStyle.badge,
              size: 32,
            ),
          ),
        ),
      );

      // Should render a circular container
      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container.decoration, isA<BoxDecoration>());
    });

    testWidgets('should display dot flag style', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CountryFlag(
              country: AfricanCountry.ghana,
              style: FlagDisplayStyle.dot,
              size: 24,
            ),
          ),
        ),
      );

      // Should render a small circular dot
      expect(find.byType(Container), findsOneWidget);
    });
  });

  group('CountrySelector', () {
    testWidgets('should display selected country', (tester) async {
      AfricanCountry selectedCountry = AfricanCountry.cameroon;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CountrySelector(
              selectedCountry: selectedCountry,
              onCountryChanged: (country) {
                selectedCountry = country;
              },
            ),
          ),
        ),
      );

      expect(find.text('Cameroon'), findsOneWidget);
    });

    testWidgets('should show dropdown when tapped', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CountrySelector(
              selectedCountry: AfricanCountry.cameroon,
              onCountryChanged: (_) {},
            ),
          ),
        ),
      );

      await tester.tap(find.byType(DropdownButton<AfricanCountry>));
      await tester.pumpAndSettle();

      // Should show all supported countries
      expect(find.text('Nigeria'), findsWidgets);
      expect(find.text('Ghana'), findsWidgets);
    });
  });

  group('CountryInfoCard', () {
    testWidgets('should display country information', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CountryInfoCard(country: AfricanCountry.cameroon),
            ),
          ),
        ),
      );

      expect(find.text('Cameroon'), findsOneWidget);
      expect(find.text('Cameroun'), findsOneWidget);
      expect(find.text('+237'), findsOneWidget);
    });

    testWidgets('should display compact version', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CountryInfoCard(
              country: AfricanCountry.kenya,
              compact: true,
            ),
          ),
        ),
      );

      expect(find.text('Kenya'), findsOneWidget);
      expect(find.textContaining('+254'), findsOneWidget);
    });
  });

  group('CountryThemeProvider', () {
    testWidgets('should provide country theme to descendants', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: CountryThemeScope(
            initialCountry: AfricanCountry.cameroon,
            child: Builder(
              builder: (context) {
                final theme = CountryThemeProvider.of(context);
                return Text(theme.config.nameEn);
              },
            ),
          ),
        ),
      );

      expect(find.text('Cameroon'), findsOneWidget);
    });

    testWidgets('should update when country changes', (tester) async {
      final key = GlobalKey<CountryThemeScopeState>();

      await tester.pumpWidget(
        MaterialApp(
          home: CountryThemeScope(
            key: key,
            initialCountry: AfricanCountry.cameroon,
            child: Builder(
              builder: (context) {
                final theme = CountryThemeProvider.of(context);
                return Text(theme.config.nameEn);
              },
            ),
          ),
        ),
      );

      expect(find.text('Cameroon'), findsOneWidget);

      // Change country
      key.currentState!.setCountry(AfricanCountry.nigeria);
      await tester.pump();

      expect(find.text('Nigeria'), findsOneWidget);
    });
  });

  group('CulturalPatternBackground', () {
    testWidgets('should render pattern behind child', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CulturalPatternBackground(
              country: AfricanCountry.cameroon,
              child: Center(
                child: Text('Content'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Content'), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
    });
  });
}
