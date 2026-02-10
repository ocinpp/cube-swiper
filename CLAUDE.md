# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **3D image viewer with a cyber-chronometer aesthetic** built with Vue 3, Three.js, and TypeScript. Users can freely drag to rotate a 3D cube that displays images on its faces. As faces become visible to the camera, they automatically cycle to new images with a smart cooldown system. **Non-square images are automatically center-cropped to prevent distortion**. The UI features an industrial luxury design inspired by precision timekeeping instruments, combining elegant serif typography with technical monospace data readouts.

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
- ✅ Comprehensive drag-to-axis mapping documentation
- ✅ All code review feedback addressed through two rounds of review

**Completed (Phase 2.75 - Showcase Mode):**
- ✅ Custom face sequence showcase mode
- ✅ Configurable timing, looping, and auto-start
- ✅ Programmatic API (start/stop/toggle/pause/resume)
- ✅ Smooth quaternion-based rotation to align faces with camera
- ✅ Integration with existing image cycling system
- ✅ Comprehensive documentation
- ✅ Event system for reactive state tracking
- ✅ Pause/resume functionality
- ✅ Delta time precision (no timing drift)
- ✅ Production-ready console logging
- ✅ JSDoc documentation for public API

**Completed (Phase 2.8 - Native Brightness):**
- ✅ **MeshBasicMaterial**: Switched to unlit material for 100% browser-native brightness
  - Images display at identical brightness to regular `<img>` tags
  - No shading or lighting calculations affect image brightness
  - Flat, clean aesthetic optimized for image viewing
  - Simplified rendering with fewer calculations
- ✅ **NoToneMapping**: Disabled tone mapping for accurate color reproduction
- ✅ **Simplified Props**: Removed exposure control (no longer needed with MeshBasicMaterial)
- ✅ **Performance**: Slightly better performance with reduced shader complexity

**Remaining Enhancements (Phase 3 - Aesthetic Enhancements):**
- ✅ Particle system with cyan, amber, and magenta colors
- ✅ Enhanced dramatic lighting (key light, fill light, rim light)
- ✅ Volumetric fog effect for depth
- ✅ Dynamic edge glow that pulses and responds to drag
- ✅ Interactive light feedback during user interaction
- ✅ Enhanced material properties (increased clearcoat, reduced roughness)
- ✅ CSS scanline overlay and gradient background
- ✅ Calibration ring pulse animation
- ✅ Magenta color added to palette
- ✅ Mobile-optimized particle count (50% on mobile devices)

**Code Review Fixes Applied:**
- ✅ Race condition: Guard checks in `showcaseTargetFace` computed property
- ✅ Timing precision: Delta time system using `performance.now()`
- ✅ Events: 5 events emitted for state changes
- ✅ Pause/Resume: Full control over showcase playback
- ✅ Production logging: `DEBUG` environment check
- ✅ JSDoc: Complete API documentation

**Remaining Enhancements (Phase 3):**
- ✅ Aesthetic enhancements completed (particle system, enhanced lighting, dynamic edges, fog)
- Accessibility improvements (ARIA, keyboard nav)
- ✅ Unit tests added for material reordering logic (Phase 2.86)
- Additional tests for quaternion rotation logic and showcase mode (future work)

**Completed (Phase 2.86 - Code Review & Testing):**
- ✅ **Input Validation**: Comprehensive validation for `pendingSkippedFaceUpdate`
  - Range check: validates face index is 0-5
  - Type check: ensures value is integer
  - Error logging: clear messages with automatic state cleanup
  - Location: `src/components/MagicCube.vue:851-860`
- ✅ **Race Condition Prevention**: `pendingUpdateTriggered` one-shot flag
  - Prevents duplicate pending updates during rapid rotation
  - Reset to `false` when setting new pending update
  - Set to `true` after update executes
  - Location: `src/components/MagicCube.vue:247, 769, 921`
- ✅ **Code Deduplication**: Extracted `translateIndex` to module-level
  - Single constant defined at `src/components/MagicCube.vue:249-253`
  - Used in both `assignImagesToFacesForShowcase()` and pending update logic
  - Eliminates duplicate function definitions
  - Material reordering swaps adjacent pairs: [0↔1, 2↔3, 4↔5]
- ✅ **Unit Test Infrastructure**: Vitest setup with comprehensive coverage
  - Test file: `src/utils/materialReordering.spec.ts`
  - 16 tests covering all aspects of material reordering logic
  - Test categories:
    - translateIndex function (adjacent pair swaps, symmetry)
    - Face-to-image mapping (logical and material index calculations)
    - Even distribution across faces
    - Edge cases (valid/invalid indices)
    - Full pipeline integration tests
  - All tests passing: 16/16 in 2ms runtime
  - Configuration: `vitest.config.ts` with jsdom environment
  - Commands: `npm run test` (watch), `npm run test:run` (single), `npm run test:ui` (UI)
  - Coverage provider: v8 with text and html reporters

**Completed (Phase 2.85 - Display & Distribution Fixes):**
- ✅ **Material Reordering Fix**: Fixed Three.js BoxGeometry material indexing
  - Three.js assigns materials to faces in order: right(0), left(1), top(2), bottom(3), front(4), back(5)
  - To show images [1,2,3,4,5,6] on faces [0,1,2,3,4,5], materials array is reordered
  - Reordering swaps adjacent pairs: [0↔1, 2↔3, 4↔5]
  - Ensures images display in correct sequential order
  - `faceImageIndices` tracks logical images [0,1,2,3,4,5] for even distribution
  - `assignImagesToFacesForShowcase()` translates logical to material indices using `translateIndex()`
- ✅ **Even Image Distribution**: Fixed face cycling to ensure uniform appearance
  - `faceImageIndices` initialized to [0,1,2,3,4,5] instead of swapped values
  - Each face cycles through images starting from different offset
  - All images appear with equal frequency across all faces
  - Prevents certain images from appearing "too frequently"
