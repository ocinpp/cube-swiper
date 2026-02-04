# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **3D holographic image viewer** built with Vue 3, Three.js, and TypeScript. Users can freely drag to rotate a 3D cube that displays images on its faces. As faces become visible to the camera, they automatically cycle to new images with a smart cooldown system. The UI features a holographic sci-fi aesthetic with purple/cyan color scheme.

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`) and TypeScript
- **Three.js** for 3D rendering and cube manipulation
- **Vite** for build tooling
- **Tailwind CSS** for styling with custom holographic color theme
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
- Three colored point lights (purple, cyan, pink) for holographic effect
- `LineSegments` with `EdgesGeometry` for glowing cube edges with pulsing opacity
- Initial rotation is angled (-15°, -25°) to show 3D depth
- Drag sensitivity: 0.3 multiplier on drag delta for rotation

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
