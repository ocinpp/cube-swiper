# Magic Cube - Holographic 3D Image Viewer

An interactive 3D holographic cube that displays images on its faces. Drag to rotate the cube freely in any direction and watch as faces dynamically change images when they come into view.

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![Three.js](https://img.shields.io/badge/Three.js-0.170-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript)

## Features

- **Free Rotation**: Drag to rotate the cube in any direction - no constrained angles
- **Dynamic Face Changes**: Images cycle automatically when faces become visible to the camera
- **Smart Cooldown System**: 3-second cooldown prevents excessive changes during rapid rotation
- **Holographic Aesthetic**: Purple/cyan color scheme with glowing edges and pulsing effects
- **Smooth Animations**: Floating animation and interpolated rotation for a fluid experience
- **Responsive**: Optimized camera distance for mobile and desktop
- **Touch Friendly**: Works with mouse and touch input

## Tech Stack

- **Vue 3** with Composition API and TypeScript
- **Three.js** for 3D rendering
- **Vite** for fast development
- **Tailwind CSS** for styling

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
  <MagicCube :images="imageUrls" />
</template>

<script setup lang="ts">
import MagicCube from './components/MagicCube.vue'

const imageUrls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  // ... up to 6 images
]
</script>
```

## Controls

- **Drag**: Rotate the cube freely in any direction
- The cube displays images on all 6 faces
- **Face images change automatically** when they transition from off-view to on-view
- Each face cycles through the provided image array independently
- A 3-second cooldown prevents changes during rapid rotation
- Release to maintain the current rotation angle