- ✅ **Showcase Mode F4 Pending Update**: Added pending update for skipped face
  - When transitioning F5→F0, pre-load next cycle's images
  - Skip F4 (second-to-last face) to prevent showing old image during rotation
  - Set `pendingSkippedFaceUpdate = 4` when F4 is skipped
  - When F0 aligns with camera (alignment >= 0.999), update F4 with correct image
  - Ensures F4 eventually shows new cycle's image without visible glitch
  - F5 updated immediately (no pending update needed)

### Aesthetic Vision

**Design Direction**: Soft Cocktail Lounge - warm, inviting atmosphere
- **Colors**: Warm cream background (#f9f6f1) with rose pink, mint, and soft watermelon accents (#e8c4c4, #a8c4a8, #ffb6b6)
- **Typography**: Dual system - Playfair Display (elegant serif) for titles, JetBrains Mono (technical monospace) for data
- **Atmosphere**: Subtle particle system with floating pastel orbs, mechanical calibration ring, and dust-free environment (no fog for maximum brightness)
- **Differentiation**: Clean, gallery-like presentation that prioritizes image clarity and color accuracy
- **Material**: MeshBasicMaterial for 100% browser-native brightness - images look exactly like they would in a regular `<img>` tag

### Current Aesthetic Implementation (Phase 2.8)

**Material System:**
- **MeshBasicMaterial**: Unlit material for perfect brightness
  - Images display at 100% original brightness
  - No shading, reflections, or lighting calculations
  - Flat, clean appearance optimized for image viewing
  - Identical to browser `<img>` tag rendering

**Lighting (for edge glow only):**
- Ambient light: Warm white (0xfff5f0, 0.8 intensity)
- Key light: White directional (2.0 intensity) at (2, 2, 4)
- Fill light: Soft cyan (0xf0f5f0, 1.2 intensity) at (-3, 1, 3)
- Rim light: Rose pink (0xe8c4c4, 0.4 intensity) at (-4, 2, -3)
- Note: Lights affect only edge glow, not cube faces (MeshBasicMaterial is unlit)

**Particle System:**
- 150 particles (75 on mobile) floating in sphere around cube (radius 2-4)
- Three-color palette: Rose pink (#e8c4c4), Mint (#a8c4a8), Soft watermelon (#ffb6b6)
- Random velocities with slow ambient rotation
- Spherical boundary wrapping for continuous atmosphere
- Normal blending for subtle appearance

**Dynamic Edge Glow:**
- Base opacity: 0.3 (idle), 0.5 (drag)
- Pulse animation: ±0.2 sinusoidal variation
- Normal blending for subtle effect
- Color: Dusty rose (#d4a5a5)
- Responsive to user interaction state

**Fog:**
- Disabled (density 0.0) for maximum brightness and clarity
- Images display at full brightness without atmospheric dimming

**Renderer Settings:**
- Tone mapping: NoToneMapping (disabled for accurate colors)
- Output color space: SRGBColorSpace (proper color display)
- Anisotropic filtering: Enabled for sharp textures at oblique angles

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`) and TypeScript
- **Three.js** for 3D rendering and cube manipulation
- **Vite** for build tooling
- **Tailwind CSS** for styling with custom cyber-chronometer design system
- **vue-tsc** for TypeScript type checking

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
│   └── MagicCube.vue         # Main 3D cube component with Three.js logic (~1000 lines)
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

**File:** `eslint.config.js`

```javascript
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  prettierRecommended,
  {
    rules: {
      'no-undef': 'off',                              // TypeScript handles this
      'vue/multi-word-component-names': 'off',        // Allow single-word components
      '@typescript-eslint/no-explicit-any': 'warn',   // Warn on any, not error
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }  // Prefix unused with _
      ]
    }
  }
]
```

**Key Rules:**
- TypeScript strict mode enforced
- Unused variables/parameters must be prefixed with `_`
- `any` types allowed only with warning
- Multi-word component names not required
- Vue parser for `.vue` files

### Prettier Configuration

**File:** `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

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

**File:** `vitest.config.ts`

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

**Current implementation** (`src/App.vue:11-31`):
```typescript
const imageModules = import.meta.glob<{ default: string }>(
  '../assets/images/*.{jpg,jpeg,png,webp,gif,svg}',
  { eager: true }
)
const sampleImages = Object.values(imageModules)
  .map((mod) => mod.default)
  .sort()
```

### Automatic Image Compression

The project uses **`vite-plugin-image-optimizer`** to automatically compress images during production builds.

**Compression settings** (`vite.config.ts:4-28`):
- **JPG/JPEG:** Quality 85 (typically 40-60% size reduction)
- **PNG:** Maximum compression (level 9) with quality 85
- **WebP:** Quality 85 (best compression ratio for modern browsers)
- **SVG:** Multi-pass optimization with cleanup plugins

**Behavior:**
- **Development mode:** Images served as-is (fast iteration)
- **Production build:** Images automatically optimized in dist/
- Original files never modified - optimization happens at build time

**Recommendation:** Use WebP format for best size/quality balance. Convert images using: `ffmpeg -i input.jpg -quality 85 output.webp`

### Image Cropping for Non-Square Images

The project includes **automatic square cropping** to prevent distortion when non-square images are displayed on the cube's square faces.

**Implementation** (`src/utils/textureCropping.ts`):
- Canvas-based client-side cropping using HTML5 Canvas API
- Three cropping strategies available (see Props below)
- CORS-enabled for remote image loading (Unsplash, etc.)
- Memory-efficient: old canvas textures properly disposed

**Cropping Strategies:**
- **`cover`** (default): Center crop to square - best for photos, crops edges evenly
- **`contain`**: Letterbox to fit entire image - shows full image with black bars
- **`fill`**: Stretch to square - legacy behavior, may cause distortion

**How it works for portrait images (e.g., 1792×2400):**
```typescript
const cropSize = Math.min(1792, 2400)  // 1792
const cropY = (2400 - 1792) / 2        // 304px from top
// Result: 1792×1792 square from center
```

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

### Key Files and Their Purposes

**src/components/MagicCube.vue** - The core component containing:
- Props:
  - `images: string[]` - Array of image URLs (required)
  - `cropStrategy: 'cover' | 'contain' | 'fill'` - Cropping strategy (default: 'cover')
  - `cropSize: number` - Target square size in pixels (default: 2048)
