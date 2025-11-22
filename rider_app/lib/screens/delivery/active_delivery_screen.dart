import 'package:flutter/material.dart';
import 'package:shared/ui/theme/colors.dart';

class ActiveDeliveryScreen extends StatefulWidget {
  final String orderId;

  const ActiveDeliveryScreen({
    super.key,
    required this.orderId,
  });

  @override
  State<ActiveDeliveryScreen> createState() => _ActiveDeliveryScreenState();
}

class _ActiveDeliveryScreenState extends State<ActiveDeliveryScreen> {
  bool _hasPickedUp = false;

  // Mock delivery data
  final Map<String, dynamic> _delivery = {
    'orderId': '1234',
    'customerName': 'Mathieu Ndour',
    'address': '456 Rue de Dakar',
    'distance': 1.2,
    'estimatedTime': 8,
    'fee': 1500,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map area
          Container(
            color: Colors.grey[200],
            child: Stack(
              children: [
                // Mock map background
                Center(
                  child: Icon(
                    Icons.map,
                    size: 100,
                    color: Colors.grey[400],
                  ),
                ),
                // Route line
                CustomPaint(
                  size: Size(MediaQuery.of(context).size.width,
                      MediaQuery.of(context).size.height * 0.6),
                  painter: _RoutePainter(),
                ),
                // Pickup marker (blue)
                const Positioned(
                  top: 100,
                  left: 100,
                  child: Icon(
                    Icons.location_on,
                    color: Colors.blue,
                    size: 48,
                  ),
                ),
                // Delivery marker (red)
                Positioned(
                  bottom: 200,
                  right: 100,
                  child: Icon(
                    Icons.location_on,
                    color: Colors.red,
                    size: 48,
                  ),
                ),
                // Rider location (blue dot with pulse)
                Positioned(
                  bottom: 250,
                  right: 120,
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Container(
                        width: 20,
                        height: 20,
                        decoration: const BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Bottom sheet
          DraggableScrollableSheet(
            initialChildSize: 0.4,
            minChildSize: 0.4,
            maxChildSize: 0.8,
            builder: (context, scrollController) {
              return Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24),
                  ),
                ),
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(24),
                  children: [
                    // Drag handle
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Order ID
                    Text(
                      'ORDER #${_delivery['orderId']}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Customer name
                    Text(
                      _delivery['customerName'],
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    // Address
                    Text(
                      _delivery['address'],
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Stats row
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatItem(
                            icon: Icons.access_time,
                            value: '${_delivery['distance']} km',
                            label: 'Remaining',
                          ),
                        ),
                        Expanded(
                          child: _buildStatItem(
                            icon: Icons.timer,
                            value: '${_delivery['estimatedTime']} min',
                            label: 'Est. arrival',
                          ),
                        ),
                        Expanded(
                          child: _buildStatItem(
                            icon: Icons.account_balance_wallet,
                            value: '${_delivery['fee']} FCFA',
                            label: 'Delivery fee',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Navigate button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _openNavigation,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: OkadaColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.navigation, color: Colors.white),
                            SizedBox(width: 12),
                            Text(
                              'Navigate',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Call customer button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: OutlinedButton(
                        onPressed: _callCustomer,
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: Colors.grey[400]!),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.phone, color: Colors.black),
                            SizedBox(width: 12),
                            Text(
                              'Call Customer',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.black,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Report issue button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: OutlinedButton(
                        onPressed: _reportIssue,
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: Colors.grey[400]!),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.warning, color: Colors.black),
                            SizedBox(width: 12),
                            Text(
                              'Report Issue',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.black,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Pickup/Delivery complete button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _handleNextStep,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: OkadaColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(
                          _hasPickedUp ? 'Arrived at Delivery' : 'Arrived at Pickup',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          // Back button
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            left: 16,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Column(
      children: [
        Icon(icon, size: 24, color: Colors.grey[600]),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  void _openNavigation() {
    // TODO: Open Google Maps or other navigation app
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Opening navigation...')),
    );
  }

  void _callCustomer() {
    // TODO: Make phone call
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Calling customer...')),
    );
  }

  void _reportIssue() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Report Issue'),
        content: const Text('What issue would you like to report?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Handle issue reporting
            },
            child: const Text('Report'),
          ),
        ],
      ),
    );
  }

  void _handleNextStep() {
    if (!_hasPickedUp) {
      // Arrived at pickup - navigate to quality verification
      Navigator.pushNamed(
        context,
        '/quality-verification',
        arguments: widget.orderId,
      );
    } else {
      // Arrived at delivery - mark as complete
      Navigator.pushNamed(
        context,
        '/delivery-complete',
        arguments: widget.orderId,
      );
    }
  }
}

// Custom painter for route line
class _RoutePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = OkadaColors.primary
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path()
      ..moveTo(100, 100)
      ..lineTo(size.width * 0.4, size.height * 0.3)
      ..lineTo(size.width * 0.6, size.height * 0.5)
      ..lineTo(size.width - 100, size.height - 200);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

