import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/ui/theme/colors.dart';

class HelpCenterScreen extends ConsumerStatefulWidget {
  const HelpCenterScreen({super.key});

  @override
  ConsumerState<HelpCenterScreen> createState() => _HelpCenterScreenState();
}

class _HelpCenterScreenState extends ConsumerState<HelpCenterScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final List<Map<String, dynamic>> _faqCategories = [
    {
      'title': 'Orders & Delivery',
      'icon': Icons.local_shipping_outlined,
      'faqs': [
        {
          'question': 'How do I track my order?',
          'answer':
              'You can track your order in real-time from the Order Tracking screen. Go to My Orders and select the order you want to track. You\'ll see the rider\'s location on the map and estimated delivery time.',
        },
        {
          'question': 'What is the delivery time?',
          'answer':
              'Delivery typically takes 30-60 minutes depending on your location and the seller\'s location. You\'ll see an estimated delivery time when placing your order.',
        },
        {
          'question': 'Can I cancel my order?',
          'answer':
              'Yes, you can cancel your order before the rider picks it up. Go to Order Details and tap "Cancel Order". If the rider has already picked up your order, please contact support.',
        },
      ],
    },
    {
      'title': 'Payments',
      'icon': Icons.payment_outlined,
      'faqs': [
        {
          'question': 'What payment methods are accepted?',
          'answer':
              'We accept MTN Mobile Money, Orange Money, and Cash on Delivery. You can select your preferred payment method during checkout.',
        },
        {
          'question': 'Is my payment information secure?',
          'answer':
              'Yes, all payment transactions are encrypted and secure. We never store your mobile money PIN or payment credentials.',
        },
        {
          'question': 'How do refunds work?',
          'answer':
              'If you reject an order after quality verification or if we cancel your order, you\'ll receive a full refund within 3-5 business days to your original payment method.',
        },
      ],
    },
    {
      'title': 'Quality Verification',
      'icon': Icons.verified_outlined,
      'faqs': [
        {
          'question': 'What is Quality Verification?',
          'answer':
              'Quality Verification is Okada\'s unique feature where the rider takes photos of your items before delivery. You can review the photos and approve or reject the order based on quality.',
        },
        {
          'question': 'What if I\'m not satisfied with the quality?',
          'answer':
              'If you\'re not satisfied with the quality shown in the photos, you can reject the order. You\'ll receive a full refund and can place a new order.',
        },
        {
          'question': 'Do I have to pay if I reject an order?',
          'answer':
              'No, you only pay after you approve the quality verification photos. If you reject the order, you won\'t be charged.',
        },
      ],
    },
    {
      'title': 'Account & Profile',
      'icon': Icons.person_outline,
      'faqs': [
        {
          'question': 'How do I update my profile?',
          'answer':
              'Go to Profile > Edit Profile to update your name, email, phone number, and date of birth. You can also change your profile photo.',
        },
        {
          'question': 'How do I change my password?',
          'answer':
              'Go to Settings > Change Password. You\'ll need to enter your current password and then your new password twice.',
        },
        {
          'question': 'How do I manage my delivery addresses?',
          'answer':
              'Go to Profile > Addresses to view, add, edit, or delete your delivery addresses. You can also set a default address.',
        },
      ],
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
          'Help & Support',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _searchQuery = value.toLowerCase();
                });
              },
              decoration: InputDecoration(
                hintText: 'Search for help...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _searchController.clear();
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Contact support button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(context, '/help/contact');
                },
                icon: const Icon(Icons.chat_bubble_outline),
                label: const Text(
                  'Contact Support',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: OkadaColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // FAQ categories
          Expanded(
            child: ListView.builder(
              itemCount: _faqCategories.length,
              itemBuilder: (context, index) {
                return _buildFAQCategory(_faqCategories[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFAQCategory(Map<String, dynamic> category) {
    final faqs = (category['faqs'] as List<Map<String, dynamic>>)
        .where((faq) =>
            _searchQuery.isEmpty ||
            (faq['question'] as String).toLowerCase().contains(_searchQuery) ||
            (faq['answer'] as String).toLowerCase().contains(_searchQuery))
        .toList();

    if (faqs.isEmpty && _searchQuery.isNotEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 12),
          child: Row(
            children: [
              Icon(
                category['icon'] as IconData,
                size: 24,
                color: OkadaColors.primary,
              ),
              const SizedBox(width: 12),
              Text(
                category['title'] as String,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        ...faqs.map((faq) => _buildFAQItem(faq)).toList(),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildFAQItem(Map<String, dynamic> faq) {
    return ExpansionTile(
      title: Text(
        faq['question'] as String,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(
            faq['answer'] as String,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[700],
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }
}

