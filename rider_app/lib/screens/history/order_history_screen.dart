import 'package:flutter/material.dart';
import 'package:shared/ui/theme/colors.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  String _selectedFilter = 'Completed';

  // Mock order history data
  final List<Map<String, dynamic>> _orders = [
    {
      'id': '00014021',
      'date': '27 April, 2021',
      'time': '18 apr. am.',
      'pickup': 'Doutara',
      'delivery': 'Lria Douala',
      'distance': 2.1,
      'earnings': 104500,
      'status': 'COMPLETED',
    },
    {
      'id': '00024023',
      'date': '18 Mar, 2023',
      'time': '3,5 km. 4 ap.',
      'pickup': 'Douraboug',
      'delivery': 'Cite Douaala',
      'distance': 5.5,
      'earnings': 226600,
      'status': 'COMPLETED',
    },
    {
      'id': '00064028',
      'date': '25 Mar, 2023',
      'time': '5,7 km 30pr',
      'pickup': 'Rre Douc',
      'delivery': 'Boullagu',
      'distance': 3.5,
      'earnings': 55330,
      'status': 'COMPLETED',
    },
    {
      'id': '00034028',
      'date': '28 Mar, 2028',
      'time': '64km Cant',
      'pickup': 'Duentanet',
      'delivery': 'Dounela',
      'distance': 6.6,
      'earnings': 145000,
      'status': 'COMPLETED',
    },
  ];

  List<Map<String, dynamic>> get _filteredOrders {
    if (_selectedFilter == 'All') return _orders;
    return _orders.where((o) => o['status'] == _selectedFilter.toUpperCase()).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5DC),
      body: SafeArea(
        child: Column(
          children: [
            // Header with date range and filter
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Jan 1, 2024 – Apr 24, 2024',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      // TODO: Show filter dialog
                    },
                    child: const Text(
                      'Filter',
                      style: TextStyle(
                        fontSize: 16,
                        color: OkadaColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Filter tabs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  _buildFilterTab('All'),
                  const SizedBox(width: 24),
                  _buildFilterTab('Completed'),
                  const SizedBox(width: 24),
                  _buildFilterTab('Cancelled'),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Orders list
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                itemCount: _filteredOrders.length,
                itemBuilder: (context, index) {
                  return _buildOrderCard(_filteredOrders[index]);
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildFilterTab(String filter) {
    final isSelected = _selectedFilter == filter;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedFilter = filter);
      },
      child: Column(
        children: [
          Text(
            filter,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: isSelected ? OkadaColors.primary : Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          if (isSelected)
            Container(
              height: 3,
              width: 40,
              decoration: BoxDecoration(
                color: OkadaColors.primary,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> order) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
      child: Row(
        children: [
          // Map thumbnail
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Stack(
              children: [
                // Mock map background
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: LinearGradient(
                      colors: [
                        Colors.grey[300]!,
                        Colors.grey[200]!,
                      ],
                    ),
                  ),
                ),
                // Pickup marker
                const Positioned(
                  top: 20,
                  left: 25,
                  child: Icon(
                    Icons.circle,
                    color: OkadaColors.primary,
                    size: 12,
                  ),
                ),
                // Delivery marker
                const Positioned(
                  bottom: 20,
                  right: 25,
                  child: Icon(
                    Icons.circle,
                    color: Colors.red,
                    size: 12,
                  ),
                ),
                // Route line
                Positioned.fill(
                  child: CustomPaint(
                    painter: RouteLinePainter(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Order details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      order['id'],
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      order['time'],
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${order['date']} ${order['pickup']}',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${order['distance']} km ${order['delivery']}',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'FCFA ${order['earnings'].toString().replaceAllMapped(
                            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                            (Match m) => '${m[1]} ',
                          )}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: order['status'] == 'COMPLETED'
                            ? OkadaColors.primary
                            : Colors.red,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        order['status'],
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(Icons.home, false, '/dashboard'),
              _buildNavItem(Icons.receipt_long, true, '/order-history'),
              _buildNavItem(Icons.notifications, false, '/notifications'),
              _buildNavItem(Icons.person, false, '/profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, bool isActive, String route) {
    return GestureDetector(
      onTap: () {
        if (route != '/order-history') {
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
}

class RouteLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey[400]!
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..moveTo(size.width * 0.35, size.height * 0.3)
      ..lineTo(size.width * 0.65, size.height * 0.7);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

