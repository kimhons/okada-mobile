import 'dart:io';
import 'package:flutter/material.dart';
import 'package:shared/ui/theme/colors.dart';

class VerificationReviewScreen extends StatefulWidget {
  final String orderId;
  final List<String> photos;

  const VerificationReviewScreen({
    super.key,
    required this.orderId,
    required this.photos,
  });

  @override
  State<VerificationReviewScreen> createState() => _VerificationReviewScreenState();
}

class _VerificationReviewScreenState extends State<VerificationReviewScreen> {
  int _currentPhotoIndex = 0;
  bool _isUploading = false;

  Future<void> _uploadPhotos() async {
    setState(() => _isUploading = true);

    // TODO: Upload photos to server
    await Future.delayed(const Duration(seconds: 3));

    if (mounted) {
      setState(() => _isUploading = false);
      Navigator.pushReplacementNamed(
        context,
        '/waiting-approval',
        arguments: widget.orderId,
      );
    }
  }

  void _retakePhotos() {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Review Photos',
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Main photo display
          Expanded(
            child: GestureDetector(
              onTap: () {
                // TODO: Open fullscreen view
              },
              child: Container(
                margin: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.grey[900],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: widget.photos[_currentPhotoIndex].startsWith('mock')
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.image,
                              size: 100,
                              color: Colors.grey[700],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Photo ${_currentPhotoIndex + 1}',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      )
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.file(
                          File(widget.photos[_currentPhotoIndex]),
                          fit: BoxFit.contain,
                          width: double.infinity,
                          height: double.infinity,
                        ),
                      ),
              ),
            ),
          ),
          // Photo counter
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Text(
              '${_currentPhotoIndex + 1} of ${widget.photos.length}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
          // Thumbnail navigation
          Container(
            height: 100,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: widget.photos.length,
              itemBuilder: (context, index) {
                final isSelected = index == _currentPhotoIndex;
                return GestureDetector(
                  onTap: () {
                    setState(() => _currentPhotoIndex = index);
                  },
                  child: Container(
                    width: 80,
                    height: 80,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey[900],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? OkadaColors.primary : Colors.transparent,
                        width: 3,
                      ),
                    ),
                    child: widget.photos[index].startsWith('mock')
                        ? Center(
                            child: Icon(
                              Icons.image,
                              color: Colors.grey[700],
                              size: 32,
                            ),
                          )
                        : ClipRRect(
                            borderRadius: BorderRadius.circular(9),
                            child: Image.file(
                              File(widget.photos[index]),
                              fit: BoxFit.cover,
                            ),
                          ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          // Action buttons
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // Upload button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isUploading ? null : _uploadPhotos,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: OkadaColors.primary,
                        disabledBackgroundColor: Colors.grey[400],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isUploading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'Upload Photos',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Retake button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton(
                      onPressed: _isUploading ? null : _retakePhotos,
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.grey[400]!),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Retake Photos',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

