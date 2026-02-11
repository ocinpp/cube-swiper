# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **3D image viewer** called "Cocktail Explorer" built with Vue 3, Three.js, and TypeScript. Users can freely drag to rotate a 3D cube that displays images on its faces. As faces become visible to the camera, they automatically cycle to new images with a smart cooldown system. **Non-square images are automatically center-cropped to prevent distortion**. The UI features a soft cocktail lounge aesthetic with warm pastel colors, elegant serif typography, and a clean gallery-like presentation.

### Production Readiness

**Current Status: 100% Production Ready**

All critical issues and major features have been implemented. The application is stable, feature-complete, and suitable for production deployment.

**Completed (Phase 1 - Critical):**
- ✅ Memory leak prevention (Three.js resource disposal)
- ✅ Error handling with logging (all texture operations)
- ✅ Defensive null checks throughout
- ✅ Texture memory management (dispose before replace)

**Completed (Phase 2 - Features):**
- ✅ Automatic square image cropping with canvas-based processing
- ✅ Multiple cropping strategies (cover, contain, fill)
- ✅ CORS support for remote images
- ✅ Backward compatible API with sensible defaults

**Completed (Phase 2.5 - UX Improvements):**
- ✅ Camera-relative rotation using quaternions
- ✅ World-axis rotation for consistent screen-space behavior
- ✅ Swipe direction matches user expectations regardless of orientation
- ✅ Realistic momentum/inertia system with movement detection
- ✅ Code quality improvements: extracted magic numbers to named constants

**Completed (Phase 2.75 - Showcase Mode):**
- ✅ Custom face sequence showcase mode
- ✅ Configurable timing, looping, and auto-start
- ✅ Programmatic API (start/stop/toggle/pause/resume)
- ✅ Smooth quaternion-based rotation to align faces with camera
- ✅ Event system for reactive state tracking
- ✅ Pause/resume functionality
- ✅ Delta time precision (no timing drift)
- ✅ Production-ready console logging

**Completed (Phase 2.8 - Native Brightness):**
- ✅ MeshBasicMaterial for 100% browser-native brightness
- ✅ NoToneMapping for accurate color reproduction
- ✅ Simplified rendering with better performance

**Completed (Phase 2.85 - Display & Distribution Fixes):**
- ✅ Material reordering fix for correct image display
- ✅ Even image distribution across all faces
- ✅ Showcase mode pending update mechanism

**Completed (Phase 2.86 - Code Review & Testing):**
- ✅ Input validation for face indices
- ✅ Race condition prevention
- ✅ Code deduplication (translateIndex)
- ✅ Unit test infrastructure with Vitest (16 tests)

**Completed (Phase 2.87 - Performance & Mobile):**
- ✅ Pre-loaded textures for instant showcase transitions
- ✅ Memory safety fixes for texture disposal
- ✅ Mobile UI adjustments (hidden frame info, repositioned button)

**Completed (Phase 3 - Aesthetic Enhancements):**
- ✅ Soft cocktail color palette (rose, mint, watermelon)
- ✅ Particle system with floating pastel orbs
- ✅ Calibration ring with degree markers
- ✅ Dynamic edge glow with pulse animation
- ✅ Clean, gallery-like presentation
- ✅ Mobile-optimized particle count

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`) and TypeScript
- **Three.js** for 3D rendering and cube manipulation
- **Vite** for build tooling with hot module replacement
- **Tailwind CSS** for utility-first styling
- **Vitest** for unit testing with jsdom environment
- **ESLint** with Prettier for code quality and formatting
- **vite-plugin-image-optimizer** for automatic image compression

## Common Commands

```bash
# Development server (runs on port 5173, accessible from network)
npm run dev

# Build for production (runs vue-tsc type check then vite build)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format code with Prettier
npm run format

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI interface
npm run test:ui
```

## File Structure

```
src/
├── App.vue                    # Root component, provides sample images and showcase controls
├── main.ts                    # Vue app entry point
├── vite-env.d.ts             # Vite environment type declarations
├── styles/
│   └── main.css              # Global styles with soft cocktail aesthetic system
├── components/
│   └── MagicCube.vue         # Main 3D cube component with Three.js logic (~1200 lines)
├── composables/
│   └── useCubeNavigation.ts  # Gesture handling composable for drag tracking
├── utils/
│   ├── textureCropping.ts    # Canvas-based image cropping utilities
│   └── materialReordering.spec.ts  # Unit tests for material reordering logic
└── assets/
    └── images/               # Image directory (auto-loaded by Vite glob)
        ├── 0001.jpeg - 0012.png  # Sequential image naming
        └── (add images here, auto-detected)
