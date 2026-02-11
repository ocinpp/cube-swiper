<template>
  <div class="w-full h-dvh overflow-hidden">
    <!-- Showcase mode example: custom face sequence with control button -->
    <MagicCube
      ref="cubeRef"
      :images="sampleImages"
      :showcase-mode="{
        enabled: true,
        sequence: [0, 1, 2, 3, 4, 5],
        faceDuration: 4000,
        autoStart: false,
        loop: true,
        rotationSpeed: 0.02,
      }"
      @showcase-started="onShowcaseStarted"
      @showcase-stopped="onShowcaseStopped"
      @showcase-completed="onShowcaseCompleted"
    />

    <!-- Controls container -->
    <div
      class="fixed left-1/2 -translate-x-1/2 z-50 md:bottom-8 bottom-16 flex flex-col items-center gap-3"
    >
      <!-- Showcase control button -->
      <button
        @click="toggleShowcase"
        class="px-5 py-2 rounded-md font-mono text-xs tracking-wider transition-all duration-300 border"
        :class="
          isShowcaseRunning
            ? 'bg-[#e8c4c4]/40 text-[#d4a5a5] border-[#d4a5a5]/50 hover:bg-[#e8c4c4]/50'
            : 'bg-[#a8c4a8]/40 text-[#8fa88f] border-[#8fa88f]/50 hover:bg-[#a8c4a8]/50'
        "
      >
        {{ isShowcaseRunning ? '⏹ Stop' : '▶ Start' }}
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