- Three.js scene setup (scene, camera, renderer, lighting)
- Cube mesh creation with 6 faces, each mapped to an image texture
- **Texture loading with cropping**: All images cropped to square before being applied as textures
- **Dynamic face image changes**: Detects when faces become visible and cycles through images
- **Face visibility system**: Uses dot product of face normals with camera direction
- **Cooldown mechanism**: 3-second cooldown per face prevents excessive changes
- **Hybrid HUD update system**:
  - During drag: Real-time 60fps updates for rotation coordinates and face numbers
  - When idle: Throttled to 10fps (every 100ms) for readability and reduced reactivity overhead
- **HUD Interface**: Technical readouts showing rotation coordinates, visible face numbers (e.g., F0, F2, F4), frame count, and cycle statistics
- **Calibration Ring**: SVG-based outer ring with degree markers that rotates with the cube
- Amber/cyan/magenta color scheme (0xff9500, 0x00d4ff, 0x8b5cf6) for lighting and cube edges
- Enhanced dramatic lighting with key light (amber spot), fill light (cyan point), and rim light (magenta spot)
- Volumetric fog effect (exponential, density 0.08) for atmospheric depth
- Particle system with 200 particles (100 on mobile) in cyan, amber, and magenta colors
- Smooth rotation interpolation using lerp (0.08 factor) in the animation loop
- Real-time drag feedback: applies drag offset during interaction
- On drag release: captures current cube rotation as new target (prevents snap-back)
- Subtle animations: floating (sinusoidal y-position), pulsing edge glow, and ambient particle rotation
- Interactive light feedback: lights intensify during drag (1.5x) for dynamic response

**src/composables/useCubeNavigation.ts** - Gesture handling composable:
- Global pointer event listeners (not bound to specific element)
- Tracks `dragDeltaX`, `dragDeltaY`, and `isDragging` state
- Navigation callback is currently a no-op (free rotation only)
- Used for drag tracking - could be extended to add swipe gestures later

### Three.js Configuration Details

- Camera distance adjusts for mobile (4.5) vs desktop (3)
- Uses `MeshBasicMaterial` for 100% browser-native brightness (unlit material)
  - No shading, reflections, or lighting calculations
  - Images display at identical brightness to `<img>` tags
  - Flat, clean appearance optimized for image viewing
- **Lighting system** (for edge glow and particles only):
  - Ambient light: Warm white (0xfff5f0, 0.8 intensity)
  - Key light: White directional (2.0 intensity) at (2, 2, 4)
  - Fill light: Soft cyan (0xf0f5f0, 1.2 intensity) at (-3, 1, 3)
  - Rim light: Rose pink (0xe8c4c4, 0.4 intensity) at (-4, 2, -3)
  - Note: Lights do NOT affect cube faces (MeshBasicMaterial is unlit)
