# Quality Verification Photos - Technical Specification

**Date:** November 22, 2025  
**Component:** Rider App - Quality Verification Photos Feature  
**Priority:** ⭐ **HIGHEST** - This is Okada's key differentiator

---

## 1. Overview

The Quality Verification Photos feature is the cornerstone of Okada's value proposition. It allows riders to capture high-quality photos of products before delivery, which customers can review and approve or reject. This builds trust, reduces returns, and sets Okada apart from all competitors in the Cameroonian e-commerce market.

This document provides detailed technical specifications for implementing the photo capture functionality in the Rider App.

---

## 2. User Flow

The rider follows this workflow when capturing Quality Verification Photos:

1. **Arrive at seller location** and collect products.
2. **Tap "Capture Photos" button** in the Active Delivery screen.
3. **View photo guidelines** (ensure all items visible, good lighting, multiple angles).
4. **Capture 3 photos** of the products using the device camera.
5. **Review captured photos** with options to retake individual photos.
6. **Submit photos** to the server for customer review.
7. **Wait for customer approval** before proceeding to delivery.

---

## 3. Technical Requirements

### Camera Integration

-   **Package:** `camera` (Flutter)
-   **Resolution:** Minimum 1080p (1920x1080)
-   **Format:** JPEG with 85% quality
-   **Orientation:** Auto-detect and correct based on device orientation

### Photo Guidelines

Display clear instructions to the rider before capturing photos:

-   **Ensure all items are visible:** All products in the order must be in the frame.
-   **Good lighting required:** Photos should be well-lit to show product details.
-   **Multiple angles recommended:** Capture products from different perspectives.

### Photo Capture UI

-   **Camera preview:** Full-screen camera preview with grid overlay (rule of thirds).
-   **Capture button:** Large green circular button at the bottom center.
-   **Photo counter:** Display "1 of 3 photos", "2 of 3 photos", "3 of 3 photos".
-   **Gallery button:** Bottom left corner to view previously captured photos.
-   **Grid toggle:** Bottom right corner to enable/disable grid overlay.

### Photo Review Screen

After capturing all 3 photos, display a review screen:

-   **Thumbnail grid:** Show all 3 photos in a grid layout.
-   **Retake option:** Tap a photo to retake it.
-   **Submit button:** Large green button to upload photos and proceed.
-   **Cancel button:** Option to cancel and return to Active Delivery screen.

---

## 4. API Integration

### Upload Endpoint

**POST** `/orders/{orderId}/quality-photos`

**Request Body:**
```json
{
  "photos": [
    {
      "index": 1,
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "index": 2,
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    {
      "index": 3,
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Photos uploaded successfully",
  "photoUrls": [
    "https://cdn.okada.cm/photos/order-123-photo-1.jpg",
    "https://cdn.okada.cm/photos/order-123-photo-2.jpg",
    "https://cdn.okada.cm/photos/order-123-photo-3.jpg"
  ]
}
```

---

## 5. Error Handling

-   **Camera permission denied:** Show a dialog explaining why camera access is needed and provide a button to open app settings.
-   **Upload failure:** Retry automatically up to 3 times. If still failing, show an error message and allow manual retry.
-   **Poor lighting detection:** Optionally, analyze photo brightness and warn the rider if lighting is insufficient.

---

## 6. Performance Considerations

-   **Image compression:** Compress images to reduce upload size while maintaining quality.
-   **Background upload:** Upload photos in the background to avoid blocking the UI.
-   **Progress indicator:** Show upload progress for each photo.

---

## 7. Testing Checklist

- [ ] Camera opens correctly on both iOS and Android
- [ ] Photos are captured at the correct resolution
- [ ] Grid overlay displays correctly
- [ ] Photo counter updates correctly (1 of 3, 2 of 3, 3 of 3)
- [ ] Review screen shows all 3 photos
- [ ] Retake functionality works for individual photos
- [ ] Photos upload successfully to the server
- [ ] Error handling works for camera permission denied
- [ ] Error handling works for upload failure
- [ ] Loading states display correctly during upload

---

**This specification ensures the Quality Verification Photos feature is implemented correctly and delivers on Okada's key differentiator!** 📸✨

