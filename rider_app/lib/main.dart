import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/theme.dart';

void main() {
  runApp(
    const ProviderScope(
      child: OkadaRiderApp(),
    ),
  );
}

class OkadaRiderApp extends StatelessWidget {
  const OkadaRiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Okada Rider',
      debugShowCheckedModeBanner: false,
      theme: OkadaTheme.lightTheme,
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Okada Rider'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Okada logo placeholder
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.delivery_dining,
                size: 60,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Welcome to Okada',
              style: Theme.of(context).textTheme.displaySmall,
            ),
            const SizedBox(height: 16),
            Text(
              'Rider App',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                // TODO: Navigate to dashboard
              },
              child: const Text('Get Started'),
            ),
          ],
        ),
      ),
    );
  }
}