- **Particle system**: 150 particles (75 on mobile) with random velocities in sphere radius 2-4
- **Fog**: Disabled (density 0.0) for maximum brightness and clarity
- **Dynamic edges**: Dusty rose edges (#d4a5a5) with normal blending, pulsing between 0.3-0.5 opacity
- Edge opacity brightens during drag for interactive feedback
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
- `--color-rose`: #d4a5a5 (dusty rose for edges and accents)
- `--color-rose-light`: #e8c4c4 (light rose for lighting)
- `--color-mint`: #a8c4a8 (soft mint for accent)
- `--color-watermelon`: #ffb6b6 (soft watermelon for particles)
- `--color-text-dark`: #8b7355 (warm brown for text)
- `--color-white`: #f5f5f7 (primary text)
- `--color-gray`: #8a8a93 (secondary text)

**Typography**:
- `--font-serif`: Playfair Display (titles, 24px, 600 weight)
- `--font-mono`: JetBrains Mono (data readouts, 13px, 400 weight)

**UI Components**:
- `.hud-panel`: Semi-transparent panels with warm cream backgrounds and rose border accents
- `.calibration-ring`: SVG-based circular indicator with degree markers and rotating element
- `.loading-spinner`: Dual-ring mechanical spinner with counter-rotating rose/mint rings

**Animations**:
- `--transition-mechanical`: 500ms cubic-bezier(0.2, 0.8, 0.2, 1) for calibration ring
- `--transition-smooth`: 300ms cubic-bezier(0.4, 0, 0.2, 1) for UI elements
- Calibration ring pulse: 4-second ease-in-out infinite animation

### Mobile Optimization & Viewport Handling

**Dynamic Viewport Height (dvh)**:
- Uses `100dvh` instead of `100vh` throughout the application
- Implemented in `App.vue` (`h-dvh` class) and `main.css` (`height: 100dvh`)
- **Problem solved**: Mobile browsers (Safari, Chrome) have collapsible address bars that affect `100vh`
- **Benefit**: Cube viewer truly fills the visible screen without layout shifts or scroll

**Implementation**:
```vue
<!-- App.vue -->
<div class="w-full h-dvh overflow-hidden">
```

```css
/* main.css */
html, body, #app {
  width: 100%;
  height: 100dvh;  /* Dynamic viewport height */
  overflow: hidden;
}
```

**Browser Support**:
- Modern browsers: Chrome 108+, Safari 16.4+, Firefox 101+
- Graceful fallback: Older browsers ignore `dvh` and use `vh`
- Progressive enhancement: No polyfills needed

**Additional Mobile Optimizations**:
- Responsive camera distance (4.5 for mobile, 3 for desktop)
- Touch device detection reduces calibration ring opacity for better visibility
- Global pointer events handle both mouse and touch input seamlessly
- `touch-action: none` prevents browser gestures interfering with cube rotation

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
- Creates dynamic "technical instrument" feel

**When Idle (`isDragging = false`):**
- Updates at 10fps (every 100ms)
- Values settle and become readable
- Reduced Vue reactivity overhead
- Calmer display

**Always Real-Time:**
- Frame counter: Increments every frame to show "system active"
- Total image cycles: Updates when faces actually change images
- Status indicator: Switches between ACTIVE/MANUAL OVERRIDE instantly

**Visible Face Numbers:**
```typescript
// Convert Set to sorted array for display
visibleFaceNumbers.value = Array.from(nowVisibleFaces).sort((a, b) => a - b)
```

Template rendering:
```vue
<div class="hud-value hud-value--accent">
  <span v-for="(face, index) in visibleFaceNumbers" :key="face">
    F{{ face }}<span v-if="index < visibleFaceNumbers.length - 1">, </span>
  </span>
</div>
```

Displays as: `F0, F2, F4` (changes dynamically as cube rotates)

### Critical Fixes Applied (Phase 1)

The following critical issues identified in code review have been addressed:

#### 1. Memory Leak: Three.js Resource Disposal
**Problem:** Textures, materials, and geometries were never disposed, causing GPU memory leaks.

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

#### 2. Error Handling in Texture Loading
**Problem:** Unhandled promise rejections when textures fail to load.

**Solution:** Try-catch blocks with detailed error logging:
```typescript
async function updateFaceTexture(faceIndex: number, imageIndex: number): Promise<void> {
  if (!cube || !props.images[imageIndex]) {
    console.error(`Invalid texture update request...`)
    return
  }

  try {
    const texture = await loadTexture(props.images[imageIndex])
    // Apply texture...
  } catch (error) {
    console.error(`Failed to load texture for face ${faceIndex}...`)
  }
}
```

**Initial load protection:**
```typescript
const textures = await Promise.all(
  props.images.map((url, index) => {
    return new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => {
          console.error(`Failed to load texture at index ${index}:`, error)
          reject(error)
        }
      )
    })
  })
).catch((error) => {
  console.error('Critical: Failed to load required textures:', error)
  throw error
})
```

#### 3. Texture Memory Management
**Problem:** Old textures not disposed when replaced, causing memory bloat.

**Solution:** Dispose before replacing:
```typescript
// In updateFaceTexture()
if (material.map) {
  material.map.dispose()  // Clean up old texture
}
material.map = texture  // Apply new texture
```

#### 4. Defensive Programming
**Problem:** Potential runtime errors if functions called before initialization.

**Solution:** Guard clauses with warnings:
```typescript
function getVisibleFaces(): Set<number> {
  if (!camera || !cube) {
    console.warn('getVisibleFaces called before camera or cube initialized')
    return new Set()
  }
  // ... rest of function
}
```

#### 5. TypeScript Improvements
**Added explicit return types:**
- `updateFaceTexture(): Promise<void>`
- `getVisibleFaces(): Set<number>`
- `formatRotation(degrees: number): string`

**Impact:**
- No more GPU memory leaks on component unmount
- Graceful degradation when images fail to load
- Clear error messages for debugging
- Type safety improvements throughout

### Free Rotation Logic (Camera-Relative)

The cube uses **quaternion-based camera-relative rotation** to ensure swipe direction always matches user expectations.

#### Drag-to-Axis Mapping Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAMERA VIEW (Screen Space)                   │
│                                                                  │
│        +Y (screen up)    ↑    World +Y axis (points up)         │
│                          │                                       │
│                          │                                       │
│                          │                                       │
│  -X (left) ←─────────────●─────────────→ +X (screen right)      │
│                    (center)              World +X axis            │
│                          │            (points right)             │
│                          │                                       │
│                          │                                       │
│                          ↓                                       │
│        -Y (screen down)  │                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

DRAG DIRECTION → ROTATION AXIS → VISUAL EFFECT
═══════════════════════════════════════════════════════════════════

Swipe Right (→)           │  Rotate around World Y   │  Faces move → on screen
dragDeltaX > 0            │  (vertical axis)         │
                          │  → rotateOnWorldAxis(    │
                          │    new Vector3(0,1,0),   │
                          │    angle)                │
───────────────────────────────────────────────────────────────────
Swipe Left (←)            │  Rotate around World Y   │  Faces move ← on screen
dragDeltaX < 0            │  (vertical axis)         │
                          │  → rotateOnWorldAxis(    │
                          │    new Vector3(0,1,0),   │
                          │    -angle)               │
───────────────────────────────────────────────────────────────────
Swipe Up (↑)              │  Rotate around World X   │  Faces move ↑ on screen
dragDeltaY < 0            │  (horizontal axis)       │
                          │  → rotateOnWorldAxis(    │
                          │    new Vector3(1,0,0),   │
                          │    -angle)               │
                          │  (negative because Y-up) │
───────────────────────────────────────────────────────────────────
Swipe Down (↓)            │  Rotate around World X   │  Faces move ↓ on screen
dragDeltaY > 0            │  (horizontal axis)       │
                          │  → rotateOnWorldAxis(    │
                          │    new Vector3(1,0,0),   │
                          │    angle)                │
                          │  (positive because Y-up) │
═══════════════════════════════════════════════════════════════════

KEY INSIGHT: Rotating around world Y makes things spin horizontally (like a
lazy susan). Rotating around world X makes things tilt vertically (like
nodding). This is why screen X drag maps to world Y rotation, and screen
Y drag maps to world X rotation.

CUBE ORIENTATION INDEPENDENCE: Because we use world axes (not cube's local
axes), the behavior is consistent regardless of how the cube is currently
oriented. Upside down, sideways, or at any angle - right swipe always
moves faces right on screen.
```

#### Implementation Flow

1. User drags → `useCubeNavigation` updates `dragDeltaX/Y` and `isDragging`
2. Animation loop applies drag offset using world-axis rotation:
   - Horizontal drag (`dragDeltaX`) → rotates around world Y axis
   - Vertical drag (`dragDeltaY`) → rotates around world X axis
   - Uses `rotateOnWorldAxis()` on a helper object for screen-space rotation
   - **Movement detection**: Checks if drag delta is changing vs holding still
   - **Momentum capture**: Only fast movements (> 0.03 radians) create momentum
3. Cube quaternion smoothly interpolates to target using `slerp()` with `SLERP_FACTOR` (0.08)
4. On pointer up → current cube quaternion becomes new target quaternion (using `clone()`)
5. **Momentum decay**: If momentum exists, continues rotation with exponential decay (× 0.9 per frame)
6. No snap-back: orientation persists smoothly after drag release

**Why Quaternions?**
- **Consistent behavior**: Rotation direction is always relative to camera/screen, not cube orientation
- **No gimbal lock**: Quaternions avoid the gimbal lock issues inherent with Euler angles
- **Smooth interpolation**: Slerp provides natural, smooth rotation transitions
- **Intuitive UX**: When cube is upside down, right swipe still moves faces right on screen

**Implementation** (`src/components/MagicCube.vue:147-153`):
```typescript
// Rotation configuration constants
const DRAG_SENSITIVITY = 0.3
const SLERP_FACTOR = 0.08
const DEG_TO_RAD = Math.PI / 180

// Momentum configuration
const MOMENTUM_SCALE = 0.12      // 12% of rotation becomes momentum
const MOMENTUM_DECAY = 0.9       // Loses 10% per frame
const MOMENTUM_THRESHOLD = 0.0001 // Stop threshold
const MOMENTUM_MINIMUM = 0.03     // Minimum speed to trigger momentum

// World axes for camera-relative rotation
const worldUpAxis = new THREE.Vector3(0, 1, 0)
const worldRightAxis = new THREE.Vector3(1, 0, 0)

// Apply drag offset using world axes
rotationHelper.quaternion.copy(targetQuaternion)
rotationHelper.rotateOnWorldAxis(worldRightAxis, dragXRotation)
rotationHelper.rotateOnWorldAxis(worldUpAxis, dragYRotation)

// Smooth interpolation with slerp
cube.quaternion.slerp(rotationHelper.quaternion, SLERP_FACTOR)
```

### Momentum/Inertia System

The cube features a realistic momentum system that provides satisfying spin after fast flicks while maintaining precise control for slow movements.

#### Design Goals

1. **Fast flicks should spin** - Quick movements create satisfying momentum
2. **Slow drags should stop** - Precise positioning without unwanted spin
3. **Holding still should not create momentum** - Stop during drag = no momentum on release
4. **Natural decay** - Momentum should fade smoothly like a real physical object

#### Implementation

The system uses **three key mechanisms** to achieve these goals:

**1. Movement Detection** (`src/components/MagicCube.vue:168-169, 376-377`)
```typescript
let lastDragDeltaX = 0
let lastDragDeltaY = 0

// Check if actually moving (drag delta changing) vs holding still
const isMovingX = Math.abs(dragDeltaX.value - lastDragDeltaX) > 0.1
const isMovingY = Math.abs(dragDeltaY.value - lastDragDeltaY) > 0.1
```
- Tracks previous frame's drag delta
- Compares with current to detect actual movement
- Only captures momentum when user is **actually moving**, not holding still

**2. Minimum Threshold** (`MOMENTUM_MINIMUM = 0.03` radians ≈ 1.7°)
```typescript
const isFastMovementX = isMovingX && Math.abs(applyRotationX) > MOMENTUM_MINIMUM
```
- Prevents slow drags from creating momentum
- Only genuine fast flicks trigger spin
- Threshold tunable via constant

**3. Momentum Capture** (`src/components/MagicCube.vue:382-383`)
```typescript
momentumX = isFastMovementX ? applyRotationX * MOMENTUM_SCALE : 0
momentumY = isFastMovementY ? applyRotationY * MOMENTUM_SCALE : 0
```
- Momentum = current rotation × scale factor (12%)
- If not moving fast enough, momentum = 0
- Scales directly from rotation being applied (ensures correct direction)

**4. Decay** (`src/components/MagicCube.vue:394-396`)
```typescript
if (|momentum| > threshold) {
  applyRotation = momentum
  momentum *= MOMENTUM_DECAY  // 0.9 per frame
}
```
- Exponential decay: each frame multiplies by 0.9
- Creates smooth, natural slowdown
- Stops when below minimum threshold (0.0001 radians)

#### Configuration Constants

```typescript
const MOMENTUM_SCALE = 0.12      // 12% of rotation becomes momentum
const MOMENTUM_DECAY = 0.9       // Loses 10% per frame
const MOMENTUM_THRESHOLD = 0.0001 // Stop when below this
const MOMENTUM_MINIMUM = 0.03     // Only movements faster than 1.7° trigger momentum
```

**Tuning Guide:**
- `MOMENTUM_SCALE` higher = longer spin
- `MOMENTUM_DECAY` higher (closer to 1.0) = slower fade
- `MOMENTUM_MINIMUM` higher = only faster flicks spin
- `MOMENTUM_THRESHOLD` lower = spins until almost stopped

#### Behavior Examples

| User Action | Movement Detected | Rotation | Momentum | Result |
|------------|------------------|----------|----------|--------|
| Slow drag (0.5°/frame) | ✅ Yes | < threshold | 0 | Stops on release |
| Fast flick (3°/frame) | ✅ Yes | > threshold | rotation × 0.12 | Spins then fades |
| Drag → stop → hold | ❌ No (no change) | N/A | 0 | Stops dead |
| Flick → release | ✅ Yes | > threshold | Captured | Smooth spin |

### Code Review Feedback (Phase 2.5)

After initial implementation, a comprehensive code review identified several improvements that have all been addressed:

**Important Issues Fixed:**
1. **Euler Conversion Limitation Documented** (`src/components/MagicCube.vue:158-160`)
   - Added note explaining quaternion→Euler conversion is for HUD display only
   - Documented that precision loss from gimbal lock/angle wrapping is acceptable since internal orientation uses quaternions

**Minor Issues Fixed:**
1. **Magic Numbers Extracted** (`src/components/MagicCube.vue:146-151`)
   - `DRAG_SENSITIVITY = 0.3` - Multiplier for drag delta to rotation
   - `SLERP_FACTOR = 0.08` - Smooth interpolation factor (0-1, higher = faster)
   - `DEG_TO_RAD = Math.PI / 180` - Conversion factor for degrees to radians

2. **Comment Clarity Improved** (`src/components/MagicCube.vue:152-158`)
   - Added detailed comments explaining screen X → world Y and screen Y → world X mapping
   - Documented why rotating around world Y makes things move horizontally on screen

3. **Cleanup Documentation Added** (`src/components/MagicCube.vue:496-498`)
   - Documented rotationHelper as module-level const that doesn't need explicit cleanup
   - Clarified it's not in scene graph and has no disposal requirements

4. **clone() Instead of copy()** (`src/components/MagicCube.vue:459`)
   - Changed to `targetQuaternion = cube.quaternion.clone()` for clearer intent
   - Creates new quaternion instance rather than modifying existing one

5. **Comprehensive Documentation Added** (`CLAUDE.md:467-527`)
   - ASCII diagram showing camera view and axis directions
   - Table mapping drag direction → rotation axis → visual effect
   - Key insight explaining why screen X maps to world Y rotation
   - Cube orientation independence explanation

### Dynamic Face Image Change System

The cube automatically changes the image on a face when it transitions from off-view to on-view.

#### Face Detection Algorithm
1. **Face Normals**: Each of the 6 faces has a normal vector pointing in its local direction:
   - Face 0: +X (right) → (1, 0, 0)
   - Face 1: -X (left) → (-1, 0, 0)
   - Face 2: +Y (top) → (0, 1, 0)
   - Face 3: -Y (bottom) → (0, -1, 0)
   - Face 4: +Z (front) → (0, 0, 1)
   - Face 5: -Z (back) → (0, 0, -1)

2. **Visibility Check**: In each animation frame:
   - Transform each face normal by the cube's rotation quaternion to get world-space normal
   - Calculate dot product with camera view direction
   - If dot product > 0, the face is pointing toward camera (visible)

3. **Transition Detection**: Track `previouslyVisibleFaces` Set and compare with current frame

4. **Image Update**: When a face becomes newly visible (not in previous Set):
   - Check if cooldown period (3000ms) has elapsed
   - Increment the face's image index (modulo `props.images.length`)
   - Asynchronously load and apply new texture to the face's material

#### State Tracking
- `faceNormals`: Array of 6 Vector3 objects representing face directions
- `previouslyVisibleFaces`: Set of face indices visible in last frame
- `faceImageIndices`: Array tracking current image index for each face (0-5 initially)
- `faceChangeTimestamps`: Array of last change time per face for cooldown
- `COOLDOWN_MS`: Constant (3000ms) preventing excessive changes

#### Edge Cases Handled
- **Initial load**: Faces start visible but won't change until they transition from invisible to visible
- **Cooldown**: Rapidly rotating same face in/out won't trigger multiple changes
- **Multiple faces**: Can change multiple faces simultaneously when they become visible
- **Async loading**: Texture loading is non-blocking with Promise-based approach

### Showcase Mode

Showcase mode provides automated face presentation with custom sequences, allowing the cube to smoothly rotate through predefined faces.

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

#### Implementation Details

**Face Rotation Calculator** (`src/components/MagicCube.vue:193-206`):
```typescript
function calculateRotationForFace(faceIndex: number): THREE.Quaternion {
  if (!cube) return new THREE.Quaternion()

  // Get target face's normal
  const targetNormal = faceNormals[faceIndex].clone()

  // Camera direction: camera at (0, 0, z) looking at origin
  // Direction from camera to scene is (0, 0, -1)
  const cameraDirection = new THREE.Vector3(0, 0, -1)

  // Calculate quaternion to align face normal with camera direction
  const rotation = new THREE.Quaternion()
  rotation.setFromUnitVectors(targetNormal, cameraDirection)

  return rotation
}
```

**Animation Loop Integration** (`src/components/MagicCube.vue:423-445`):
- Runs after drag/momentum logic (showcase takes precedence)
- Checks time elapsed since last face change
- Advances to next face in sequence when duration expires
- Handles sequence looping (repeats if `loop: true`, stops if `false`)
- Uses slerp interpolation for smooth rotation to target face
- Updates `targetQuaternion` to prevent snap-back

**Public API** (`src/components/MagicCube.vue:502-526`):
- `startShowcase()`: Manually start showcase mode (emits `showcaseStarted`)
- `stopShowcase()`: Manually stop showcase mode (emits `showcaseStopped`)
- `toggleShowcase()`: Toggle showcase on/off
- `pauseShowcase()`: Pause showcase without stopping (emits `showcasePaused`)
- `resumeShowcase()`: Resume from paused state (emits `showcaseResumed`)
- `isShowcaseActive()`: Returns current showcase active state
- `isShowcasePaused()`: Returns current showcase paused state

**Events:**
- `@showcase-started` - Emitted when showcase mode starts
- `@showcase-stopped` - Emitted when showcase mode stops
- `@showcase-paused` - Emitted when showcase is paused
- `@showcase-resumed` - Emitted when showcase resumes from paused state
- `@showcase-completed` - Emitted when non-looping sequence completes

#### State Management

```typescript
const isShowcaseActive = ref(false)
const isShowcasePaused = ref(false) // Pause state (doesn't advance faces)
const showcaseCurrentIndex = ref(0)  // Index in sequence array
const showcaseAccumulatedTime = ref(0) // Accumulated time using delta time
let lastShowcaseFrameTime = 0 // Last frame time for delta calculation
const showcaseSequence = ref<number[]>([])
const showcaseFaceDuration = ref(3000) // Duration per face (ms)
const showcaseLoop = ref(true) // Loop sequence
const showcaseRotationSpeed = ref(0.02) // Slerp factor for showcase
```

**Timing System:**
- Uses delta time from animation loop (`performance.now()`) for precise timing
- Accumulates time only when showcase is active and not paused
- Avoids timing drift over long sessions
- Resets frame time when showcase stops or pauses to prevent large delta jumps

#### Configuration Constants

- `faceDuration`: 3000ms (3 seconds) default per face
  - Can be set to any value in milliseconds
  - `1000` = 1 second, `2000` = 2 seconds, `5000` = 5 seconds
  - Controls how long cube pauses on each face before rotating to next
- `rotationSpeed`: 0.02 default (lower = smoother, higher = faster)
- `loop`: true default (repeat sequence indefinitely)
- `autoStart`: false default (manual trigger required)

**Sequence Length:**
- **No hard limit** on sequence length
- Can use 1-6 unique faces (cube has 6 faces: 0-5)
- Can repeat faces to create longer sequences: `[0, 2, 4, 0, 2, 4]`
- Examples:
  - `[0, 2, 4]` - 3 faces, repeats every `3 × faceDuration` ms
  - `[0, 1, 2, 3, 4, 5]` - All 6 unique faces, repeats every `6 × faceDuration` ms
  - `[0, 2, 4, 0, 2, 4, 0, 2, 4]` - 9 faces with repetitions, creates longer cycle
- Total cycle time = `sequence.length × faceDuration` milliseconds

#### Usage Example

```vue
<template>
  <MagicCube
    ref="cubeRef"
    :images="images"
    :showcase-mode="{
      enabled: true,
      sequence: [0, 2, 4, 5],  // Show right, top, front, back
      faceDuration: 3000,        // 3 seconds per face
      autoStart: false,          // Manual trigger
      loop: true,                // Repeat sequence
      rotationSpeed: 0.02        // Smooth rotation
    }"
    @showcase-started="isShowcaseRunning = true"
    @showcase-stopped="isShowcaseRunning = false"
    @showcase-paused="isShowcasePaused = true"
    @showcase-resumed="isShowcasePaused = false"
    @showcase-completed="isShowcaseRunning = false"
  />

  <button @click="toggleShowcase">
    {{ isShowcaseRunning ? 'Stop' : 'Start' }} Showcase
  </button>

  <button v-if="isShowcaseRunning" @click="togglePause">
    {{ isShowcasePaused ? 'Resume' : 'Pause' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MagicCube from './components/MagicCube.vue'

const cubeRef = ref<InstanceType<typeof MagicCube>>()
const isShowcaseRunning = ref(false)
const isShowcasePaused = ref(false)

function toggleShowcase() {
  if (!cubeRef.value) return
  cubeRef.value.toggleShowcase()
}

function togglePause() {
  if (!cubeRef.value) return
  if (isShowcasePaused.value) {
    cubeRef.value.resumeShowcase()
  } else {
    cubeRef.value.pauseShowcase()
  }
}
</script>
```

**Timing Examples:**

```vue
<!-- Fast presentation - 1 second per face -->
:showcase-mode="{
  enabled: true,
  sequence: [0, 2, 4],
  faceDuration: 1000,    // 1 second × 3 faces = 3 second cycle
  loop: true
}"

<!-- Standard presentation - 2 seconds per face -->
:showcase-mode="{
  enabled: true,
  sequence: [0, 2, 4, 1, 3, 5],
  faceDuration: 2000,    // 2 seconds × 6 faces = 12 second cycle
  loop: true
}"