```

## TypeScript Patterns

### Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "moduleResolution": "bundler",
    "moduleDetection": "force"
  }
}
```

### Key Type Definitions

**MagicCube.vue Props:**
```typescript
interface Props {
  images: string[]                    // Required: Array of image URLs
  cropStrategy?: CropStrategy         // 'cover' | 'contain' | 'fill' (default: 'cover')
  cropSize?: number                   // Target square size (default: 2048)
  showcaseMode?: ShowcaseMode         // Optional showcase configuration
}

interface ShowcaseMode {
  enabled: boolean                    // Enable showcase mode
  sequence: number[]                  // Face sequence to display [0,2,4,...]
  faceDuration?: number              // Duration per face (ms, default: 3000)
  autoStart?: boolean                 // Start on mount (default: false)
  loop?: boolean                      // Loop sequence (default: true)
  rotationSpeed?: number              // Slerp factor (default: 0.02)
}
```

**Texture Cropping Types:**
```typescript
export type CropStrategy = 'cover' | 'contain' | 'fill'

export interface CropOptions {
  strategy?: CropStrategy
  targetSize?: number
  anisotropy?: number                 // Default: 16 (safe for modern GPUs)
}
```

**Composable Types:**
```typescript
export type NavigationState = 'idle' | 'dragging'
```

### Component Patterns

**Vue 3 Composition API with `<script setup>`:**
```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props with TypeScript interface
interface Props {
  images: string[]
  cropStrategy?: 'cover' | 'contain' | 'fill'
}
const props = withDefaults(defineProps<Props>(), {
  cropStrategy: 'cover'
})

// Events with TypeScript types
const emit = defineEmits<{
  showcaseStarted: []
  showcaseStopped: []
}>()

// Refs for DOM elements
const container = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()

// Reactive state
const isDragging = ref(false)

// Computed properties
const rotation = computed(() => ...)

// Lifecycle hooks
onMounted(() => {
  // Initialize Three.js scene
})

onUnmounted(() => {
  // Cleanup Three.js resources
  cube.material.forEach(m => m.dispose())
  cube.geometry.dispose()
})

// Expose public API
defineExpose({
  startShowcase,
  stopShowcase,
  toggleShowcase
})
</script>
```

## Code Conventions

### ESLint Configuration

**Key Rules:**
- TypeScript strict mode enforced
- Unused variables/parameters must be prefixed with `_`
- `any` types allowed only with warning
- Multi-word component names not required
- Vue parser for `.vue` files

### Prettier Configuration

**Style:**
- No semicolons
- Single quotes for strings
- 2-space indentation
- Trailing commas in ES5-compatible locations
- 100 character line width
- Always include parens for arrow functions with single parameter

### Import Patterns

```typescript
// Vue imports - Composition API
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

// Three.js - namespace import
import * as THREE from 'three'

// Types - use `type` keyword for type-only imports
import type { CropStrategy } from './textureCropping'

// Relative imports for project files
import MagicCube from './components/MagicCube.vue'
```

### Naming Conventions

- **Components:** PascalCase (e.g., `MagicCube.vue`, `App.vue`)
- **Composables:** camelCase with `use` prefix (e.g., `useCubeNavigation`)
- **Utilities:** camelCase (e.g., `textureCropping.ts`, `loadCroppedTexture`)
- **Types/Interfaces:** PascalCase (e.g., `Props`, `ShowcaseMode`, `CropOptions`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `COOLDOWN_MS`, `SLERP_FACTOR`)
- **Variables/Functions:** camelCase (e.g., `isDragging`, `startShowcase`)
- **Test files:** `.spec.ts` suffix (e.g., `materialReordering.spec.ts`)

## Testing

### Vitest Configuration

```typescript
export default defineConfig({
  test: {
    globals: true,                      // Use global test functions
    environment: 'jsdom',               // DOM environment for Vue
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/main.ts', 'src/vite-env.d.ts']
    }
  }
})
```

### Test Patterns

