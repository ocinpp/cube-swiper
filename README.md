# Cocktail Explorer - 3D Image Viewer

An interactive 3D image viewer with a soft cocktail lounge aesthetic. Drag to rotate the cube freely in any direction and watch as faces dynamically change images when they come into view. Images display at 100% browser-native brightness for optimal viewing.

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![Three.js](https://img.shields.io/badge/Three.js-0.170-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)

## Features

- **Camera-Relative Rotation**: Swipe direction always matches screen direction - right swipe moves faces right regardless of cube orientation
- **Free Rotation**: Drag to rotate the cube in any direction - no constrained angles
- **Dynamic Face Changes**: Images cycle automatically when faces become visible to the camera
- **No Duplicate Images**: Visible faces always show different images - smart selection prevents duplicates
- **Smart Cooldown System**: 3-second cooldown prevents excessive changes during rapid rotation
- **Automatic Image Cropping**: Non-square images are center-cropped to fit cube faces without distortion
- **Showcase Mode**: Optional automated face presentation with custom sequences
- **Soft Cocktail Aesthetic**: Warm, inviting gallery-like atmosphere with pastel colors
- **Calibration Ring**: Animated outer ring that responds to cube rotation
- **Technical HUD**: Real-time display of rotation coordinates, visible face count, and frame statistics
- **Dual Typography**: Elegant serif headings (Playfair Display) paired with clean sans-serif data readouts (DM Sans)
- **Smooth Animations**: Floating animation, interpolated rotation, and pulsing effects
- **Particle System**: Delicate floating particles in rose, mint, and watermelon colors
- **100% Native Brightness**: Images display at identical brightness to regular `<img>` tags
- **Responsive**: Optimized camera distance for mobile and desktop
- **Touch Friendly**: Works with mouse and touch input

## Tech Stack

- **Vue 3** with Composition API and TypeScript
- **Three.js** for 3D rendering
- **Vite** for fast development
- **Tailwind CSS** for styling with custom soft cocktail design system
- **Vitest** for unit testing

## Mobile Optimization

- **Dynamic Viewport Height**: Uses `100dvh` instead of `100vh` to properly handle mobile browser UI (address bars, toolbars)
- **Touch Gesture Support**: Full touch and mouse input support via pointer events
- **Responsive Camera**: Automatic camera distance adjustment (4.5 for mobile, 3 for desktop)
- **Optimized Touch Targets**: Large drag area covering entire screen
- **Calibration Ring**: Reduced opacity on touch devices for better visibility
- **UI Adjustments**: Frame Info panel hidden on mobile, showcase button positioned at bottom edge
- **Reduced Particles**: 75 particles on mobile vs 150 on desktop

## Performance

- **Pre-Loaded Textures**: All images loaded during initialization for instant swapping
- **Efficient Showcase Mode**: Cycle transitions use cached textures (no blocking operations)
- **Memory Management**: Three.js resources properly disposed on unmount
- **Canvas Cropping**: Client-side image processing with configurable strategies
- **Automatic Image Optimization**: WebP/JPG/PNG compression during production builds

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
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
- **`showcaseMode`** (optional): Automated face presentation configuration
  - `enabled`: Boolean to enable showcase mode (default: `false`)
  - `sequence`: Array of face numbers to display (e.g., `[0, 2, 4]`)
  - `faceDuration`: Time per face in milliseconds (default: `3000`)
  - `autoStart`: Start showcase on mount (default: `false`)
  - `loop`: Repeat sequence indefinitely (default: `true`)
  - `rotationSpeed`: Slerp factor for smooth rotation (default: `0.02`, lower = smoother)

### Material & Rendering

- **MeshBasicMaterial**: Uses unlit material for 100% browser-native brightness
  - Images display at identical brightness to regular `<img>` tags
  - No shading or lighting calculations affect image brightness
  - Flat, clean aesthetic perfect for image viewing
- **NoToneMapping**: Disabled for accurate color reproduction
- **SRGBColorSpace**: Ensures proper color display across devices
- **Anisotropic Filtering**: Sharp textures at oblique angles

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

### Showcase Mode Examples

Showcase mode automatically rotates the cube to display faces in a custom sequence:

```vue
<template>
  <MagicCube
    ref="cubeRef"
    :images="imageUrls"
    :showcase-mode="{
      enabled: true,
      sequence: [0, 2, 4, 5],  // Show right, top, front, back faces
      faceDuration: 3000,        // 3 seconds per face
      autoStart: true,           // Start automatically on mount
      loop: true,                // Repeat sequence indefinitely
      rotationSpeed: 0.02        // Smooth rotation (lower = smoother)
    }"
    @showcase-started="onShowcaseStarted"
    @showcase-stopped="onShowcaseStopped"
    @showcase-paused="onShowcasePaused"
    @showcase-resumed="onShowcaseResumed"
    @showcase-completed="onShowcaseCompleted"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MagicCube from './components/MagicCube.vue'

const cubeRef = ref<InstanceType<typeof MagicCube>>()

// Programmatic control
function startShowcase() {
  cubeRef.value?.startShowcase()
}

function stopShowcase() {
  cubeRef.value?.stopShowcase()
}

function toggleShowcase() {
  cubeRef.value?.toggleShowcase()
}

function pauseShowcase() {
  cubeRef.value?.pauseShowcase()
}

function resumeShowcase() {
  cubeRef.value?.resumeShowcase()
}
</script>
```

**Sequence Duration Examples:**

```vue
<!-- Quick presentation - 1 second per face -->
<MagicCube
  :images="imageUrls"
  :showcase-mode="{
    enabled: true,
    sequence: [0, 2, 4],
    faceDuration: 1000,    // 1 second per face (3 seconds total)
    loop: true
  }"
/>

<!-- Leisurely viewing - 2 seconds per face -->
<MagicCube
  :images="imageUrls"
  :showcase-mode="{
    enabled: true,
    sequence: [0, 2, 4, 1, 3, 5],
    faceDuration: 2000,    // 2 seconds per face (12 seconds total)
    loop: true
  }"
/>

<!-- Extended showcase - 5 seconds per face -->
<MagicCube
  :images="imageUrls"
  :showcase-mode="{
    enabled: true,
    sequence: [0, 2, 4],
    faceDuration: 5000,    // 5 seconds per face (15 seconds total)
    loop: false            // Stop after showing sequence once
  }"
/>
```

**Showcase Mode Features:**
- **Any sequence length**: No hard limit - use 1 face, all 6 unique faces, or repeat faces in longer patterns
- **Configurable timing**: `faceDuration` in milliseconds controls how long each face displays
- Auto-start option: Begin showcase immediately on component mount
- Loop control: Repeat sequence indefinitely or stop after completion
- Smooth rotation: Adjustable interpolation speed for cinematic feel
- Programmatic API: Full control via exposed methods (`startShowcase()`, `stopShowcase()`, `toggleShowcase()`, `pauseShowcase()`, `resumeShowcase()`)
- Event-based state tracking: Listen for showcase state changes (`@showcase-started`, `@showcase-stopped`, `@showcase-paused`, `@showcase-resumed`, `@showcase-completed`)
- Pause functionality: Temporarily pause showcase to examine current face

## Controls

- **Drag**: Rotate the cube freely in any direction with intuitive camera-relative controls
  - Swipe right → faces rotate right on screen
  - Swipe left → faces rotate left on screen
  - Swipe up → faces rotate up on screen
  - Swipe down → faces rotate down on screen
  - Behavior is consistent regardless of cube orientation
- **Momentum/Inertia**: Fast flicks create natural spin that gradually decays
  - Quick flick → cube continues spinning with momentum
  - Slow drag or holding still → no momentum, stops on release
  - Momentum decays smoothly using exponential decay
- **Showcase Mode**: When active, cube automatically rotates through predefined face sequence

## HUD Elements

- **Top Left**: System title and status indicator
  - **ACTIVE** - Normal operation, cube is idle
  - **MANUAL OVERRIDE** - User is currently dragging the cube
  - **SHOWCASE** - Automated showcase mode is running
  - **SHOWCASE (PAUSED)** - Showcase mode is paused on current face
- **Top Right**: Real-time rotation coordinates (X/Y) and visible face indicators (e.g., F0, F2, F4)
- **Bottom Left**: Control mode hint (disappears after first interaction)
- **Bottom Right**: Frame counter and total image cycle counter (hidden on mobile)
- **Calibration Ring**: Outer ring rotates with cube, shows degree markers

### Face Number Reference

- **F0**: Right (+X) - Visible on right half at startup
- **F1**: Left (-X)
- **F2**: Top (+Y)
- **F3**: Bottom (-Y)
- **F4**: Front (+Z) - Visible on left half at startup
- **F5**: Back (-Z)

## Design System

**Colors:**
- **Background**: Warm cream (#f9f6f1)
- **Rose Pink**: Dusty rose for edges and accents (#d4a5a5, #e8c4c4)
- **Mint**: Soft mint for accent (#a8c4a8, #9eb09e)
- **Watermelon**: Soft watermelon for particles (#ffb6b6, #e87c7c)
- **Text**: Warm brown (#8b7355) and dark gray (#1a1a1a)

**Typography:**
- **Serif**: Playfair Display (elegant headings)
- **Sans-Serif**: DM Sans (clean technical data)

**Particles:**
- 150 particles (75 on mobile)
- Colors: Rose pink, Mint, Soft watermelon
- Slow, gentle floating motion
- Spherical boundary wrapping

## Browser Compatibility

- Modern browsers supporting CSS `dvh` unit (Chrome 108+, Safari 16.4+, Firefox 101+)
- Falls back to `vh` for older browsers
- WebGL support required for Three.js rendering

## Production Status

**Current Readiness: 100%**

The application is production-ready with all critical features complete and tested.

### Completed Features

**Phase 1 - Critical:**
- ✅ Memory leak prevention (Three.js resource disposal)
- ✅ Error handling with logging (all texture operations)
- ✅ Defensive null checks throughout
- ✅ Texture memory management (dispose before replace)

**Phase 2 - Features:**
- ✅ Automatic square image cropping with canvas-based processing
- ✅ Multiple cropping strategies (cover, contain, fill)
- ✅ CORS support for remote images
- ✅ Backward compatible API with sensible defaults

**Phase 2.5 - UX Improvements:**
- ✅ Camera-relative rotation using quaternions
- ✅ World-axis rotation for consistent screen-space behavior
- ✅ Swipe direction matches user expectations regardless of orientation
- ✅ Realistic momentum/inertia system with movement detection
- ✅ Code quality improvements: extracted magic numbers to named constants

**Phase 2.75 - Showcase Mode:**
- ✅ Custom face sequence showcase mode
- ✅ Configurable timing, looping, and auto-start
- ✅ Programmatic API (start/stop/toggle/pause/resume)
- ✅ Smooth quaternion-based rotation to align faces with camera
- ✅ Event system for reactive state tracking
- ✅ Delta time precision (no timing drift)
- ✅ Production-ready console logging

**Phase 2.8 - Native Brightness:**
- ✅ MeshBasicMaterial for 100% browser-native brightness
- ✅ NoToneMapping for accurate color reproduction
- ✅ Simplified rendering with better performance

**Phase 2.85 - Display & Distribution Fixes:**
- ✅ Simplified material mapping (1:1 face-to-image)
- ✅ Even image distribution across all faces
- ✅ Showcase mode pending update mechanism

**Phase 2.88 - Duplicate Prevention:**
- ✅ Fixed visibility detection (dot product < 0 for camera-facing)
- ✅ Unique image selection prevents duplicates on visible faces
- ✅ Skip last face in showcase sequence to prevent visual glitches
- ✅ Initialize visibility tracking to prevent first-frame cycling

**Phase 2.86 - Code Review & Testing:**
- ✅ Input validation for face indices
- ✅ Race condition prevention
- ✅ Code deduplication (translateIndex)
- ✅ Unit test infrastructure with Vitest (16 tests)

**Phase 2.87 - Performance & Mobile:**
- ✅ Pre-loaded textures for instant showcase transitions
- ✅ Memory safety fixes for texture disposal
- ✅ Mobile UI adjustments (hidden frame info, repositioned button)

**Phase 3 - Aesthetic Enhancements:**
- ✅ Soft cocktail color palette (rose, mint, watermelon)
- ✅ Particle system with floating pastel orbs
- ✅ Calibration ring with degree markers
- ✅ Dynamic edge glow with pulse animation
- ✅ Clean, gallery-like presentation
- ✅ Mobile-optimized particle count

## Project Structure

```
src/
├── App.vue                    # Root component with sample images
├── main.ts                    # Vue app entry point
├── styles/
│   └── main.css              # Soft cocktail aesthetic system
├── components/
│   └── MagicCube.vue         # Main 3D cube component
├── composables/
│   └── useCubeNavigation.ts  # Gesture handling
├── utils/
│   ├── textureCropping.ts    # Image cropping utilities
│   └── materialReordering.spec.ts  # Unit tests
└── assets/
    └── images/               # Image directory (auto-loaded)
```

## Adding Images

1. Drop image files into `src/assets/images/`
2. They're automatically detected and loaded (no code changes needed)
3. Supported formats: JPG, JPEG, PNG, WebP, GIF, SVG
4. Images automatically optimized during production build

## License

MIT
