import 'package:flutter/material.dart';
import 'package:shared/ui/theme/colors.dart';

class RiderProfileScreen extends StatelessWidget {
  const RiderProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock rider data
    final riderData = {
      'name': 'Patrick Mboma',
      'phone': '+234 801 234 5678',
      'memberSince': 'Mar 2022',
      'deliveries': 234,
      'rating': 4.8,
      'acceptance': 95,
      'avatarUrl': null,
    };

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5DC),
      body: SafeArea(
        child: ListView(
          children: [
            const SizedBox(height: 40),
            // Profile avatar
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.grey[300],
                      image: riderData['avatarUrl'] != null
                          ? DecorationImage(
                              image: NetworkImage(riderData['avatarUrl']),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: riderData['avatarUrl'] == null
                        ? Icon(
                            Icons.person,
                            size: 80,
                            color: Colors.grey[600],
                          )
                        : null,
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        color: OkadaColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Name
            Text(
              riderData['name'],
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            // Phone
            Text(
              riderData['phone'],
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 4),
            // Member since
            Text(
              'Member since ${riderData['memberSince']}',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),
            // Stats
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Deliveries',
                      riderData['deliveries'].toString(),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      riderData['rating'].toString(),
                      '4,8',
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      'Acceptance',
                      '${riderData['acceptance']}%',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Menu items
            _buildMenuItem(
              context,
              Icons.edit_outlined,
              'Edit Profile',
              '/edit-profile',
            ),
            _buildMenuItem(
              context,
              Icons.receipt_long_outlined,
              'Earnings',
              '/earnings',
            ),
            _buildMenuItem(
              context,
              Icons.history,
              'Order History',
              '/order-history',
            ),
            _buildMenuItem(
              context,
              Icons.motorcycle_outlined,
              'Vehicle Details',
              '/vehicle-details',
            ),
            _buildMenuItem(
              context,
              Icons.description_outlined,
              'Documents',
              '/documents',
            ),
            _buildMenuItem(
              context,
              Icons.credit_card_outlined,
              'Payment Methods',
              '/payment-methods',
            ),
            _buildMenuItem(
              context,
              Icons.star_outline,
              'Ratings & Reviews',
              '/ratings-reviews',
            ),
            _buildMenuItem(
              context,
              Icons.notifications_outlined,
              'Notification Settings',
              '/notification-settings',
            ),
            _buildMenuItem(
              context,
              Icons.help_outline,
              'Help Center',
              '/help-center',
            ),
            const SizedBox(height: 24),
            // Logout button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: () {
                    _showLogoutDialog(context);
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.red),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Logout',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.red,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 100), // Space for bottom nav
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildStatCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    IconData icon,
    String title,
    String route,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(icon, size: 24),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.pushNamed(context, route);
        },
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return Container(
      decoration: BoxShadow(
        color: Colors.black.withOpacity(0.1),
        blurRadius: 10,
        offset: const Offset(0, -2),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(context, Icons.home, false, '/dashboard'),
              _buildNavItem(context, Icons.receipt_long, false, '/order-history'),
              _buildNavItem(context, Icons.notifications, false, '/notifications'),
              _buildNavItem(context, Icons.person, true, '/profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    IconData icon,
    bool isActive,
    String route,
  ) {
    return GestureDetector(
      onTap: () {
        if (route != '/profile') {
          Navigator.pushNamed(context, route);
        }
      },
      child: Icon(
        icon,
        color: isActive ? OkadaColors.primary : Colors.grey[400],
        size: 28,
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