**Unit Test Structure:**
```typescript
import { describe, it, expect } from 'vitest'

describe('Feature Name', () => {
  describe('Specific Behavior', () => {
    it('should do something expected', () => {
      // Arrange
      const input = ...

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

**Current Test Coverage:**
- `src/utils/materialReordering.spec.ts` - 16 tests covering:
  - `translateIndex` function swaps
  - Face-to-image mapping
  - Even distribution across faces
  - Edge cases and integration tests

## Image Management

### Image Directory Structure

All images are stored in **`src/assets/images/`** and automatically loaded using Vite's `import.meta.glob`.

**Supported formats:** JPG, JPEG, PNG, WebP, GIF, SVG

**How to add images:**
1. Drop image files into `src/assets/images/`
2. They're automatically detected and loaded (no code changes needed)
3. Minimum 6 images recommended (one for each cube face)
4. No maximum - cube cycles through all images as faces rotate

**Current implementation** (`src/App.vue:58-66`):
```typescript
const imageModules = import.meta.glob<{ default: string }>(
  './assets/images/*.{jpg,jpeg,png,webp,gif,svg}',
  { eager: true }
)
const sampleImages = Object.values(imageModules)
  .map((mod) => mod.default)
  .sort()
```

### Automatic Image Compression

The project uses **`vite-plugin-image-optimizer`** to automatically compress images during production builds.

**Compression settings** (`vite.config.ts:8-34`):
- **JPG/JPEG:** Quality 85 (typically 40-60% size reduction)
- **PNG:** Maximum compression (level 9) with quality 85
- **WebP:** Quality 85 (best compression ratio for modern browsers)
- **SVG:** Multi-pass optimization with cleanup plugins

**Behavior:**
- **Development mode:** Images served as-is (fast iteration)
- **Production build:** Images automatically optimized in dist/
- Original files never modified - optimization happens at build time

**Recommendation:** Use WebP format for best size/quality balance.

### Image Cropping for Non-Square Images

The project includes **automatic square cropping** to prevent distortion when non-square images are displayed on the cube's square faces.

**Implementation** (`src/utils/textureCropping.ts`):
- Canvas-based client-side cropping using HTML5 Canvas API
- Three cropping strategies available
- CORS-enabled for remote image loading (Unsplash, etc.)
- Memory-efficient: old canvas textures properly disposed

**Cropping Strategies:**
- **`cover`** (default): Center crop to square - best for photos, crops edges evenly
- **`contain`**: Letterbox to fit entire image - shows full image with black bars
- **`fill`**: Stretch to square - legacy behavior, may cause distortion

## Architecture

### Component Structure

```
App.vue                    # Root component, provides sample images array
└── MagicCube.vue          # Main 3D cube component with Three.js logic
    ├── uses: useCubeNavigation()  # Composable for drag tracking
    └── uses: loadCroppedTexture()  # Utility for square cropping
