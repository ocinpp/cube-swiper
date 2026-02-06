# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **3D image viewer with a cyber-chronometer aesthetic** built with Vue 3, Three.js, and TypeScript. Users can freely drag to rotate a 3D cube that displays images on its faces. As faces become visible to the camera, they automatically cycle to new images with a smart cooldown system. **Non-square images are automatically center-cropped to prevent distortion**. The UI features an industrial luxury design inspired by precision timekeeping instruments, combining elegant serif typography with technical monospace data readouts.

### Production Readiness

**Current Status: 98% Production Ready**

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

**Remaining Enhancements (Phase 3):**
- Accessibility improvements (ARIA, keyboard nav)
- Performance optimizations (reduce object allocation)
- Code quality (extract magic numbers)

### Aesthetic Vision

**Design Direction**: Cyber-Chronometer - precision instrumentation meets neon-noir
- **Colors**: Deep obsidian void (#0a0a0c) with amber warning lights (#ff9500) and electric cyan data displays (#00d4ff)
- **Typography**: Dual system - Playfair Display (elegant serif) for titles, JetBrains Mono (technical monospace) for data
- **Atmosphere**: Subtle grid overlay, radial vignette, and mechanical calibration ring
- **Differentiation**: Instead of generic "holographic purple," this feels like operating specialized equipment - technical, purposeful, with satisfying mechanical feedback

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
```

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
- Amber/cyan color scheme (0xff9500, 0x00d4ff) for lighting and cube edges
- Smooth rotation interpolation using lerp (0.08 factor) in the animation loop
- Real-time drag feedback: applies drag offset during interaction
- On drag release: captures current cube rotation as new target (prevents snap-back)
- Subtle animations: floating (sinusoidal y-position) and pulsing edge glow

**src/composables/useCubeNavigation.ts** - Gesture handling composable:
- Global pointer event listeners (not bound to specific element)
- Tracks `dragDeltaX`, `dragDeltaY`, and `isDragging` state
- Navigation callback is currently a no-op (free rotation only)
- Used for drag tracking - could be extended to add swipe gestures later

### Three.js Configuration Details

- Camera distance adjusts for mobile (4.5) vs desktop (3)
- Uses `MeshPhysicalMaterial` for realistic lighting with clearcoat
- Three colored point lights (amber, cyan, amber) for cyber-chronometer effect
- `LineSegments` with `EdgesGeometry` for glowing cube edges in cyan (#00d4ff)
- Initial rotation is angled (-15°, -25°) to show 3D depth
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
- `--color-void`: #0a0a0c (background)
- `--color-amber`: #ff9500 (warnings, highlights)
- `--color-cyan`: #00d4ff (data, accents)
- `--color-white`: #f5f5f7 (primary text)
- `--color-gray`: #8a8a93 (secondary text)

**Typography**:
- `--font-serif`: Playfair Display (titles, 24px, 600 weight)
- `--font-mono`: JetBrains Mono (data readouts, 13px, 400 weight)

**UI Components**:
- `.hud-panel`: Semi-transparent panels with gradient backgrounds and colored border accents
- `.calibration-ring`: SVG-based circular indicator with degree markers and rotating element
- `.loading-spinner`: Dual-ring mechanical spinner with counter-rotating amber/cyan rings

**Animations**:
- `--transition-mechanical`: 500ms cubic-bezier(0.2, 0.8, 0.2, 1) for calibration ring
- `--transition-smooth`: 300ms cubic-bezier(0.4, 0, 0.2, 1) for UI elements
- Grid overlay: 80px × 80px with 3% opacity
- Radial vignette focusing attention on center

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
  const materials = cube.material as THREE.MeshPhysicalMaterial[]
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
3. Cube quaternion smoothly interpolates to target using `slerp()` with `SLERP_FACTOR` (0.08)
4. On pointer up → current cube quaternion becomes new target quaternion (using `clone()`)
5. No snap-back: orientation persists smoothly after drag release

**Why Quaternions?**
- **Consistent behavior**: Rotation direction is always relative to camera/screen, not cube orientation
- **No gimbal lock**: Quaternions avoid the gimbal lock issues inherent with Euler angles
- **Smooth interpolation**: Slerp provides natural, smooth rotation transitions
- **Intuitive UX**: When cube is upside down, right swipe still moves faces right on screen

**Implementation** (`src/components/MagicCube.vue:354-368`):
```typescript
// Rotation configuration constants
const DRAG_SENSITIVITY = 0.3
const SLERP_FACTOR = 0.08
const DEG_TO_RAD = Math.PI / 180

// World axes for camera-relative rotation
const worldUpAxis = new THREE.Vector3(0, 1, 0) // Rotation around Y moves faces horizontally
const worldRightAxis = new THREE.Vector3(1, 0, 0) // Rotation around X moves faces vertically

// Apply drag offset using world axes
rotationHelper.quaternion.copy(targetQuaternion)
rotationHelper.rotateOnWorldAxis(worldRightAxis, dragXRotation)
rotationHelper.rotateOnWorldAxis(worldUpAxis, dragYRotation)

// Smooth interpolation
cube.quaternion.slerp(rotationHelper.quaternion, SLERP_FACTOR)
```

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

## TypeScript Configuration

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- Bundler mode for Vite compatibility
- JSX preserved (for Vue)
