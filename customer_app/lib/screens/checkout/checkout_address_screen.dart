import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/ui/theme/colors.dart';

class CheckoutAddressScreen extends ConsumerStatefulWidget {
  const CheckoutAddressScreen({super.key});

  @override
  ConsumerState<CheckoutAddressScreen> createState() =>
      _CheckoutAddressScreenState();
}

class _CheckoutAddressScreenState extends ConsumerState<CheckoutAddressScreen> {
  int? _selectedAddressIndex;

  // Mock addresses - will be replaced with provider data
  final List<DeliveryAddress> _addresses = [
    DeliveryAddress(
      id: '1',
      street: '762 Little St',
      landmark: 'Near Pine Park',
      city: 'Yaoundé',
      isDefault: true,
    ),
    DeliveryAddress(
      id: '2',
      street: '430 Poplar St',
      landmark: 'Eastland Subdivision',
      city: 'Douala',
      isDefault: false,
    ),
    DeliveryAddress(
      id: '3',
      street: '918 Arnaiz Ave',
      landmark: 'Metro Estates',
      city: 'Yaoundé',
      isDefault: false,
    ),
  ];

  @override
  void initState() {
    super.initState();
    // Select default address
    _selectedAddressIndex =
        _addresses.indexWhere((address) => address.isDefault);
    if (_selectedAddressIndex == -1) _selectedAddressIndex = 0;
  }

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
          'Delivery Address',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Column(
        children: [
          // Map preview
          Container(
            height: 200,
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(16),
            ),
            child: Stack(
              children: [
                // Map placeholder with street pattern
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: const Color(0xFFF5F5DC),
                  ),
                  child: CustomPaint(
                    painter: _MapPainter(),
                    size: Size.infinite,
                  ),
                ),
                // Location marker
                const Center(
                  child: Icon(
                    Icons.location_on,
                    size: 48,
                    color: OkadaColors.primary,
                  ),
                ),
              ],
            ),
          ),

          // Address list
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Delivery Address',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _addresses.length + 1,
                      itemBuilder: (context, index) {
                        if (index == _addresses.length) {
                          // Add new address button
                          return _buildAddNewAddressButton();
                        }
                        return _buildAddressCard(index);
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Confirm button
          Container(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _selectedAddressIndex != null
                    ? () {
                        Navigator.pushNamed(
                          context,
                          '/checkout/payment',
                          arguments: _addresses[_selectedAddressIndex!],
                        );
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: OkadaColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Confirm Address',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard(int index) {
    final address = _addresses[index];
    final isSelected = _selectedAddressIndex == index;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? OkadaColors.primary : Colors.grey[300]!,
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedAddressIndex = index;
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Radio button
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color:
                        isSelected ? OkadaColors.primary : Colors.grey[400]!,
                    width: 2,
                  ),
                ),
                child: isSelected
                    ? Center(
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: OkadaColors.primary,
                          ),
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 16),
              // Address details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      address.street,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      address.landmark,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              // Edit button
              TextButton(
                onPressed: () {
                  // TODO: Navigate to edit address screen
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Edit address')),
                  );
                },
                child: const Text(
                  'Edit',
                  style: TextStyle(
                    color: OkadaColors.primary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAddNewAddressButton() {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: InkWell(
        onTap: () {
          // TODO: Navigate to add address screen
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Add new address')),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: OkadaColors.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.add,
                  color: OkadaColors.primary,
                ),
              ),
              const SizedBox(width: 16),
              const Text(
                'Add New Address',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Custom painter for map street pattern
class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Draw street grid pattern
    for (double i = 0; i < size.width; i += 40) {
      canvas.drawLine(
        Offset(i, 0),
        Offset(i + 30, size.height),
        paint,
      );
    }

    for (double i = 0; i < size.height; i += 40) {
      canvas.drawLine(
        Offset(0, i),
        Offset(size.width, i + 30),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Delivery Address model
class DeliveryAddress {
  final String id;
  final String street;
  final String landmark;
  final String city;
  final bool isDefault;

  DeliveryAddress({
    required this.id,
    required this.street,
    required this.landmark,
    required this.city,
    this.isDefault = false,
  });
}

