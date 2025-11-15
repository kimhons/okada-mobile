import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:okada_shared/ui/theme/theme.dart';

void main() {
  runApp(
    const ProviderScope(
      child: OkadaSellerApp(),
    ),
  );
}

class OkadaSellerApp extends StatelessWidget {
  const OkadaSellerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Okada Seller',
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
        title: const Text('Okada Seller'),
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
                Icons.store,
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
              'Seller App',
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

