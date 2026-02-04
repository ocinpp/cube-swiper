# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **3D image viewer with a cyber-chronometer aesthetic** built with Vue 3, Three.js, and TypeScript. Users can freely drag to rotate a 3D cube that displays images on its faces. As faces become visible to the camera, they automatically cycle to new images with a smart cooldown system. The UI features an industrial luxury design inspired by precision timekeeping instruments, combining elegant serif typography with technical monospace data readouts.

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

## Architecture

### Component Structure

```
App.vue                    # Root component, provides sample images array
└── MagicCube.vue          # Main 3D cube component with Three.js logic
    └── uses: useCubeNavigation()  # Composable for drag tracking
```

### Key Files and Their Purposes

**src/components/MagicCube.vue** - The core component containing:
- Three.js scene setup (scene, camera, renderer, lighting)
- Cube mesh creation with 6 faces, each mapped to an image texture
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

### Free Rotation Logic

1. User drags → `useCubeNavigation` updates `dragDeltaX/Y` and `isDragging`
2. Animation loop applies drag offset in real-time: `rotation = currentRotation + dragOffset * 0.3`
3. On pointer up → watch reads actual cube rotation (`radToDeg(cube.rotation.x/y)`)
4. New rotation becomes target → no snap-back, smooth persistence of angle

**Critical:** When drag ends, we read the cube's actual rotation (which includes the drag offset) and set that as the new target rotation. This preserves the user's rotation instead of snapping back.

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
