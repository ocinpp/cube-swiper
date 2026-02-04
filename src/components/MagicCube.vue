<template>
  <div ref="container" class="w-full h-full cyber-bg relative">
    <!-- Calibration Ring SVG -->
    <div class="calibration-ring">
      <svg viewBox="0 0 400 400">
        <!-- Outer ring -->
        <circle
          cx="200"
          cy="200"
          r="190"
          class="cal-ring-outer"
        />
        <!-- Inner ring with calibration marks -->
        <circle
          cx="200"
          cy="200"
          r="170"
          class="cal-ring-marks"
          stroke-dasharray="2 8"
        />
        <!-- Degree markers -->
        <g class="cal-degree">
          <text x="200" y="25" text-anchor="middle">0°</text>
          <text x="375" y="204" text-anchor="middle">90°</text>
          <text x="200" y="385" text-anchor="middle">180°</text>
          <text x="25" y="204" text-anchor="middle">270°</text>
        </g>
        <!-- Rotating element synced with cube -->
        <g class="cal-rotator" :style="{ transform: `rotate(${currentRotationY}deg)` }">
          <line
            x1="200"
            y1="10"
            x2="200"
            y2="30"
            :stroke="isDragging ? 'var(--color-amber)' : 'var(--color-cyan-dim)'"
            stroke-width="2"
          />
          <circle
            cx="200"
            cy="20"
            r="3"
            :fill="isDragging ? 'var(--color-amber)' : 'var(--color-cyan-dim)'"
          />
        </g>
        <!-- Active sector indicator -->
        <path
          class="cal-sector"
          :style="{ opacity: isDragging ? 1 : 0 }"
          d="M 200 10 A 190 190 0 0 1 390 200"
        />
      </svg>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-indicator">
        <div class="loading-spinner"></div>
        <span class="loading-text">Initializing</span>
      </div>
    </div>

    <!-- Canvas container -->
    <canvas ref="canvas" class="w-full h-full block"></canvas>

    <!-- HUD: Top Left - Title -->
    <div class="hud-panel hud-panel--top-left">
      <h1 class="hud-title">CHRONO CUBE</h1>
      <div class="hud-subtitle">Image Viewer v1.0</div>
      <div class="hud-divider"></div>
      <div class="hud-label">System Status</div>
      <div class="hud-value" :class="isDragging ? 'hud-value--warn' : 'hud-value--accent'">
        {{ isDragging ? 'MANUAL OVERRIDE' : 'ACTIVE' }}
      </div>
    </div>

    <!-- HUD: Top Right - Coordinates -->
    <div class="hud-panel hud-panel--top-right">
      <div class="hud-label">Rotation</div>
      <div class="hud-value">
        X: <span class="hud-value--accent">{{ formatRotation(displayedRotationX) }}°</span>
      </div>
      <div class="hud-value">
        Y: <span class="hud-value--accent">{{ formatRotation(displayedRotationY) }}°</span>
      </div>
      <div class="hud-divider hud-divider--right"></div>
      <div class="hud-label">Visible Faces</div>
      <div class="hud-value hud-value--accent">
        <span v-for="(face, index) in visibleFaceNumbers" :key="face">
          F{{ face }}<span v-if="index < visibleFaceNumbers.length - 1">, </span>
        </span>
      </div>
    </div>

    <!-- HUD: Bottom Left - Controls -->
    <div class="hud-panel hud-panel--bottom-left" v-if="!hasInteracted">
      <div class="hud-label">Control Mode</div>
      <div class="hud-value">DRAG TO ROTATE</div>
    </div>

    <!-- HUD: Bottom Right - Frame Info -->
    <div class="hud-panel hud-panel--bottom-right">
      <div class="hud-label">Frame</div>
      <div class="hud-value">{{ frameCounter }}</div>
      <div class="hud-divider hud-divider--right"></div>
      <div class="hud-label">Image Cycle</div>
      <div class="hud-value hud-value--warn">{{ totalImageCycles }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { useCubeNavigation } from '../composables/useCubeNavigation'

interface Props {
  images: string[]
}

const props = defineProps<Props>()

const container = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const isLoading = ref(true)
const hasInteracted = ref(false)

// HUD State
const frameCounter = ref(0)
const visibleFaceCount = ref(0)
const visibleFaceNumbers = ref<number[]>([])
const totalImageCycles = ref(0)

// Throttled update state for idle mode
let lastThrottledUpdate = 0
const THROTTLE_MS = 100 // Update 10x per second when idle
const displayedRotationX = ref(0)
const displayedRotationY = ref(0)

// Three.js variables
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let cube: THREE.Mesh
let edges: THREE.LineSegments
let targetRotationX = 0
let targetRotationY = 0
let currentRotationX = 0
let currentRotationY = 0
let animationFrameId: number

// Face visibility tracking
const faceNormals = [
  new THREE.Vector3(1, 0, 0),   // right (+X)
  new THREE.Vector3(-1, 0, 0),  // left (-X)
  new THREE.Vector3(0, 1, 0),   // top (+Y)
  new THREE.Vector3(0, -1, 0),  // bottom (-Y)
  new THREE.Vector3(0, 0, 1),   // front (+Z)
  new THREE.Vector3(0, 0, -1),  // back (-Z)
]
let previouslyVisibleFaces = new Set<number>()
let faceImageIndices = [0, 1, 2, 3, 4, 5] // Initially mapped 1:1
let faceChangeTimestamps = [0, 0, 0, 0, 0, 0]
const COOLDOWN_MS = 3000 // 3 seconds

// HUD Helper Functions
function formatRotation(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  return normalized.toFixed(1)
}

const initThreeJS = async () => {
  if (!canvas.value || !container.value) return

  // Scene setup
  scene = new THREE.Scene()

  // Camera setup - adjust distance based on screen width for mobile
  const aspect = container.value.clientWidth / container.value.clientHeight
  const isMobile = container.value.clientWidth < 768
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.z = isMobile ? 4.5 : 3

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Load textures with error handling
  const textureLoader = new THREE.TextureLoader()
  const textures = await Promise.all(
    props.images.map((url, index) => {
      return new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
          url,
          (texture) => resolve(texture),
          undefined,
          (error) => {
            console.error(`Failed to load texture at index ${index} (${url}):`, error)
            reject(error)
          }
        )
      })
    })
  ).catch((error) => {
    console.error('Critical: Failed to load required textures:', error)
    throw error
  })

  // Create materials for each face - brighter, less dark
  const materials = textures.map((texture) => {
    return new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: false,
      opacity: 1,
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      side: THREE.FrontSide,
    })
  })

  // Create cube geometry
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  cube = new THREE.Mesh(geometry, materials)
  scene.add(cube)

  // Add holographic edges
  const edgesGeometry = new THREE.EdgesGeometry(geometry)
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0x00d4ff, // Cyan
    transparent: true,
    opacity: 0.6,
  })
  edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  cube.add(edges)

  // Add lighting - brighter for better visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0xff9500, 1, 10) // Amber
  pointLight1.position.set(2, 2, 2)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x00d4ff, 0.8, 10) // Cyan
  pointLight2.position.set(-2, -2, 2)
  scene.add(pointLight2)

  const pointLight3 = new THREE.PointLight(0xff9500, 0.6, 10) // Amber
  pointLight3.position.set(0, 0, -2)
  scene.add(pointLight3)

  // Set initial rotation to show 3D effect
  targetRotationX = -15
  targetRotationY = -25
  currentRotationX = -15
  currentRotationY = -25

  // Start animation loop
  animate()

  isLoading.value = false
}

