<template>
  <div class="w-full h-dvh overflow-hidden">
    <MagicCube :images="sampleImages" />
  </div>
</template>

<script setup lang="ts">
import MagicCube from './components/MagicCube.vue'

// Sample images from Unsplash for demo - brighter, more vibrant photos
const sampleImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
]
</script>