<!-- Slow viewing - 5 seconds per face -->
:showcase-mode="{
  enabled: true,
  sequence: [0, 2, 4],
  faceDuration: 5000,    // 5 seconds × 3 faces = 15 second cycle
  loop: false            // Stops after one cycle
}"

<!-- Extended sequence with repetitions -->
:showcase-mode="{
  enabled: true,
  sequence: [0, 2, 4, 0, 2, 4, 0, 2, 4],  // 9 faces
  faceDuration: 2000,                        // 2 seconds × 9 = 18 second cycle
  loop: true
}"
```

#### Integration with Existing Systems

- **Image cycling**: Unaffected, continues to use 3s cooldown
- **Face visibility**: Existing `getVisibleFaces()` works during showcase
- **Momentum system**: Bypassed during showcase (showcase takes precedence)
- **HUD updates**: Continue normally, shows current rotation with "SHOWCASE" status indicator
  - Shows "SHOWCASE (PAUSED)" when showcase is active but paused
  - Shows "SHOWCASE" when showcase is actively running
- **User interaction**: Showcase continues uninterrupted through drag events (continuous mode)

**Pause Functionality:**
- Pause stops time accumulation but keeps showcase active
- Cube remains on current face while paused
- Resume continues from where it left off (doesn't reset to beginning)
- Useful for examining a specific face before sequence continues

#### Edge Cases Handled

1. **Empty sequence**: If `sequence: []`, showcase mode logs warning and doesn't activate
2. **Invalid face numbers**: If sequence contains numbers > 5 or < 0, logs error and doesn't activate
3. **Single face**: If `sequence: [2]`, cube rotates to face 2 and stops (if not looping)
4. **Sequence length**: No hard limit - can be any length from 1 to hundreds of items
   - Short sequences: `[0, 2]` - 2 faces
   - All unique faces: `[0, 1, 2, 3, 4, 5]` - 6 faces (maximum unique)
   - With repetitions: `[0, 2, 4, 0, 2, 4, 0, 2, 4]` - 9+ faces, any length
5. **Camera distance**: Calculation works for both mobile (4.5) and desktop (3) distances
6. **Showcase not enabled**: Public methods log warnings if `showcaseMode.enabled` is false
7. **Pause/Resume**: Can only pause when active, can only resume when paused
8. **Component unmount**: No special cleanup needed (uses Vue refs, no timers)

**Timing Precision:**
- Uses `performance.now()` with delta time accumulation instead of `Date.now()`
- Eliminates timing drift over long sessions
- Properly handles pause/resume without accumulating time while paused
- Resets frame time on stop/pause to prevent large delta jumps on restart

### Code Review Improvements

Following the initial implementation, a comprehensive code review identified and fixed several important and minor issues:

#### Important Fixes

**1. Race Condition Prevention** (`src/components/MagicCube.vue:207-214`)
- Added guard checks in `showcaseTargetFace` computed property
- Prevents accessing empty sequences or inactive showcase state
- Returns explicit fallback (face 0) with clear documentation
- Eliminates potential null access during non-looping sequence completion

**2. Timing Precision Enhancement** (`src/components/MagicCube.vue:513-545`)
- Replaced `Date.now()` timestamps with `performance.now()` delta time
- Prevents timing drift over long showcase sessions (hours)
- Accumulates time only when showcase is active and not paused
- Resets `lastShowcaseFrameTime` on stop/pause to prevent large delta jumps
- Ensures consistent face duration regardless of frame rate variations

#### Minor Enhancements

**3. Production Logging** (`src/components/MagicCube.vue:186`)
- Added `DEBUG` environment check: `const DEBUG = import.meta.env.DEV`
- All console logs now only appear in development mode
- Production builds run silently without console clutter
- Includes showcase start/stop/pause/resume/completion messages

**4. Event System** (`src/components/MagicCube.vue:130-136, 818-828, 838-843`)
- Five events emitted for reactive state tracking:
  - `showcaseStarted` - When showcase begins
  - `showcaseStopped` - When showcase stops
  - `showcasePaused` - When showcase is paused
  - `showcaseResumed` - When showcase resumes from pause
  - `showcaseCompleted` - When non-looping sequence finishes
- Parent components can react to state changes without polling
- Example in `App.vue` shows event-based button state management

**5. Pause/Resume Functionality** (`src/components/MagicCube.vue:648-668`)
- `pauseShowcase()` - Stops time accumulation, keeps current face visible
- `resumeShowcase()` - Continues from current position (no reset)
- `isShowcasePaused` state tracks pause status
- HUD displays "SHOWCASE (PAUSED)" when paused
- Ideal for examining specific faces during showcase

**6. JSDoc Documentation** (`src/components/MagicCube.vue:619-668`)
- Complete JSDoc comments for all public API methods
- Documents parameters, return values, and emitted events
- Improves IDE autocomplete experience
- `@throws` tags document error conditions
- `@emits` tags document side effects

**7. HUD Status Enhancement** (`src/components/MagicCube.vue:62-73`)
- System status now shows "SHOWCASE" when showcase is running
- Shows "SHOWCASE (PAUSED)" when showcase is paused
- Uses amber color (`hud-value--warn`) for showcase mode
- Clear visual feedback for all showcase states

## TypeScript Configuration

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- Bundler mode for Vite compatibility
- JSX preserved (for Vue)

### Material Reordering & Image Distribution (Phase 2.85)

#### Problem 1: Images Displaying in Wrong Order

**Issue**: Images displayed as [2,1,4,3,6,5] instead of [1,2,3,4,5,6] on faces [0,1,2,3,4,5].

**Root Cause**: Three.js BoxGeometry assigns materials array to faces in a specific internal order that doesn't match sequential expectations.

**Three.js Face Order**:
- Face 0 (right +X) gets materials[0]
- Face 1 (left -X) gets materials[1]
- Face 2 (top +Y) gets materials[2]
- Face 3 (bottom -Y) gets materials[3]
- Face 4 (front +Z) gets materials[4]
- Face 5 (back -Z) gets materials[5]

**Solution**: Reorder materials array before creating cube:
```typescript
const reorderedMaterials = [
  materials[1], // Face 0: image 2
  materials[0], // Face 1: image 1
  materials[3], // Face 2: image 4
  materials[2], // Face 3: image 3
  materials[5], // Face 4: image 6
  materials[4], // Face 5: image 5
]
cube = new THREE.Mesh(geometry, reorderedMaterials)
```

This ensures sequential images [1,2,3,4,5,6] display on faces [0,1,2,3,4,5].

#### Problem 2: Uneven Image Distribution

**Issue**: Certain images appeared more frequently than others when faces cycled.

**Root Cause**: `faceImageIndices` was initialized to swapped values [1,0,3,2,5,4] to match material reordering. When faces cycled, they started from different offsets causing uneven distribution.

**Example**:
- Face 0 started at image 1, cycled: 1→2→3→4→5→6→7→8→9→10→11→0→**1** (image 1 appears every 12 cycles)
- Face 1 started at image 0, cycled: 0→1→2→3→4→5→6→7→8→9→10→**11**→0 (image 11 appears every 12 cycles)

This created a mismatch where some images appeared more often.

**Solution**: Initialize `faceImageIndices` to sequential [0,1,2,3,4,5]:
```typescript
let faceImageIndices = [0, 1, 2, 3, 4, 5] // Each face starts at different image
```

Each face now cycles starting from its own offset, ensuring even distribution across all images.

#### Problem 3: Showcase Mode Skipped Face Never Updated

**Issue**: When showcase mode transitioned F5→F0, F4 was skipped and never updated with new cycle's images.

**Root Cause**: Original code had pending update for F5, but F5 was already updated immediately during pre-load. F4 (the skipped face) had no update mechanism.

**Flow**:
1. Transition F5→F0 starts
2. Pre-load next cycle's images, skip F4
3. F5 updated immediately
4. F4 skipped, keeps old image
5. F4 never updated (stuck with old image)

**Solution**: Add pending update for F4 (skipped face):
```typescript
// During pre-load
const faceToSkip = Math.max(0, lastFaceInSequence - 1) // Skip F4
assignImagesToFacesForShowcase(faceToSkip)
pendingSkippedFaceUpdate = faceToSkip

// In animation loop when F0 aligns
if (pendingSkippedFaceUpdate !== null && alignment >= 0.999) {
  const skippedFace = pendingSkippedFaceUpdate
  // Update F4 with correct image from new cycle
  loadCroppedTexture(props.images[imageIndex], {...})
    .then((texture) => {
      material.map = texture
      faceImageIndices[skippedFace] = logicalImageIndex
    })
  pendingSkippedFaceUpdate = null
}
```

This ensures F4 gets updated when F0 is aligned, preventing visual glitches.

#### Translation Table for Showcase Mode

Since materials are reordered but `faceImageIndices` tracks logical sequence, showcase mode uses translation:

```typescript
const translateIndex = (i: number) => (i % 2 === 0 ? i + 1 : i - 1)

// For face i, calculate logical image and actual image to load
const logicalImageIndex = (showcaseImageOffset + i) % imageCount
const imageIndex = (showcaseImageOffset + translateIndex(i)) % imageCount

// Track logical index, but load from translated material index
faceImageIndices[i] = logicalImageIndex
loadCroppedTexture(props.images[imageIndex], {...})
```

This separates logical tracking from physical material loading, ensuring both showcase mode and face cycling work correctly.