// Check which faces are currently visible to the camera
function getVisibleFaces(): Set<number> {
  const visible = new Set<number>()

  // Defensive null checks
  if (!camera || !cube) {
    console.warn('getVisibleFaces called before camera or cube initialized')
    return visible
  }

  const cameraDirection = new THREE.Vector3()
  camera.getWorldDirection(cameraDirection) // Points from camera to scene

  for (let i = 0; i < 6; i++) {
    const worldNormal = faceNormals[i].clone()
    worldNormal.applyQuaternion(cube.quaternion)
    worldNormal.normalize()

    // Dot product > 0 means face is pointing toward camera
    if (worldNormal.dot(cameraDirection) > 0) {
      visible.add(i)
    }
  }
  return visible
}

// Update texture for a specific face
async function updateFaceTexture(faceIndex: number, imageIndex: number): Promise<void> {
  if (!cube || !props.images[imageIndex]) {
    console.error(`Invalid texture update request: face ${faceIndex}, image ${imageIndex}`)
    return
  }

  try {
    const textureLoader = new THREE.TextureLoader()
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(props.images[imageIndex], resolve, undefined, reject)
    })

    // Update the material's map (cube.material is an array of 6 materials)
    const materials = cube.material as THREE.MeshPhysicalMaterial[]
    const material = materials[faceIndex]

    // Dispose old texture to prevent memory leak
    if (material.map) {
      material.map.dispose()
    }

    material.map = texture
    material.needsUpdate = true
  } catch (error) {
    console.error(`Failed to load texture for face ${faceIndex} (image ${imageIndex}):`, error)
  }
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  // Update frame counter
  frameCounter.value++

  // Smooth rotation interpolation
  currentRotationX += (targetRotationX - currentRotationX) * 0.08
  currentRotationY += (targetRotationY - currentRotationY) * 0.08

  // Apply rotation
  if (cube) {
    // Add drag rotation offset for real-time feedback (both X and Y axes)
    const dragOffsetX = isDragging.value ? dragDeltaY.value * 0.3 : 0  // Vertical drag rotates around X
    const dragOffsetY = isDragging.value ? dragDeltaX.value * 0.3 : 0  // Horizontal drag rotates around Y
    cube.rotation.x = THREE.MathUtils.degToRad(currentRotationX + dragOffsetX)
    cube.rotation.y = THREE.MathUtils.degToRad(currentRotationY + dragOffsetY)

    // Add subtle floating animation
    cube.position.y = Math.sin(Date.now() * 0.001) * 0.05

    // Pulse the edge glow
    if (edges) {
      const pulseOpacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.2
      ;(edges.material as THREE.LineBasicMaterial).opacity = pulseOpacity
    }
  }

  // Check for newly visible faces and update their images
  if (cube && camera) {
    const nowVisibleFaces = getVisibleFaces()
    const now = Date.now()

    // Hybrid HUD update strategy
    if (isDragging.value) {
      // During drag: Real-time updates for immediate feedback
      displayedRotationX.value = currentRotationX + (isDragging.value ? dragDeltaY.value * 0.3 : 0)
      displayedRotationY.value = currentRotationY + (isDragging.value ? dragDeltaX.value * 0.3 : 0)
      visibleFaceCount.value = nowVisibleFaces.size
      visibleFaceNumbers.value = Array.from(nowVisibleFaces).sort((a, b) => a - b)
    } else {
      // When idle: Throttled updates (10fps) for readability
      if (now - lastThrottledUpdate > THROTTLE_MS) {
        displayedRotationX.value = currentRotationX
        displayedRotationY.value = currentRotationY
        visibleFaceCount.value = nowVisibleFaces.size
        visibleFaceNumbers.value = Array.from(nowVisibleFaces).sort((a, b) => a - b)
        lastThrottledUpdate = now
      }
    }

    for (const faceIndex of nowVisibleFaces) {
      // Skip if was already visible
      if (previouslyVisibleFaces.has(faceIndex)) continue

      // Check cooldown
      if (now - faceChangeTimestamps[faceIndex] < COOLDOWN_MS) continue

      // Get next image index (cycle through all images)
      faceImageIndices[faceIndex] = (faceImageIndices[faceIndex] + 1) % props.images.length

      // Update texture
      updateFaceTexture(faceIndex, faceImageIndices[faceIndex])

      // Update timestamp
      faceChangeTimestamps[faceIndex] = now

      // Increment total cycle counter for HUD
      totalImageCycles.value++
    }

    // Update previous visibility
    previouslyVisibleFaces = nowVisibleFaces
  }

  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!container.value || !camera || !renderer) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
}

