<template>
  <div ref="container" class="w-full h-full cyber-bg relative">
    <!-- Calibration Ring SVG -->
    <div class="calibration-ring">
      <svg viewBox="0 0 400 400">
        <!-- Outer ring -->
        <circle cx="200" cy="200" r="190" class="cal-ring-outer" />
        <!-- Inner ring with calibration marks -->
        <circle cx="200" cy="200" r="170" class="cal-ring-marks" stroke-dasharray="2 8" />
        <!-- Degree markers -->
        <g class="cal-degree">
          <text x="200" y="25" text-anchor="middle">0°</text>
          <text x="375" y="204" text-anchor="middle">90°</text>
          <text x="200" y="385" text-anchor="middle">180°</text>
          <text x="25" y="204" text-anchor="middle">270°</text>
        </g>
        <!-- Rotating element synced with cube -->
        <g class="cal-rotator" :style="{ transform: `rotate(${displayedRotationY}deg)` }">
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
        <span class="loading-text"
          >Loading textures... {{ Math.round(loadingProgress * 100) }}%</span
        >
      </div>
    </div>

    <!-- Canvas container -->
    <canvas ref="canvas" class="w-full h-full block"></canvas>

    <!-- HUD: Top Left - Title -->
    <div class="hud-panel hud-panel--top-left">
      <h1 class="hud-title">Cocktail Explorer</h1>
      <div class="hud-subtitle">Image Viewer v1.0</div>
      <div class="hud-divider"></div>
      <div class="hud-label">System Status</div>
      <div
        class="hud-value"
        :class="
          isShowcaseActive
            ? 'hud-value--warn'
            : isDragging
              ? 'hud-value--warn'
              : 'hud-value--accent'
        "
      >
        {{
          isShowcaseActive
            ? isShowcasePaused
              ? 'SHOWCASE (PAUSED)'
              : 'SHOWCASE'
            : isDragging
              ? 'MANUAL OVERRIDE'
              : 'ACTIVE'
        }}
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

    <!-- HUD: Bottom Right - Frame Info (hidden on mobile) -->
    <div class="hud-panel hud-panel--bottom-right hidden md:block">
      <div class="hud-label">Frame</div>
      <div class="hud-value">{{ frameCounter }}</div>
      <div class="hud-divider hud-divider--right"></div>
      <div class="hud-label">Image Cycle</div>
      <div class="hud-value hud-value--warn">{{ totalImageCycles }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { useCubeNavigation } from '../composables/useCubeNavigation'
import { loadCroppedTexture, type CropStrategy } from '../utils/textureCropping'

interface ShowcaseMode {
  enabled: boolean
  sequence: number[]
  faceDuration?: number
  autoStart?: boolean
  loop?: boolean
  rotationSpeed?: number
}

interface Props {
  images: string[]
  cropStrategy?: CropStrategy
  cropSize?: number
  showcaseMode?: ShowcaseMode
}

const props = withDefaults(defineProps<Props>(), {
  cropStrategy: 'cover',
  cropSize: 2048,
  showcaseMode: undefined,
})

// Define emits for showcase state changes
const emit = defineEmits<{
  showcaseStarted: []
  showcaseStopped: []
  showcasePaused: []
  showcaseResumed: []
  showcaseCompleted: [] // For non-looping sequences
}>()

const container = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const isLoading = ref(true)
const loadingProgress = ref(0)
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
let targetQuaternion: THREE.Quaternion
let animationFrameId: number
let particles: THREE.Points
let keyLight: THREE.DirectionalLight
let fillLight: THREE.DirectionalLight

// Aesthetic enhancement constants - soft cocktail palette
const PARTICLE_COUNT = 150 // Fewer, more subtle particles
const PARTICLE_SIZE = 0.025 // Smaller, more delicate
const PARTICLE_SPEED = 0.0003 // Slower, gentler movement
const PARTICLE_COLORS = [0xe8c4c4, 0xa8c4a8, 0xffb6b6] // Rose pink, Mint, Soft watermelon
const EDGE_PULSE_SPEED = 0.001 // Slower pulse
const EDGE_BASE_OPACITY = 0.3 // More subtle
const EDGE_DRAG_OPACITY = 0.5 // Less dramatic
const LIGHT_INTENSITY_IDLE = 0.9
const LIGHT_INTENSITY_DRAG = 1.1
const LIGHT_LERP_SPEED = 0.15
const FOG_DENSITY = 0.0 // No fog - maximum brightness
const FOG_COLOR = 0xf9f6f1 // Match warm cream background

// Rotation configuration constants
const DRAG_SENSITIVITY = 0.3 // Multiplier for drag delta to rotation
const SLERP_FACTOR = 0.08 // Smooth interpolation factor (0-1, higher = faster)
const DEG_TO_RAD = Math.PI / 180 // Conversion factor for degrees to radians
const MOMENTUM_SCALE = 0.12 // Scale factor for momentum (lower for shorter spin)
const MOMENTUM_DECAY = 0.9 // Momentum decay per frame (faster decay)
const MOMENTUM_THRESHOLD = 0.0001 // Stop momentum when below this threshold (radians)
const MOMENTUM_MINIMUM = 0.03 // Minimum rotation to trigger momentum (radians) - prevents slow drags from spinning (~1.7 degrees)

// World axes for camera-relative rotation
// Screen X-axis (horizontal) → World Y-axis rotation (makes things move left/right on screen)
// Screen Y-axis (vertical) → World X-axis rotation (makes things move up/down on screen)
const worldUpAxis = new THREE.Vector3(0, 1, 0) // Rotation around Y moves faces horizontally
const worldRightAxis = new THREE.Vector3(1, 0, 0) // Rotation around X moves faces vertically

// Reusable objects for animation loop (avoid allocation)
const hudEuler = new THREE.Euler()
// NOTE: Euler conversion for display only - can lose precision due to gimbal lock/angle wrapping
// This is acceptable for HUD display since internal orientation uses quaternions
const rotationHelper = new THREE.Object3D()

// Momentum state for realistic swipe decay
let momentumX = 0 // X-axis momentum (radians per frame)
let momentumY = 0 // Y-axis momentum (radians per frame)
let lastDragDeltaX = 0 // Track previous frame to detect if actually moving
let lastDragDeltaY = 0

// Particle system data
let particleVelocities: Float32Array
let edgePulseTime = 0

// Face visibility tracking
const faceNormals = [
  new THREE.Vector3(1, 0, 0), // right (+X)
  new THREE.Vector3(-1, 0, 0), // left (-X)
  new THREE.Vector3(0, 1, 0), // top (+Y)
  new THREE.Vector3(0, -1, 0), // bottom (-Y)
  new THREE.Vector3(0, 0, 1), // front (+Z)
  new THREE.Vector3(0, 0, -1), // back (-Z)
]
let previouslyVisibleFaces = new Set<number>()
let faceImageIndices = [0, 1, 2, 3, 4, 5] // Initially mapped 1:1
let faceChangeTimestamps = [0, 0, 0, 0, 0, 0]
let showcaseImageOffset = 0 // Offset into images array for current showcase cycle
let pendingSkippedFaceUpdate = null as number | null // Track pending update for skipped face (F4)
let pendingUpdateTriggered = false // Prevent duplicate pending updates during rapid rotation
let allPreloadedTextures: THREE.Texture[] = [] // Store all pre-loaded textures for instant swapping
const COOLDOWN_MS = 3000 // 3 seconds

// Translation table: accounts for material reordering when loading images
// Material reordering swaps adjacent pairs: [0↔1, 2↔3, 4↔5]
const translateIndex = (i: number) => (i % 2 === 0 ? i + 1 : i - 1)

// Debug mode check for console logging
const DEBUG = import.meta.env.DEV

// Showcase mode state
const isShowcaseActive = ref(false)
const isShowcasePaused = ref(false) // Pause state for showcase
const showcaseCurrentIndex = ref(0) // Index in sequence array
const showcaseAccumulatedTime = ref(0) // Accumulated time using delta time
let lastShowcaseFrameTime = 0 // Last frame time for delta calculation
const showcaseSequence = ref<number[]>([])
const showcaseFaceDuration = ref(3000) // Duration per face (ms)
const showcaseLoop = ref(true) // Loop sequence
const showcaseRotationSpeed = ref(0.02) // Slerp factor for showcase

// Computed target face for showcase
const showcaseTargetFace = computed(() => {
  // Guard against empty sequences or inactive showcase
  if (!isShowcaseActive.value || showcaseSequence.value.length === 0) {
    return 0 // Fallback to face 0
  }
  return showcaseSequence.value[showcaseCurrentIndex.value]
})

// HUD Helper Functions
function formatRotation(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  return normalized.toFixed(1)
}

// Showcase mode: Assign images to faces for current cycle
function assignImagesToFacesForShowcase(skipFace?: number) {
  const imageCount = props.images.length

  // Assign 6 images to 6 faces based on current offset
  for (let i = 0; i < 6; i++) {
    // Skip the specified face (F4) - will update later when F0 aligns
    if (skipFace === i) continue

    // Calculate the logical image index for this face in the current cycle
    // This is what we track in faceImageIndices and what the face should logically show
    const logicalImageIndex = (showcaseImageOffset + i) % imageCount

    // Calculate the actual image index to load, accounting for material reordering
    // Due to material swap, we need to load from a different index
    const imageIndex = (showcaseImageOffset + translateIndex(i)) % imageCount

    // Skip if this face already has the correct logical image
    if (faceImageIndices[i] === logicalImageIndex) {
      if (DEBUG) console.log(`Face ${i} already has image ${logicalImageIndex}, skipping`)
      continue
    }

    faceImageIndices[i] = logicalImageIndex

    // Update the texture immediately for this face using pre-loaded textures
    if (cube && allPreloadedTextures.length > 0) {
      const materials = cube.material as THREE.MeshBasicMaterial[]
      const material = materials[i]

      // Use pre-loaded texture for instant swapping (no async loading)
      const texture = allPreloadedTextures[imageIndex]

      // Dispose old texture to prevent memory leaks
      if (material.map && material.map !== texture) {
        material.map.dispose()
      }

      material.map = texture
      material.needsUpdate = true
    }
  }

  if (DEBUG) {
    console.log(
      `📷 Assigned images to faces (skipped F${skipFace || 'none'}):`,
      faceImageIndices.map((idx, face) => `F${face}=img${idx}`).join(', ')
    )
    console.log(`   showcaseImageOffset=${showcaseImageOffset}, total images=${imageCount}`)
  }
}

// Showcase mode: Calculate rotation to align face with camera
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

// Initialize particle system
function initParticleSystem(isMobile: boolean) {
  const particleCount = isMobile ? PARTICLE_COUNT / 2 : PARTICLE_COUNT
  const particleSize = isMobile ? PARTICLE_SIZE * 0.7 : PARTICLE_SIZE

  const particlesGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  particleVelocities = new Float32Array(particleCount * 3)

  // Initialize particles in sphere around cube
  for (let i = 0; i < particleCount; i++) {
    // Random position in sphere radius 2-4
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 2 + Math.random() * 2

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // Random velocity
    particleVelocities[i * 3] = (Math.random() - 0.5) * PARTICLE_SPEED
    particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * PARTICLE_SPEED
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_SPEED

    // Random color from palette
    const colorIndex = Math.floor(Math.random() * PARTICLE_COLORS.length)
    const color = new THREE.Color(PARTICLE_COLORS[colorIndex])
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const particlesMaterial = new THREE.PointsMaterial({
    size: particleSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.4, // More subtle
    blending: THREE.NormalBlending, // Less glow
    sizeAttenuation: true,
  })

  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)
}

// Initialize showcase mode from props
function initShowcaseMode() {
  if (!props.showcaseMode || !props.showcaseMode.enabled) {
    return
  }

  // Validate sequence
  if (!props.showcaseMode.sequence || props.showcaseMode.sequence.length === 0) {
    console.warn('Showcase mode enabled but sequence is empty. Disabling showcase mode.')
    return
  }

  // Validate face numbers
  const invalidFaces = props.showcaseMode.sequence.filter((face) => face < 0 || face > 5)
  if (invalidFaces.length > 0) {
    console.error(`Invalid face numbers in sequence: ${invalidFaces}. Must be 0-5.`)
    return
  }

  // Set showcase configuration
  showcaseSequence.value = props.showcaseMode.sequence
  showcaseFaceDuration.value = props.showcaseMode.faceDuration ?? 3000
  showcaseLoop.value = props.showcaseMode.loop ?? true
  showcaseRotationSpeed.value = props.showcaseMode.rotationSpeed ?? 0.02

  // Auto-start if configured
  if (props.showcaseMode.autoStart) {
    // Reset showcase state
    showcaseImageOffset = 0 // Reset image offset
    pendingSkippedFaceUpdate = null // Reset pending update

    // Reset previously visible faces to prevent face cycling on first showcase rotation
    // Note: camera and cube are initialized by the time this hook runs
    if (camera && cube) {
      previouslyVisibleFaces = getVisibleFaces()
    }

    // Assign first batch of images
    // This will skip loading if the correct images are already displayed
    assignImagesToFacesForShowcase()

    isShowcaseActive.value = true
    showcaseCurrentIndex.value = 0
    showcaseAccumulatedTime.value = 0
    lastShowcaseFrameTime = performance.now()
    if (DEBUG)
      console.log(`🎬 Showcase mode started: sequence [${showcaseSequence.value.join(', ')}]`)
  }
}

const initThreeJS = async () => {
  if (!canvas.value || !container.value) return

  // Scene setup with soft fog
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(FOG_COLOR, FOG_DENSITY)

  // Camera setup - adjust distance based on screen width for mobile
  const aspect = container.value.clientWidth / container.value.clientHeight
  const isMobile = container.value.clientWidth < 768
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.z = isMobile ? 3.2 : 3 // Mobile: closer for larger cube appearance

  // Renderer setup with transparent background
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // CRITICAL: No tone mapping needed for MeshBasicMaterial - displays at native brightness
  renderer.toneMapping = THREE.NoToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // Load textures with cropping, error handling and progress tracking
  console.log(
    `🖼️ Starting to load and crop ${props.images.length} textures (strategy: ${props.cropStrategy})...`
  )
  let loadedCount = 0

  const textures = await Promise.all(
    props.images.map((url, index) => {
      return loadCroppedTexture(url, {
        strategy: props.cropStrategy,
        targetSize: props.cropSize,
      })
        .then((texture) => {
          loadedCount++
          loadingProgress.value = loadedCount / props.images.length
          console.log(`✅ Loaded cropped texture ${loadedCount}/${props.images.length}: ${url}`)
          return texture
        })
        .catch((error) => {
          console.error(`❌ Failed to load cropped texture at index ${index} (${url}):`, error)
          throw error
        })
    })
  ).catch((error) => {
    console.error('Critical: Failed to load required textures:', error)
    throw error
  })

  console.log('🎉 All textures loaded successfully!')

  // Store all textures for instant swapping during showcase cycle transitions
  allPreloadedTextures = textures
  if (DEBUG) console.log(`💾 Stored ${allPreloadedTextures.length} pre-loaded textures for showcase mode`)

  // Create materials for each face - MeshBasicMaterial for 100% browser-native brightness
  const materials = textures.map((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide,
    })
  })

  // Reorder materials to fix display order
  // Three.js BoxGeometry assigns materials to faces in order: right(0), left(1), top(2), bottom(3), front(4), back(5)
  // To show images [1,2,3,4,5,6] on faces [0,1,2,3,4,5], we need to rearrange:
  const reorderedMaterials = [
    materials[1], // Face 0 (right): image 2
    materials[0], // Face 1 (left): image 1
    materials[3], // Face 2 (top): image 4
    materials[2], // Face 3 (bottom): image 3
    materials[5], // Face 4 (front): image 6
    materials[4], // Face 5 (back): image 5
  ]

  // Create cube geometry with reordered materials
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  cube = new THREE.Mesh(geometry, reorderedMaterials)
  scene.add(cube)

  // Initialize faceImageIndices to track what each face SHOULD show (not actual after reordering)
  // This ensures even distribution when faces cycle outside showcase mode
  // The material reordering is handled separately in assignImagesToFacesForShowcase
  faceImageIndices = [0, 1, 2, 3, 4, 5]

  // Add subtle soft edges
  const edgesGeometry = new THREE.EdgesGeometry(geometry)
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xd4a5a5, // Dusty rose
    transparent: true,
    opacity: 0.3,
    blending: THREE.NormalBlending,
  })
  edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  cube.add(edges)

  // Soft studio lighting for edge glow and particles
  // Note: MeshBasicMaterial is unlit, so these lights only affect edge glow and particles
  const ambientLight = new THREE.AmbientLight(0xfff5f0, 0.8)
  scene.add(ambientLight)

  keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
  keyLight.position.set(2, 2, 4)
  scene.add(keyLight)

  fillLight = new THREE.DirectionalLight(0xf0f5f0, 1.2)
  fillLight.position.set(-3, 1, 3)
  scene.add(fillLight)

  // Add rim light for depth
  const rimLight = new THREE.DirectionalLight(0xe8c4c4, 0.4)
  rimLight.position.set(-4, 2, -3)
  scene.add(rimLight)

  // Generate PMREM environment for edge and particle lighting
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color(0xf9f6f1)
  const envTexture = pmremGenerator.fromScene(envScene).texture
  scene.environment = envTexture
  pmremGenerator.dispose()

  // Initialize particle system
  initParticleSystem(isMobile)

  // Set initial rotation to show Front (F4) and Right (F0) faces half-half
  cube.rotation.x = THREE.MathUtils.degToRad(0)   // No tilt (level cube)
  cube.rotation.y = THREE.MathUtils.degToRad(-45) // Rotate 45° toward right face

  // Initialize target quaternion from initial rotation
  targetQuaternion = cube.quaternion.clone()

  // Start animation loop
  animate()

  isLoading.value = false

  // Initialize showcase mode after Three.js is ready
  initShowcaseMode()
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

