import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/ui/theme/colors.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Mock user data - will be replaced with provider data
    final user = {
      'name': 'John Doe',
      'email': 'johndoe@example.com',
      'phone': '+237 6XX XXX XXX',
      'avatar': null,
    };

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Profile',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 24),
            // Profile header
            _buildProfileHeader(context, user),
            const SizedBox(height: 32),
            // Menu items
            _buildMenuItem(
              context,
              icon: Icons.shopping_bag_outlined,
              title: 'My Orders',
              onTap: () {
                Navigator.pushNamed(context, '/order/history');
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.favorite_outline,
              title: 'Favorites',
              onTap: () {
                // TODO: Navigate to favorites
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Favorites coming soon')),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.location_on_outlined,
              title: 'Addresses',
              onTap: () {
                Navigator.pushNamed(context, '/profile/addresses');
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.payment_outlined,
              title: 'Payment Methods',
              onTap: () {
                // TODO: Navigate to payment methods
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Payment methods coming soon')),
                );
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.notifications_outlined,
              title: 'Notifications',
              onTap: () {
                Navigator.pushNamed(context, '/notifications');
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.help_outline,
              title: 'Help & Support',
              onTap: () {
                Navigator.pushNamed(context, '/help');
              },
            ),
            _buildMenuItem(
              context,
              icon: Icons.settings_outlined,
              title: 'Settings',
              onTap: () {
                Navigator.pushNamed(context, '/settings');
              },
            ),
            const SizedBox(height: 24),
            // Logout button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: () {
                    _showLogoutDialog(context);
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Logout',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, Map<String, dynamic> user) {
    return Column(
      children: [
        // Avatar
        Stack(
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.grey[200],
              ),
              child: user['avatar'] != null
                  ? ClipOval(
                      child: Image.network(
                        user['avatar'],
                        fit: BoxFit.cover,
                      ),
                    )
                  : Icon(
                      Icons.person,
                      size: 60,
                      color: Colors.grey[400],
                    ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Name
        Text(
          user['name'],
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        // Email
        Text(
          user['email'],
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey[600],
          ),
        ),
        const SizedBox(height: 16),
        // Edit Profile button
        TextButton(
          onPressed: () {
            Navigator.pushNamed(context, '/profile/edit');
          },
          child: const Text(
            'Edit Profile',
            style: TextStyle(
              fontSize: 16,
              color: Colors.blue,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Colors.grey[200]!),
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 28, color: Colors.black),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right,
              size: 24,
              color: Colors.grey[400],
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // TODO: Implement logout
              Navigator.pop(context);
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/login',
                (route) => false,
              );
            },
            child: const Text(
              'Logout',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