```

### Key Files and Their Purposes

**src/utils/textureCropping.ts** - Texture cropping utility:
- `loadCroppedTexture(url, options)` - Main entry point for loading and cropping
- `loadImage(url)` - Load HTMLImageElement from URL with CORS
- `cropImageToSquare(image, strategy, targetSize)` - Canvas cropping logic
- Three strategy functions: `applyCoverStrategy()`, `applyContainStrategy()`, `applyFillStrategy()`
- Returns `THREE.CanvasTexture` ready for use with materials

**src/components/MagicCube.vue** - The core component containing:
- Props:
  - `images: string[]` - Array of image URLs (required)
  - `cropStrategy: 'cover' | 'contain' | 'fill'` - Cropping strategy (default: 'cover')
  - `cropSize: number` - Target square size in pixels (default: 2048)
  - `showcaseMode?: ShowcaseMode` - Optional showcase configuration
- Three.js scene setup (scene, camera, renderer)
- Cube mesh creation with 6 faces, each mapped to an image texture
- **Texture loading with cropping**: All images cropped to square before being applied as textures
- **Dynamic face image changes**: Detects when faces become visible and cycles through images
- **Face visibility system**: Uses dot product of face normals with camera direction
- **Cooldown mechanism**: 3-second cooldown per face prevents excessive changes
- **Hybrid HUD update system**:
  - During drag: Real-time 60fps updates for rotation coordinates and face numbers
  - When idle: Throttled to 10fps (every 100ms) for readability
- **HUD Interface**: Technical readouts showing rotation coordinates, visible face numbers, frame count, and cycle statistics
- **Calibration Ring**: SVG-based outer ring with degree markers that rotates with the cube
- **Soft cocktail color scheme** (rose pink, mint, watermelon) for UI elements
- **Particle system**: 150 particles (75 on mobile) in rose, mint, and watermelon colors
- **Smooth rotation interpolation** using lerp (0.08 factor) in the animation loop
- **Real-time drag feedback**: applies drag offset during interaction
- **On drag release**: captures current cube rotation as new target (prevents snap-back)

**src/composables/useCubeNavigation.ts** - Gesture handling composable:
- Global pointer event listeners (not bound to specific element)
- Tracks `dragDeltaX`, `dragDeltaY`, and `isDragging` state
- Used for drag tracking - could be extended to add swipe gestures later

### Three.js Configuration Details

- Camera distance adjusts for mobile (4.5) vs desktop (3)
- Uses `MeshBasicMaterial` for 100% browser-native brightness (unlit material)
  - No shading, reflections, or lighting calculations
  - Images display at identical brightness to `<img>` tags
  - Flat, clean appearance optimized for image viewing
- **No lighting needed**: MeshBasicMaterial is not affected by lights
- **Particle system**: 150 particles (75 on mobile) with random velocities in sphere radius 2-4
- **No fog**: Maximum brightness and clarity (density 0.0)
- **Dynamic edges**: Dusty rose edges (#d4a5a5) with normal blending, pulsing between 0.3-0.5 opacity
- Initial rotation shows Front (F4) and Right (F0) faces half-half (0°, -45°)
- Drag sensitivity: 0.3 multiplier on drag delta for rotation
- **Quaternion-based rotation**: Uses quaternions and `rotateOnWorldAxis()` for camera-relative rotation
- **World axes**: Horizontal swipes rotate around world Y axis, vertical swipes around world X axis
- **Slerp interpolation**: Smooth quaternion interpolation with 0.08 factor

### Component Usage Examples

**Basic usage (default cover cropping):**
```vue
<template>
  <MagicCube :images="imageUrls" />
</template>

<script setup lang="ts">
import MagicCube from './components/MagicCube.vue'

const imageUrls = [
  '/images/photo1.jpg',
  '/images/photo2.jpg',
  // ... more images
]
</script>
```

**Letterbox strategy (show full image):**
```vue
<template>
  <MagicCube
    :images="imageUrls"
    crop-strategy="contain"
  />
</template>
```

**High resolution for retina displays:**
```vue
<template>
  <MagicCube
    :images="imageUrls"
    :crop-size="4096"
  />
</template>
```

**All options combined:**
```vue
<template>
  <MagicCube
    :images="imageUrls"
    crop-strategy="cover"
    :crop-size="2048"
  />
