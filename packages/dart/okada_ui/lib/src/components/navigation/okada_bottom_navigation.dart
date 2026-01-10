import 'package:flutter/material.dart';
import '../../theme/okada_design_system.dart';

/// Okada Bottom Navigation Bar (Screen 2.2)
/// 
/// Primary navigation across main app sections.
/// Based on the Okada UI design specifications.
/// 
/// Layout:
/// - Fixed bar at bottom of screen
/// - Height: 64px
/// - Background: White with top border
/// - 4 navigation items evenly spaced
class OkadaBottomNavigation extends StatelessWidget {
  const OkadaBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.hasActiveOrder = false,
  });

  /// Currently selected index (0-3)
  final int currentIndex;
  
  /// Callback when a navigation item is tapped
  final void Function(int index) onTap;
  
  /// Whether there's an active order (shows badge on Orders tab)
  final bool hasActiveOrder;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: OkadaDesignSystem.pureWhite,
        border: Border(
          top: BorderSide(
            color: OkadaDesignSystem.softClay,
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(
              icon: Icons.home_outlined,
              activeIcon: Icons.home,
              label: 'Home',
              isActive: currentIndex == 0,
              onTap: () => onTap(0),
            ),
            _NavItem(
              icon: Icons.grid_view_outlined,
              activeIcon: Icons.grid_view,
              label: 'Categories',
              isActive: currentIndex == 1,
              onTap: () => onTap(1),
            ),
            _NavItem(
              icon: Icons.shopping_bag_outlined,
              activeIcon: Icons.shopping_bag,
              label: 'Orders',
              isActive: currentIndex == 2,
              showBadge: hasActiveOrder,
              onTap: () => onTap(2),
            ),
            _NavItem(
              icon: Icons.person_outline,
              activeIcon: Icons.person,
              label: 'Account',
              isActive: currentIndex == 3,
              onTap: () => onTap(3),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isActive,
    required this.onTap,
    this.showBadge = false,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final bool showBadge;

  @override
  Widget build(BuildContext context) {
    final color = isActive 
        ? OkadaDesignSystem.okadaGreen 
        : OkadaDesignSystem.basketGray;
    
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  color: color,
                  size: 24,
                ),
                if (showBadge)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: OkadaDesignSystem.okadaRed,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Scaffold with Okada Bottom Navigation
/// 
/// A convenience widget that wraps a scaffold with the Okada bottom navigation.
class OkadaNavigationScaffold extends StatelessWidget {
  const OkadaNavigationScaffold({
    super.key,
    required this.currentIndex,
    required this.onNavigationTap,
    required this.body,
    this.hasActiveOrder = false,
    this.floatingActionButton,
    this.appBar,
    this.backgroundColor,
  });

  final int currentIndex;
  final void Function(int index) onNavigationTap;
  final Widget body;
  final bool hasActiveOrder;
  final Widget? floatingActionButton;
  final PreferredSizeWidget? appBar;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar,
      backgroundColor: backgroundColor ?? OkadaDesignSystem.marketWhite,
      body: body,
      bottomNavigationBar: OkadaBottomNavigation(
        currentIndex: currentIndex,
        onTap: onNavigationTap,
        hasActiveOrder: hasActiveOrder,
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}

/// Navigation Destinations
enum OkadaNavDestination {
  home,
  categories,
  orders,
  account,
}

extension OkadaNavDestinationExtension on OkadaNavDestination {
  int get index {
    switch (this) {
      case OkadaNavDestination.home:
        return 0;
      case OkadaNavDestination.categories:
        return 1;
      case OkadaNavDestination.orders:
        return 2;
      case OkadaNavDestination.account:
        return 3;
    }
  }
  
  String get label {
    switch (this) {
      case OkadaNavDestination.home:
        return 'Home';
      case OkadaNavDestination.categories:
        return 'Categories';
      case OkadaNavDestination.orders:
        return 'Orders';
      case OkadaNavDestination.account:
        return 'Account';
    }
  }
  
  String get labelFr {
    switch (this) {
      case OkadaNavDestination.home:
        return 'Accueil';
      case OkadaNavDestination.categories:
        return 'Catégories';
      case OkadaNavDestination.orders:
        return 'Commandes';
      case OkadaNavDestination.account:
        return 'Compte';
    }
  }
  
}

/// Convert index to OkadaNavDestination
OkadaNavDestination okadaNavDestinationFromIndex(int index) {
  switch (index) {
    case 0:
      return OkadaNavDestination.home;
    case 1:
      return OkadaNavDestination.categories;
    case 2:
      return OkadaNavDestination.orders;
    case 3:
      return OkadaNavDestination.account;
    default:
      return OkadaNavDestination.home;
  }
}