// Use navigation composable for drag tracking only (no navigation)
const { dragDeltaX, dragDeltaY, isDragging } = useCubeNavigation(
  props.images.length,
  () => {} // No-op callback - navigation disabled
)

// Watch for drag state changes
watch(isDragging, (dragging, wasDragging) => {
  if (dragging && !wasDragging) {
    // Drag started
    hasInteracted.value = true
  } else if (wasDragging && !dragging && cube) {
    // Drag ended - capture the current cube rotation as the new target
    targetRotationX = THREE.MathUtils.radToDeg(cube.rotation.x)
    targetRotationY = THREE.MathUtils.radToDeg(cube.rotation.y)
    currentRotationX = targetRotationX
    currentRotationY = targetRotationY
  }
})

onMounted(async () => {
  await initThreeJS()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  // Dispose of cube resources
  if (cube) {
    const materials = cube.material as THREE.MeshPhysicalMaterial[]
    materials.forEach((material) => {
      if (material.map) {
        material.map.dispose()
      }
      material.dispose()
    })
    cube.geometry.dispose()
  }

  // Dispose of edge resources
  if (edges) {
    edges.geometry.dispose()
    ;(edges.material as THREE.Material).dispose()
  }

  // Dispose of renderer
  if (renderer) {
    renderer.dispose()
  }
})
</script>
