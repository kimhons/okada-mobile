import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/tracking_data.dart';

/// Widget to display the order tracking map with markers and route
class OrderTrackingMap extends StatefulWidget {
  final String orderId;
  final TrackingData trackingData;

  const OrderTrackingMap({
    Key? key,
    required this.orderId,
    required this.trackingData,
  }) : super(key: key);

  @override
  State<OrderTrackingMap> createState() => _OrderTrackingMapState();
}

class _OrderTrackingMapState extends State<OrderTrackingMap> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};
  Timer? _animationTimer;

  @override
  void initState() {
    super.initState();
    _updateMapElements();
  }

  @override
  void didUpdateWidget(OrderTrackingMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.trackingData != widget.trackingData) {
      _updateMapElements();
      _animateToRider();
    }
  }

  @override
  void dispose() {
    _animationTimer?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  void _updateMapElements() {
    _updateMarkers();
    _updatePolyline();
  }

  void _updateMarkers() {
    final markers = <Marker>{};

    // Pickup location marker
    markers.add(
      Marker(
        markerId: const MarkerId('pickup'),
        position: LatLng(
          widget.trackingData.pickupLocation.latitude,
          widget.trackingData.pickupLocation.longitude,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlack),
        infoWindow: InfoWindow(
          title: 'Pickup Location',
          snippet: widget.trackingData.pickupLocation.address ?? '',
        ),
      ),
    );

    // Delivery location marker
    markers.add(
      Marker(
        markerId: const MarkerId('delivery'),
        position: LatLng(
          widget.trackingData.deliveryLocation.latitude,
          widget.trackingData.deliveryLocation.longitude,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        infoWindow: InfoWindow(
          title: 'Delivery Location',
          snippet: widget.trackingData.deliveryLocation.address ?? 'Your Location',
        ),
      ),
    );

    // Rider location marker
    markers.add(
      Marker(
        markerId: const MarkerId('rider'),
        position: LatLng(
          widget.trackingData.rider.currentLocation.latitude,
          widget.trackingData.rider.currentLocation.longitude,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        infoWindow: InfoWindow(
          title: widget.trackingData.rider.name,
          snippet: 'Your rider',
        ),
        rotation: 0, // TODO: Calculate bearing based on movement direction
      ),
    );

    setState(() {
      _markers = markers;
    });
  }

  void _updatePolyline() {
    // Create a simple polyline from pickup -> rider -> delivery
    // In production, you would use Google Directions API for actual route
    final polylineCoordinates = <LatLng>[
      LatLng(
        widget.trackingData.pickupLocation.latitude,
        widget.trackingData.pickupLocation.longitude,
      ),
      LatLng(
        widget.trackingData.rider.currentLocation.latitude,
        widget.trackingData.rider.currentLocation.longitude,
      ),
      LatLng(
        widget.trackingData.deliveryLocation.latitude,
        widget.trackingData.deliveryLocation.longitude,
      ),
    ];

    final polyline = Polyline(
      polylineId: const PolylineId('route'),
      points: polylineCoordinates,
      color: const Color(0xFF2D8659),
      width: 4,
      patterns: widget.trackingData.status == OrderStatus.delivered
          ? [PatternItem.dash(10), PatternItem.gap(5)]
          : [],
    );

    setState(() {
      _polylines = {polyline};
    });
  }

  void _animateToRider() {
    if (_mapController == null) return;

    final riderLocation = LatLng(
      widget.trackingData.rider.currentLocation.latitude,
      widget.trackingData.rider.currentLocation.longitude,
    );

    _mapController!.animateCamera(
      CameraUpdate.newLatLngZoom(riderLocation, 14),
    );
  }

  void _fitAllMarkers() {
    if (_mapController == null || _markers.isEmpty) return;

    final bounds = _calculateBounds(_markers.map((m) => m.position).toList());
    
    _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 100),
    );
  }

  LatLngBounds _calculateBounds(List<LatLng> positions) {
    double minLat = positions.first.latitude;
    double maxLat = positions.first.latitude;
    double minLng = positions.first.longitude;
    double maxLng = positions.first.longitude;

    for (final pos in positions) {
      if (pos.latitude < minLat) minLat = pos.latitude;
      if (pos.latitude > maxLat) maxLat = pos.latitude;
      if (pos.longitude < minLng) minLng = pos.longitude;
      if (pos.longitude > maxLng) maxLng = pos.longitude;
    }

    return LatLngBounds(
      southwest: LatLng(minLat, minLng),
      northeast: LatLng(maxLat, maxLng),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GoogleMap(
          initialCameraPosition: CameraPosition(
            target: LatLng(
              widget.trackingData.rider.currentLocation.latitude,
              widget.trackingData.rider.currentLocation.longitude,
            ),
            zoom: 14,
          ),
          markers: _markers,
          polylines: _polylines,
          onMapCreated: (controller) {
            _mapController = controller;
            // Fit all markers after a short delay
            Future.delayed(const Duration(milliseconds: 500), () {
              _fitAllMarkers();
            });
          },
          myLocationEnabled: false,
          myLocationButtonEnabled: false,
          zoomControlsEnabled: false,
          mapToolbarEnabled: false,
          compassEnabled: true,
          trafficEnabled: false,
        ),
        // Custom controls
        Positioned(
          right: 16,
          bottom: 100,
          child: Column(
            children: [
              // Center on rider button
              FloatingActionButton.small(
                onPressed: _animateToRider,
                backgroundColor: Colors.white,
                child: const Icon(
                  Icons.my_location,
                  color: Color(0xFF2D8659),
                ),
              ),
              const SizedBox(height: 8),
              // Fit all markers button
              FloatingActionButton.small(
                onPressed: _fitAllMarkers,
                backgroundColor: Colors.white,
                child: const Icon(
                  Icons.zoom_out_map,
                  color: Color(0xFF2D8659),
                ),
              ),
            ],
          ),
        ),
        // ETA indicator (if arriving soon)
        if (widget.trackingData.status == OrderStatus.arrivingSoon)
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: _buildEtaIndicator(),
          ),
      ],
    );
  }

  Widget _buildEtaIndicator() {
    final minutesUntilArrival = widget.trackingData.estimatedAt
        .difference(DateTime.now())
        .inMinutes;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF2D8659),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.access_time,
            color: Colors.white,
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            'Arriving in $minutesUntilArrival min',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

