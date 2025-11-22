import 'dart:io';
import 'package:flutter/material.dart';
import 'package:shared/ui/theme/colors.dart';
import 'package:camera/camera.dart';

class QualityVerificationScreen extends StatefulWidget {
  final String orderId;

  const QualityVerificationScreen({
    super.key,
    required this.orderId,
  });

  @override
  State<QualityVerificationScreen> createState() => _QualityVerificationScreenState();
}

class _QualityVerificationScreenState extends State<QualityVerificationScreen> {
  CameraController? _cameraController;
  List<String> _capturedPhotos = [];
  bool _isInitialized = false;
  bool _isCapturing = false;

  final int _requiredPhotos = 3;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        // No camera available - use mock mode
        setState(() => _isInitialized = true);
        return;
      }

      _cameraController = CameraController(
        cameras.first,
        ResolutionPreset.high,
        enableAudio: false,
      );

      await _cameraController!.initialize();
      if (mounted) {
        setState(() => _isInitialized = true);
      }
    } catch (e) {
      // Camera initialization failed - use mock mode
      setState(() => _isInitialized = true);
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _capturePhoto() async {
    if (_isCapturing || _capturedPhotos.length >= _requiredPhotos) return;

    setState(() => _isCapturing = true);

    try {
      if (_cameraController != null && _cameraController!.value.isInitialized) {
        final image = await _cameraController!.takePicture();
        setState(() {
          _capturedPhotos.add(image.path);
        });
      } else {
        // Mock photo capture
        setState(() {
          _capturedPhotos.add('mock_photo_${_capturedPhotos.length + 1}.jpg');
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to capture photo: $e')),
      );
    } finally {
      setState(() => _isCapturing = false);
    }
  }

  void _deletePhoto(int index) {
    setState(() {
      _capturedPhotos.removeAt(index);
    });
  }

  void _proceedToReview() {
    if (_capturedPhotos.length < _requiredPhotos) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please capture all $_requiredPhotos photos'),
        ),
      );
      return;
    }

    Navigator.pushReplacementNamed(
      context,
      '/verification-review',
      arguments: {
        'orderId': widget.orderId,
        'photos': _capturedPhotos,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Text(
                          'Take clear photos of products\nfor customer approval',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            height: 1.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Guidelines
                  _buildGuideline('Ensure all items are visible'),
                  _buildGuideline('Good lighting required'),
                  _buildGuideline('Multiple angles recommended'),
                ],
              ),
            ),
            // Camera preview or mock preview
            Expanded(
              child: Stack(
                children: [
                  // Camera preview
                  if (_cameraController != null &&
                      _cameraController!.value.isInitialized)
                    Center(
                      child: AspectRatio(
                        aspectRatio: _cameraController!.value.aspectRatio,
                        child: CameraPreview(_cameraController!),
                      ),
                    )
                  else
                    // Mock camera preview
                    Container(
                      color: Colors.grey[800],
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.camera_alt,
                              size: 80,
                              color: Colors.grey[600],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Camera Preview',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[400],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  // Grid overlay
                  CustomPaint(
                    size: Size.infinite,
                    painter: _GridPainter(),
                  ),
                  // Photo counter
                  Positioned(
                    top: 24,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${_capturedPhotos.length} of $_requiredPhotos photos',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Bottom controls
            Container(
              color: Colors.black,
              padding: const EdgeInsets.all(24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Gallery button
                  _buildControlButton(
                    icon: Icons.photo_library,
                    onTap: () {
                      // TODO: Open gallery
                    },
                  ),
                  // Capture button
                  GestureDetector(
                    onTap: _capturePhoto,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 4),
                      ),
                      child: Container(
                        margin: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: _capturedPhotos.length >= _requiredPhotos
                              ? Colors.grey
                              : OkadaColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
                  // Grid toggle button
                  _buildControlButton(
                    icon: Icons.grid_on,
                    onTap: () {
                      // TODO: Toggle grid
                    },
                  ),
                ],
              ),
            ),
            // Thumbnail strip
            if (_capturedPhotos.isNotEmpty)
              Container(
                height: 100,
                color: Colors.black,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: _capturedPhotos.length,
                  itemBuilder: (context, index) {
                    return _buildThumbnail(index);
                  },
                ),
              ),
            // Continue button
            if (_capturedPhotos.length >= _requiredPhotos)
              Container(
                padding: const EdgeInsets.all(24),
                color: Colors.white,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _proceedToReview,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: OkadaColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Continue',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildGuideline(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const Icon(Icons.circle, size: 8),
          const SizedBox(width: 12),
          Text(
            text,
            style: const TextStyle(fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: Colors.grey[800],
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 28,
        ),
      ),
    );
  }

  Widget _buildThumbnail(int index) {
    return Container(
      width: 80,
      height: 80,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.grey[800],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: OkadaColors.primary, width: 2),
      ),
      child: Stack(
        children: [
          // Photo preview
          if (_capturedPhotos[index].startsWith('mock'))
            Center(
              child: Icon(
                Icons.image,
                color: Colors.grey[600],
                size: 40,
              ),
            )
          else
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.file(
                File(_capturedPhotos[index]),
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
              ),
            ),
          // Delete button
          Positioned(
            top: 4,
            right: 4,
            child: GestureDetector(
              onTap: () => _deletePhoto(index),
              child: Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.close,
                  color: Colors.white,
                  size: 16,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Grid overlay painter
class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..strokeWidth = 1;

    // Vertical lines
    canvas.drawLine(
      Offset(size.width / 3, 0),
      Offset(size.width / 3, size.height),
      paint,
    );
    canvas.drawLine(
      Offset(size.width * 2 / 3, 0),
      Offset(size.width * 2 / 3, size.height),
      paint,
    );

    // Horizontal lines
    canvas.drawLine(
      Offset(0, size.height / 3),
      Offset(size.width, size.height / 3),
      paint,
    );
    canvas.drawLine(
      Offset(0, size.height * 2 / 3),
      Offset(size.width, size.height * 2 / 3),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