</template>
```

### Visual Design System

**Colors (CSS Variables)**:
- `--color-cream`: #f9f6f1 (background - warm cream)
- `--color-beige`: #f0ebe3 (secondary background)
- `--color-sand`: #e8e1d5 (accent background)
- `--color-rose-pink`: #ebd4d4 (light rose)
- `--color-rose-dusty`: #d9c0c0 (dusty rose for edges and accents)
- `--color-watermelon`: #e87c7c (soft watermelon for accents)
- `--color-mint`: #b5c9b5 (soft mint for accent)
- `--color-mint-muted`: #9eb09e (muted mint)
- `--color-text-dark`: #1a1a1a (primary text)
- `--color-text-muted`: #4a4a4a (secondary text)
- `--color-text-light`: #7a7a7a (tertiary text)

**Typography**:
- `--font-serif`: Playfair Display (titles, 32px, 600 weight, italic)
- `--font-mono`: DM Sans (data readouts, 13px, 400 weight)

**UI Components**:
- `.hud-panel`: Semi-transparent panels with warm cream backgrounds and colored border accents
- `.calibration-ring`: SVG-based circular indicator with degree markers and rotating element
- `.loading-spinner`: Dual-ring mechanical spinner with counter-rotating rose/mint rings

**Animations**:
- `--transition-mechanical`: 500ms cubic-bezier(0.2, 0.8, 0.2, 1) for calibration ring
- `--transition-smooth`: 300ms cubic-bezier(0.4, 0, 0.2, 1) for UI elements

### Mobile Optimization & Viewport Handling

**Dynamic Viewport Height (dvh)**:
- Uses `100dvh` instead of `100vh` throughout the application
- Implemented in `App.vue` (`h-dvh` class) and `main.css` (`height: 100dvh`)
- **Problem solved**: Mobile browsers (Safari, Chrome) have collapsible address bars that affect `100vh`
- **Benefit**: Cube viewer truly fills the visible screen without layout shifts or scroll

**Additional Mobile Optimizations:**
- Responsive camera distance (4.5 for mobile, 3 for desktop)
- Touch device detection reduces calibration ring opacity for better visibility
- Global pointer events handle both mouse and touch input seamlessly
- `touch-action: none` prevents browser gestures interfering with cube rotation
- Hidden frame info panel on mobile (responsive: hidden md:block)
- Reduced particle count (75 vs 150 on desktop)

### HUD Implementation

**Hybrid Update Strategy:**
The HUD uses different update rates depending on interaction state to balance responsiveness with readability.

```typescript
// State tracking
const displayedRotationX = ref(0)
const displayedRotationY = ref(0)
const visibleFaceNumbers = ref<number[]>([])
let lastThrottledUpdate = 0
const THROTTLE_MS = 100 // 10fps when idle
```

**During Drag (`isDragging = true`):**
- Updates at 60fps (every animation frame)
- Includes drag offset in displayed values for immediate feedback
- Face numbers update in real-time as cube rotates

**When Idle (`isDragging = false`):**
- Updates at 10fps (every 100ms)
- Values settle and become readable
- Reduced Vue reactivity overhead

### Critical Implementation Details

#### Memory Leak Prevention: Three.js Resource Disposal

**Solution:** Comprehensive cleanup in `onUnmounted` hook:
```typescript
onUnmounted(() => {
  // Dispose cube materials and textures
  const materials = cube.material as THREE.MeshBasicMaterial[]
  materials.forEach((material) => {
    if (material.map) material.map.dispose()
    material.dispose()
  })
  cube.geometry.dispose()

  // Dispose edges
  edges.geometry.dispose()
  ;(edges.material as THREE.Material).dispose()

  // Dispose renderer
  renderer.dispose()
})
```

#### Error Handling in Texture Loading

**Solution:** Try-catch blocks with detailed error logging:
```typescript
async function updateFaceTexture(faceIndex: number, imageIndex: number): Promise<void> {
  if (!cube || !props.images[imageIndex]) {
    console.error(`Invalid texture update request...`)
    return
  }

  try {
    const texture = await loadCroppedTexture(props.images[imageIndex])
    // Apply texture...
  } catch (error) {
    console.error(`Failed to load texture for face ${faceIndex}...`)
  }
}
```

#### Texture Memory Management

**Solution:** Dispose before replacing:
```typescript
// In updateFaceTexture()
if (material.map) {
  material.map.dispose()  // Clean up old texture
}
material.map = texture  // Apply new texture
```

#### Free Rotation Logic (Camera-Relative)

The cube uses **quaternion-based camera-relative rotation** to ensure swipe direction always matches user expectations.

**Drag-to-Axis Mapping:**
- **Swipe Right (→)**: Rotate around world Y axis → faces move right on screen
- **Swipe Left (←)**: Rotate around world Y axis → faces move left on screen
- **Swipe Up (↑)**: Rotate around world X axis → faces move up on screen
- **Swipe Down (↓)**: Rotate around world X axis → faces move down on screen

**Why Quaternions?**
- **Consistent behavior**: Rotation direction is always relative to camera/screen
- **No gimbal lock**: Quaternions avoid gimbal lock issues
- **Smooth interpolation**: Slerp provides natural, smooth rotation transitions
- **Intuitive UX**: When cube is upside down, right swipe still moves faces right on screen

### Momentum/Inertia System

The cube features a realistic momentum system that provides satisfying spin after fast flicks while maintaining precise control for slow movements.

**Configuration Constants:**
```typescript
const MOMENTUM_SCALE = 0.12      // 12% of rotation becomes momentum
const MOMENTUM_DECAY = 0.9       // Loses 10% per frame
const MOMENTUM_THRESHOLD = 0.0001 // Stop threshold
const MOMENTUM_MINIMUM = 0.03     // Minimum speed to trigger momentum
```

**Key Mechanisms:**
1. **Movement Detection**: Checks if drag delta is changing vs holding still
2. **Minimum Threshold**: Only movements faster than 1.7° per frame trigger momentum
3. **Momentum Capture**: Momentum = current rotation × scale factor (12%)
4. **Decay**: Exponential decay - each frame multiplies by 0.9

### Dynamic Face Image Change System

The cube automatically changes the image on a face when it transitions from off-view to on-view.

#### Face Detection Algorithm
1. **Face Normals**: Each of the 6 faces has a normal vector pointing in its local direction
2. **Visibility Check**: Transform face normals by cube's rotation, calculate dot product with camera
3. **Transition Detection**: Track `previouslyVisibleFaces` Set and compare with current frame
4. **Image Update**: When face becomes newly visible, check cooldown (3000ms), then increment image index

### Showcase Mode

Showcase mode provides automated face presentation with custom sequences.

#### Props Interface

```typescript
interface ShowcaseMode {
  enabled: boolean              // Enable showcase mode
  sequence: number[]            // Face sequence to display [0,2,4,...]
  faceDuration?: number         // Duration per face (ms, default: 3000)
  autoStart?: boolean           // Start on mount (default: false)
  loop?: boolean                // Loop sequence (default: true)
  rotationSpeed?: number        // Slerp factor (default: 0.02, lower = smoother)
}
```

#### Public API

- `startShowcase()`: Manually start showcase mode (emits `showcaseStarted`)
- `stopShowcase()`: Manually stop showcase mode (emits `showcaseStopped`)
- `toggleShowcase()`: Toggle showcase on/off
- `pauseShowcase()`: Pause showcase without stopping (emits `showcasePaused`)
- `resumeShowcase()`: Resume from paused state (emits `showcaseResumed`)

**Events:**
- `@showcase-started` - Emitted when showcase mode starts
- `@showcase-stopped` - Emitted when showcase mode stops
- `@showcase-paused` - Emitted when showcase is paused
- `@showcase-resumed` - Emitted when showcase resumes from paused state
- `@showcase-completed` - Emitted when non-looping sequence completes

## Development Workflow

### Setting Up Development Environment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cube-swiper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   - Navigate to `http://localhost:5173`
   - Application will hot-reload on file changes

