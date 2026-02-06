<template>
  <div class="w-full h-dvh overflow-hidden">
    <!-- Default behavior: center-crop non-square images to prevent distortion -->
    <MagicCube :images="sampleImages" />

    <!-- Optional: Configure cropping strategy
    <MagicCube
      :images="sampleImages"
      crop-strategy="contain"
      :crop-size="2048"
    />
    -->
  </div>
</template>

<script setup lang="ts">
import MagicCube from './components/MagicCube.vue'

// Auto-load all images from src/assets/images directory
// Supports: jpg, jpeg, png, webp, gif, svg
const imageModules = import.meta.glob<{ default: string }>(
  './assets/images/*.{jpg,jpeg,png,webp,gif,svg}',
  { eager: true }
)

// Extract URLs from imported modules and sort for consistency
const sampleImages = Object.values(imageModules)
  .map((mod) => mod.default)
  .sort()

// Debug logging
console.log('📸 Images loaded:', sampleImages.length)
console.log('Image URLs:', sampleImages)

// Fallback to demo images if no local images found
if (sampleImages.length === 0) {
  console.warn('No images found in src/assets/images - using Unsplash demos')
  sampleImages.push(
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80'
  )
}
</script>
