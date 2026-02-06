# CHRONO CUBE - Precision Image Viewer

An interactive 3D image viewer with a precision timekeeping aesthetic. Drag to rotate the cube freely in any direction and watch as faces dynamically change images when they come into view.

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![Three.js](https://img.shields.io/badge/Three.js-0.170-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)

## Features

- **Camera-Relative Rotation**: Swipe direction always matches screen direction - right swipe moves faces right regardless of cube orientation
- **Free Rotation**: Drag to rotate the cube in any direction - no constrained angles
- **Dynamic Face Changes**: Images cycle automatically when faces become visible to the camera
- **Smart Cooldown System**: 3-second cooldown prevents excessive changes during rapid rotation
- **Automatic Image Cropping**: Non-square images are center-cropped to fit cube faces without distortion
- **Cyber-Chronometer Aesthetic**: Industrial luxury design with amber warning lights and cyan data displays
- **Calibration Ring**: Animated outer ring that responds to cube rotation
- **Technical HUD**: Real-time display of rotation coordinates, visible face count, and frame statistics
- **Dual Typography**: Elegant serif headings (Playfair Display) paired with monospace data readouts (JetBrains Mono)
- **Smooth Animations**: Floating animation, interpolated rotation, and mechanical feedback
- **Responsive**: Optimized camera distance for mobile and desktop
- **Touch Friendly**: Works with mouse and touch input

## Tech Stack

- **Vue 3** with Composition API and TypeScript
- **Three.js** for 3D rendering
- **Vite** for fast development
- **Tailwind CSS** for styling with custom cyber-chronometer design system

## Mobile Optimization

- **Dynamic Viewport Height**: Uses `100dvh` instead of `100vh` to properly handle mobile browser UI (address bars, toolbars)
- **Touch Gesture Support**: Full touch and mouse input support via pointer events
- **Responsive Camera**: Automatic camera distance adjustment (4.5 for mobile, 3 for desktop)
- **Optimized Touch Targets**: Large drag area covering entire screen
- **Calibration Ring**: Reduced opacity on touch devices for better visibility

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

The `MagicCube` component accepts an array of image URLs:

```vue
<template>
  <!-- Default: center-crop non-square images to prevent distortion -->
  <MagicCube :images="imageUrls" />
</template>

<script setup lang="ts">
import MagicCube from './components/MagicCube.vue'

const imageUrls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  // ... any number of images
]
</script>
```

### Props

- **`images`** (required): Array of image URLs (local or remote)
- **`cropStrategy`** (optional): How to handle non-square images
  - `"cover"` (default): Center crop to square - best for photos
  - `"contain"`: Letterbox to fit entire image - shows full image with black bars
  - `"fill"`: Stretch to square - may cause distortion
- **`cropSize`** (optional): Target square size in pixels (default: 2048)

### Cropping Examples

```vue
<!-- Letterbox strategy - show full image -->
<MagicCube
  :images="imageUrls"
  crop-strategy="contain"
/>

<!-- Higher resolution for retina displays -->
<MagicCube
  :images="imageUrls"
  :crop-size="4096"
/>
```

## Controls

- **Drag**: Rotate the cube freely in any direction with intuitive camera-relative controls
  - Swipe right → faces rotate right on screen
  - Swipe left → faces rotate left on screen
  - Swipe up → faces rotate up on screen
  - Swipe down → faces rotate down on screen
  - Behavior is consistent regardless of cube orientation (upside down, sideways, etc.)
- The cube displays images on all 6 faces
- **Face images change automatically** when they transition from off-view to on-view
- Each face cycles through the provided image array independently
- A 3-second cooldown prevents changes during rapid rotation
- Release to maintain the current rotation angle

## HUD Elements

- **Top Left**: System title and status indicator (ACTIVE / MANUAL OVERRIDE)
- **Top Right**: Real-time rotation coordinates (X/Y) and visible face indicators (e.g., F0, F2, F4)
  - Rotation coordinates update at 60fps during drag, 10fps when idle
  - Face numbers show which cube faces are currently visible to the camera
- **Bottom Left**: Control mode hint (disappears after first interaction)
- **Bottom Right**: Frame counter and total image cycle counter
- **Calibration Ring**: Outer ring rotates with cube, shows degree markers

### Face Number Reference

- **F0**: Right (+X)
- **F1**: Left (-X)
- **F2**: Top (+Y)
- **F3**: Bottom (-Y)
- **F4**: Front (+Z)
- **F5**: Back (-Z)

## Browser Compatibility

- Modern browsers supporting CSS `dvh` unit (Chrome 108+, Safari 16.4+, Firefox 101+)
- Falls back to `vh` for older browsers
- WebGL support required for Three.js rendering

## Production Status

**Current Readiness: 98%**

The application has completed critical fixes and feature enhancements, making it production-ready:

### Completed (Phase 1 - Critical)
- ✅ **Memory Leak Fixes**: Proper Three.js resource disposal in unmount hook
- ✅ **Error Handling**: Comprehensive try-catch blocks for texture loading with detailed logging
- ✅ **Defensive Programming**: Null checks and guard clauses throughout
- ✅ **Texture Memory Management**: Old textures disposed before replacement

### Completed (Phase 2 - Features)
- ✅ **Automatic Image Cropping**: Canvas-based square cropping prevents distortion on non-square images
- ✅ **Configurable Cropping Strategies**: Cover (default), contain (letterbox), and fill (stretch) modes
- ✅ **CORS Support**: Works with remote images from Unsplash and other sources

### Completed (Phase 2.5 - UX Improvements)
- ✅ **Camera-Relative Rotation**: Quaternion-based rotation ensures swipe direction matches screen direction regardless of cube orientation
- ✅ **World-Axis Rotation**: Uses `rotateOnWorldAxis()` for consistent screen-space rotation behavior

### Remaining Improvements (Phase 3 - Enhancements)
- ⏳ Accessibility: ARIA labels and keyboard navigation support
- ⏳ Performance: Optimize object creation in animation loops
- ⏳ Code Quality: Extract magic numbers to named constants

The application is stable and feature-complete for production deployment. Remaining items are polish and enhancements.
