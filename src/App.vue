<template>
  <div class="w-full h-dvh overflow-hidden">
    <!-- Showcase mode example: custom face sequence with control button -->
    <MagicCube
      ref="cubeRef"
      :images="sampleImages"
      :showcase-mode="{
        enabled: true,
        sequence: [0, 2, 4, 5],
        faceDuration: 3000,
        autoStart: false,
        loop: true,
        rotationSpeed: 0.02
      }"
      @showcase-started="onShowcaseStarted"
      @showcase-stopped="onShowcaseStopped"
      @showcase-completed="onShowcaseCompleted"
    />

    <!-- Showcase control button -->
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <button
        @click="toggleShowcase"
        class="px-6 py-3 rounded-lg font-mono text-sm tracking-wider transition-all duration-300"
        :class="
          isShowcaseRunning
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30'
            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30'
        "
      >
        {{ isShowcaseRunning ? '⏹ Stop Showcase' : '▶ Start Showcase' }}
      </button>
    </div>

    <!-- Default behavior: center-crop non-square images to prevent distortion
    <MagicCube :images="sampleImages" />
    -->

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
import { ref } from 'vue'
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

// Showcase control
const cubeRef = ref<InstanceType<typeof MagicCube>>()
const isShowcaseRunning = ref(false)

function toggleShowcase() {
  if (!cubeRef.value) return
  cubeRef.value.toggleShowcase()
}

function onShowcaseStarted() {
  isShowcaseRunning.value = true
  console.log('Showcase started')
}

function onShowcaseStopped() {
  isShowcaseRunning.value = false
  console.log('Showcase stopped')
}

function onShowcaseCompleted() {
  isShowcaseRunning.value = false
  console.log('Showcase completed (non-looping)')
}
</script>