// Update texture for a specific face with cropping
async function updateFaceTexture(faceIndex: number, imageIndex: number): Promise<void> {
  if (!cube || !props.images[imageIndex]) {
    console.error(`Invalid texture update request: face ${faceIndex}, image ${imageIndex}`)
    return
  }

  try {
    const texture = await loadCroppedTexture(props.images[imageIndex], {
      strategy: props.cropStrategy,
      targetSize: props.cropSize,
    })

    // Set anisotropy for runtime-loaded textures (matches initial texture setting)
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy() // Will clamp to GPU max if needed

    // Update the material's map (cube.material is an array of 6 materials)
    const materials = cube.material as THREE.MeshBasicMaterial[]
    const material = materials[faceIndex]

    // Dispose old texture to prevent memory leak
    if (material.map) {
      material.map.dispose()
    }

    material.map = texture
    material.needsUpdate = true
  } catch (error) {
    console.error(
      `Failed to load cropped texture for face ${faceIndex} (image ${imageIndex}):`,
      error
    )
  }
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  // Update frame counter
  frameCounter.value++

  // Apply camera-relative rotation using quaternions with momentum
  if (cube) {
    let applyRotationX = 0 // Total X-axis rotation to apply this frame
    let applyRotationY = 0 // Total Y-axis rotation to apply this frame

    if (isDragging.value) {
      // During drag: apply rotation directly
      applyRotationX = dragDeltaY.value * DRAG_SENSITIVITY * DEG_TO_RAD
      applyRotationY = dragDeltaX.value * DRAG_SENSITIVITY * DEG_TO_RAD

      // Check if actually moving (drag delta changing) vs holding still
      const isMovingX = Math.abs(dragDeltaY.value - lastDragDeltaY) > 0.1
      const isMovingY = Math.abs(dragDeltaX.value - lastDragDeltaX) > 0.1

      // Only capture momentum when actually moving fast
      // Holding still (velocity ≈ 0) should not create momentum
      const isFastMovementX = isMovingX && Math.abs(applyRotationX) > MOMENTUM_MINIMUM
      const isFastMovementY = isMovingY && Math.abs(applyRotationY) > MOMENTUM_MINIMUM

      momentumX = isFastMovementX ? applyRotationX * MOMENTUM_SCALE : 0
      momentumY = isFastMovementY ? applyRotationY * MOMENTUM_SCALE : 0

      // Store current drag for next frame
      lastDragDeltaX = dragDeltaX.value
      lastDragDeltaY = dragDeltaY.value
    } else {
      // Reset tracking when not dragging
      lastDragDeltaX = 0
      lastDragDeltaY = 0

      // After drag: apply momentum with decay
      if (Math.abs(momentumX) > MOMENTUM_THRESHOLD || Math.abs(momentumY) > MOMENTUM_THRESHOLD) {
        applyRotationX = momentumX
        applyRotationY = momentumY

        // Decay momentum
        momentumX *= MOMENTUM_DECAY
        momentumY *= MOMENTUM_DECAY
      }
    }

    // Apply world-axis rotation to helper object
    rotationHelper.quaternion.copy(targetQuaternion)
    rotationHelper.rotateOnWorldAxis(worldRightAxis, applyRotationX)
    rotationHelper.rotateOnWorldAxis(worldUpAxis, applyRotationY)

    // Smooth interpolation using spherical linear interpolation (slerp)
    cube.quaternion.slerp(rotationHelper.quaternion, SLERP_FACTOR)

    // Update target quaternion to track accumulated rotation during momentum
    // This ensures momentum feels natural and continues from current orientation
    if (
      !isDragging.value &&
      (Math.abs(momentumX) > MOMENTUM_THRESHOLD || Math.abs(momentumY) > MOMENTUM_THRESHOLD)
    ) {
      targetQuaternion.copy(rotationHelper.quaternion)
    }

    // Showcase mode auto-rotation (takes precedence when active)
    if (isShowcaseActive.value && showcaseSequence.value.length > 0) {
      const currentTime = performance.now()

      // Initialize frame time on first frame
      if (lastShowcaseFrameTime === 0) {
        lastShowcaseFrameTime = currentTime
      }

      // Only accumulate time when not paused
      if (!isShowcasePaused.value) {
        // Calculate delta time for precise timing
        const deltaTime = currentTime - lastShowcaseFrameTime
        lastShowcaseFrameTime = currentTime

        // Accumulate time using delta for precision
        showcaseAccumulatedTime.value += deltaTime

        // Check if it's time to move to next face
        if (showcaseAccumulatedTime.value > showcaseFaceDuration.value) {
          // Reset accumulator
          showcaseAccumulatedTime.value = 0

          // Move to next face in sequence
          const wasLastInSequence = showcaseCurrentIndex.value === showcaseSequence.value.length - 1
          showcaseCurrentIndex.value =
            (showcaseCurrentIndex.value + 1) % showcaseSequence.value.length

          // When we're about to show the last face, pre-load next cycle's images
          // Skip F4 (second-to-last) and update it later when F0 aligns
          if (wasLastInSequence && showcaseLoop.value) {
            const lastFaceInSequence = showcaseSequence.value[showcaseSequence.value.length - 1]
            const faceToSkip = Math.max(0, lastFaceInSequence - 1) // Skip F4
            showcaseImageOffset = (showcaseImageOffset + 6) % props.images.length
            if (DEBUG) console.log(`🔄 Pre-loading next cycle, skipping F${faceToSkip}`)
            assignImagesToFacesForShowcase(faceToSkip)
            pendingSkippedFaceUpdate = faceToSkip // Set pending update for skipped face
            pendingUpdateTriggered = false // Reset one-shot flag for next cycle
          }

          // End of sequence if not looping
          if (showcaseCurrentIndex.value === 0 && !showcaseLoop.value) {
            isShowcaseActive.value = false
            lastShowcaseFrameTime = 0 // Reset frame time
            if (DEBUG) console.log('🎬 Showcase mode completed (non-looping)')
            emit('showcaseCompleted')
          }
        }
      } else {
        // Just update frame time when paused (don't accumulate)
        lastShowcaseFrameTime = currentTime
      }

      // Get target rotation for current face
      const currentFace = showcaseTargetFace.value
      const targetRotation = calculateRotationForFace(currentFace)

      // Smooth rotation to target face FIRST
      cube.quaternion.slerp(targetRotation, showcaseRotationSpeed.value)

      // Update target quaternion so we don't snap back
      targetQuaternion.copy(cube.quaternion)

    } else {
      // Reset frame time when not active to avoid large delta on restart
      lastShowcaseFrameTime = 0
    }

    // Add subtle floating animation
    cube.position.y = Math.sin(Date.now() * 0.001) * 0.05

    // Dynamic edge glow with pulse
    if (edges) {
      edgePulseTime += 1
      const pulseAmount = Math.sin(edgePulseTime * EDGE_PULSE_SPEED) * 0.2
      const targetOpacity = isDragging.value ? EDGE_DRAG_OPACITY : EDGE_BASE_OPACITY
      ;(edges.material as THREE.LineBasicMaterial).opacity = targetOpacity + pulseAmount
    }

    // Interactive light feedback
    const targetIntensity = isDragging.value ? LIGHT_INTENSITY_DRAG : LIGHT_INTENSITY_IDLE
    const currentIntensity = keyLight.intensity
    keyLight.intensity += (targetIntensity - currentIntensity) * LIGHT_LERP_SPEED
  }

  // Update particle system
  if (particles) {
    const positions = particles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] += particleVelocities[i * 3]
      positions[i * 3 + 1] += particleVelocities[i * 3 + 1]
      positions[i * 3 + 2] += particleVelocities[i * 3 + 2]

      // Wrap around sphere boundary
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      const dist = Math.sqrt(x * x + y * y + z * z)

      if (dist > 4) {
        // Reset to center
        positions[i * 3] *= 0.5
        positions[i * 3 + 1] *= 0.5
        positions[i * 3 + 2] *= 0.5
      }
    }
    particles.geometry.attributes.position.needsUpdate = true
    particles.rotation.y += 0.0002 // Slow ambient rotation
  }

  // Check for newly visible faces and update their images
  if (cube && camera) {
    const nowVisibleFaces = getVisibleFaces()
    const now = Date.now()

    // Check if we have a pending update for the skipped face (F4)
    // Update when the FIRST face of the new cycle is perfectly aligned with camera
    if (pendingSkippedFaceUpdate !== null && !pendingUpdateTriggered) {
      // Validate face index is within valid range
      if (
        pendingSkippedFaceUpdate < 0 ||
        pendingSkippedFaceUpdate >= 6 ||
        !Number.isInteger(pendingSkippedFaceUpdate)
      ) {
        console.error(
          `Invalid pendingSkippedFaceUpdate: ${pendingSkippedFaceUpdate}. Must be 0-5.`
        )
        pendingSkippedFaceUpdate = null
        return
      }

      const firstFaceInSequence = showcaseSequence.value[0]

      // Check if F0 is aligned with camera by checking its dot product
      const face0Normal = faceNormals[firstFaceInSequence].clone()
      face0Normal.applyQuaternion(cube.quaternion)
      face0Normal.normalize()

      const cameraDirection = new THREE.Vector3(0, 0, -1)
      const alignment = face0Normal.dot(cameraDirection)

      // If F0 is perfectly aligned (1.0), then update the skipped face (F4)
      if (alignment >= 0.999) {
        const skippedFace = pendingSkippedFaceUpdate
        // Calculate the image index for the skipped face
        const imageIndex = (showcaseImageOffset + translateIndex(skippedFace)) % props.images.length

        if (DEBUG) {
          console.log(
            `🎯 TRIGGER: F${firstFaceInSequence} alignment = ${alignment.toFixed(6)} >= 0.999`
          )
          console.log(`   Updating skipped face F${skippedFace} to img${imageIndex}`)
        }

        // Load and update the texture for the skipped face using pre-loaded textures
        if (cube && allPreloadedTextures.length > 0) {
          const materials = cube.material as THREE.MeshBasicMaterial[]
          const material = materials[skippedFace]

          // Use pre-loaded texture for instant swapping
          const texture = allPreloadedTextures[imageIndex]

          if (material.map && material.map !== texture) {
            material.map.dispose()
          }

          material.map = texture
          material.needsUpdate = true

          // Update logical image index
          faceImageIndices[skippedFace] = (showcaseImageOffset + skippedFace) % props.images.length

          if (DEBUG) {
            console.log(`✅ LOADED: F${skippedFace} texture updated to img${imageIndex} (instant)`)
          }
        }

        pendingSkippedFaceUpdate = null // Clear pending update
        pendingUpdateTriggered = true // Mark as triggered to prevent duplicates
      }
    }

    // Hybrid HUD update strategy
    if (isDragging.value) {
      // During drag: Real-time updates for immediate feedback
      hudEuler.setFromQuaternion(cube.quaternion)
      displayedRotationX.value = THREE.MathUtils.radToDeg(hudEuler.x)
      displayedRotationY.value = THREE.MathUtils.radToDeg(hudEuler.y)
      visibleFaceCount.value = nowVisibleFaces.size
      visibleFaceNumbers.value = Array.from(nowVisibleFaces).sort((a, b) => a - b)
    } else {
      // When idle: Throttled updates (10fps) for readability
      if (now - lastThrottledUpdate > THROTTLE_MS) {
        hudEuler.setFromQuaternion(cube.quaternion)
        displayedRotationX.value = THREE.MathUtils.radToDeg(hudEuler.x)
        displayedRotationY.value = THREE.MathUtils.radToDeg(hudEuler.y)
        visibleFaceCount.value = nowVisibleFaces.size
        visibleFaceNumbers.value = Array.from(nowVisibleFaces).sort((a, b) => a - b)
        lastThrottledUpdate = now
      }
    }

    for (const faceIndex of nowVisibleFaces) {
      // Skip if was already visible
      if (previouslyVisibleFaces.has(faceIndex)) continue

      // Check cooldown (skip cooldown during showcase mode - images are pre-assigned)
      const isInShowcase = isShowcaseActive.value && !isShowcasePaused.value
      if (!isInShowcase && now - faceChangeTimestamps[faceIndex] < COOLDOWN_MS) continue

      // During showcase mode, don't increment - images are pre-assigned per cycle
      // During normal mode, increment to next image
      if (!isInShowcase) {
        faceImageIndices[faceIndex] = (faceImageIndices[faceIndex] + 1) % props.images.length
        updateFaceTexture(faceIndex, faceImageIndices[faceIndex])
      }

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

// Disable drag interaction during showcase mode
const dragEnabled = computed(() => !isShowcaseActive.value)

// Use navigation composable for drag tracking only (no navigation)
const { dragDeltaX, dragDeltaY, isDragging } = useCubeNavigation(
  props.images.length,
  () => {}, // No-op callback - navigation disabled
  dragEnabled // Pass drag enabled state to disable during showcase
)

// Public API for showcase mode control

/**
 * Starts showcase mode if enabled
 * @throws {Error} If showcase mode is not enabled in props
 * @throws {Error} If sequence is empty
 * @emits showcaseStarted
 */
function startShowcase() {
  if (!props.showcaseMode || !props.showcaseMode.enabled) {
    if (DEBUG) console.warn('Cannot start showcase: showcase mode is not enabled in props')
    return
  }

  if (showcaseSequence.value.length === 0) {
    if (DEBUG) console.warn('Cannot start showcase: sequence is empty')
    return
  }

  // Reset image offset for first cycle (show images 0-5)
  showcaseImageOffset = 0
  pendingSkippedFaceUpdate = null // Reset pending update

  // Reset previously visible faces to prevent face cycling on first showcase rotation
  if (camera && cube) {
    previouslyVisibleFaces = getVisibleFaces()
  }

  // Assign first batch of images to faces
  // This will skip loading if the correct images are already displayed
  assignImagesToFacesForShowcase()

  isShowcaseActive.value = true
  showcaseCurrentIndex.value = 0
  showcaseAccumulatedTime.value = 0
  lastShowcaseFrameTime = performance.now()
  if (DEBUG)
    console.log(`🎬 Showcase mode started: sequence [${showcaseSequence.value.join(', ')}]`)
  emit('showcaseStarted')
}

/**
 * Stops showcase mode
 * @emits showcaseStopped
 */
function stopShowcase() {
  isShowcaseActive.value = false
  lastShowcaseFrameTime = 0 // Reset frame time
  if (DEBUG) console.log('⏹️ Showcase mode stopped')
  emit('showcaseStopped')
}

/**
 * Toggles showcase mode on/off
 * @emits showcaseStarted | showcaseStopped
 */
function toggleShowcase() {
  if (isShowcaseActive.value) {
    stopShowcase()
  } else {
    startShowcase()
  }
}

/**
 * Pauses showcase mode (keeps active but doesn't advance faces)
 * @emits showcasePaused
 */
function pauseShowcase() {
  if (!isShowcaseActive.value) {
    if (DEBUG) console.warn('Cannot pause: showcase is not active')
    return
  }
  isShowcasePaused.value = true
  if (DEBUG) console.log('⏸️ Showcase mode paused')
  emit('showcasePaused')
}

/**
 * Resumes showcase mode from paused state
 * @emits showcaseResumed
 */
function resumeShowcase() {
  if (!isShowcaseActive.value) {
    if (DEBUG) console.warn('Cannot resume: showcase is not active')
    return
  }
  if (!isShowcasePaused.value) {
    if (DEBUG) console.warn('Cannot resume: showcase is not paused')
    return
  }
  isShowcasePaused.value = false
  lastShowcaseFrameTime = performance.now() // Reset frame time to avoid large delta
  if (DEBUG) console.log('▶️ Showcase mode resumed')
  emit('showcaseResumed')
}

// Expose public methods
defineExpose({
  startShowcase,
  stopShowcase,
  toggleShowcase,
  pauseShowcase,
  resumeShowcase,
  isShowcaseActive: () => isShowcaseActive.value,
  isShowcasePaused: () => isShowcasePaused.value,
})

// Watch for drag state changes
watch(isDragging, (dragging, wasDragging) => {
  if (dragging && !wasDragging) {
    // Drag started
    hasInteracted.value = true
  } else if (wasDragging && !dragging && cube) {
    // Drag ended - capture the current orientation as the new target
    // Use clone() to create a new quaternion instance (clearer intent than copy())
    targetQuaternion = cube.quaternion.clone()
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
    const materials = cube.material as THREE.MeshBasicMaterial[]
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

  // Dispose of particle system
  if (particles) {
    particles.geometry.dispose()
    ;(particles.material as THREE.Material).dispose()
  }

  // Dispose of renderer
  if (renderer) {
    renderer.dispose()
  }

  // Dispose of environment map
  if (scene && scene.environment) {
    scene.environment.dispose()
  }

  // Note: rotationHelper is a module-level const Object3D not in scene graph
  // No explicit cleanup needed - documented here for completeness
})
</script>