### Adding Images

1. **Place images in `src/assets/images/`:**
   ```bash
   cp my-image.jpg src/assets/images/
   ```

2. **Images are automatically loaded:**
   - No code changes required
   - Images are detected and loaded via Vite glob
   - Sorted alphabetically for consistency

### Running Tests

1. **Watch mode during development:**
   ```bash
   npm run test
   ```

2. **Single run for CI/CD:**
   ```bash
   npm run test:run
   ```

3. **UI mode for debugging:**
   ```bash
   npm run test:ui
   ```

### Building for Production

1. **Type check and build:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

3. **Output:**
   - Built files in `dist/` directory
   - Images automatically optimized
   - Ready for deployment

## Troubleshooting

### Common Issues

**Issue:** Images not loading
- **Solution:** Check browser console for CORS errors, ensure images are in `src/assets/images/`

**Issue:** Cube not responding to drag
- **Solution:** Check if `touch-action: none` is applied, verify pointer event listeners

**Issue:** Showcase mode not starting
- **Solution:** Ensure `showcaseMode.enabled` is true, verify sequence array is valid (0-5)

**Issue:** Memory leak in production
- **Solution:** Verify `onUnmounted` cleanup is running, check for disposed textures

### Debug Mode

Enable debug logging by setting environment:
```bash
# Development mode has debug logging enabled
npm run dev

# Production builds silence console logs
npm run build
```

Check console for:
- Texture loading progress
- Face visibility changes
- Showcase state transitions
- Error messages with context

## Performance Optimization Tips

1. **Image Optimization:**
   - Use WebP format for best compression
   - Keep image size reasonable (2048x2048 recommended)
   - Leverage automatic compression in production builds

2. **Three.js Optimization:**
   - Pre-loaded textures reduce runtime loading
   - MeshBasicMaterial is faster than shaded materials
   - Particle count reduced on mobile devices

3. **Vue Reactivity:**
   - Throttled HUD updates reduce reactivity overhead
   - Computed properties for expensive calculations
   - Ref instead of reactive for simple values

4. **Mobile Performance:**
   - Reduced particle count (75 vs 150)
   - Responsive camera distance
   - Hidden frame info panel on mobile
