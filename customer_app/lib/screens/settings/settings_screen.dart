import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/ui/theme/colors.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _orderUpdates = true;
  bool _promotions = false;
  bool _newProducts = false;
  String _selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
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
          'Settings',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Account section
            _buildSectionHeader('Account'),
            _buildNavigationTile(
              title: 'Edit Profile',
              icon: Icons.person_outline,
              onTap: () {
                Navigator.pushNamed(context, '/profile/edit');
              },
            ),
            _buildNavigationTile(
              title: 'Change Password',
              icon: Icons.lock_outline,
              onTap: () {
                // TODO: Navigate to change password
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Change password coming soon')),
                );
              },
            ),
            _buildLanguageTile(),
            const SizedBox(height: 24),

            // Notifications section
            _buildSectionHeader('Notifications'),
            _buildSwitchTile(
              title: 'Order Updates',
              value: _orderUpdates,
              onChanged: (value) {
                setState(() {
                  _orderUpdates = value;
                });
              },
            ),
            _buildSwitchTile(
              title: 'Promotions',
              value: _promotions,
              onChanged: (value) {
                setState(() {
                  _promotions = value;
                });
              },
            ),
            _buildSwitchTile(
              title: 'New Products',
              value: _newProducts,
              onChanged: (value) {
                setState(() {
                  _newProducts = value;
                });
              },
            ),
            const SizedBox(height: 24),

            // App section
            _buildSectionHeader('App'),
            _buildInfoTile(
              title: 'App Version',
              value: 'v1.0.0',
            ),
            _buildNavigationTile(
              title: 'Rate Us',
              icon: Icons.star_outline,
              onTap: () {
                // TODO: Open app store
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening app store...')),
                );
              },
            ),
            _buildNavigationTile(
              title: 'Share App',
              icon: Icons.share_outlined,
              onTap: () {
                // TODO: Implement share
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Share app coming soon')),
                );
              },
            ),
            const SizedBox(height: 24),

            // Danger Zone section
            _buildSectionHeader('Danger Zone'),
            _buildDangerTile(
              title: 'Delete Account',
              icon: Icons.delete_outline,
              onTap: () {
                _showDeleteAccountDialog();
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildNavigationTile({
    required String title,
    required IconData icon,
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

  Widget _buildSwitchTile({
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey[200]!),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: OkadaColors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile({
    required String title,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey[200]!),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLanguageTile() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey[200]!),
        ),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Text(
              'Language',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildLanguageOption('English'),
                Container(
                  width: 1,
                  height: 20,
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  color: Colors.grey[300],
                ),
                _buildLanguageOption('Français'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLanguageOption(String language) {
    final isSelected = _selectedLanguage == language;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedLanguage = language;
        });
        // TODO: Implement language change
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Language changed to $language')),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? OkadaColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          language,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            color: isSelected ? Colors.white : Colors.grey[700],
          ),
        ),
      ),
    );
  }

  Widget _buildDangerTile({
    required String title,
    required IconData icon,
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
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Colors.red,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right,
              size: 24,
              color: Colors.red[300],
            ),
          ],
        ),
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text(
          'Are you sure you want to delete your account? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement account deletion
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Account deletion requested'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

