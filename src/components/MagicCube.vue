<template>
  <div ref="container" class="w-full h-full holographic-bg relative">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="loading-spinner"></div>
        <p class="text-holographic-cyan text-sm">Loading holographic cube...</p>
      </div>
    </div>

    <!-- Canvas container -->
    <canvas ref="canvas" class="w-full h-full block"></canvas>

    <!-- Instructions overlay -->
    <div
      v-if="!hasInteracted"
      class="absolute bottom-8 left-0 right-0 text-center pointer-events-none"
    >
      <p class="text-holographic-purple/70 text-sm px-4">Drag to rotate the cube</p>
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

  // Load textures
  const textureLoader = new THREE.TextureLoader()
  const textures = await Promise.all(
    props.images.map((url) => {
      return new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(url, resolve, undefined, reject)
      })
    })
  )

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
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.6,
  })
  edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  cube.add(edges)

  // Add lighting - brighter for better visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0x8b5cf6, 1, 10)
  pointLight1.position.set(2, 2, 2)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x06b6d4, 0.8, 10)
  pointLight2.position.set(-2, -2, 2)
  scene.add(pointLight2)

  const pointLight3 = new THREE.PointLight(0xec4899, 0.6, 10)
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
async function updateFaceTexture(faceIndex: number, imageIndex: number) {
  const textureLoader = new THREE.TextureLoader()
  const texture = await new Promise<THREE.Texture>((resolve, reject) => {
    textureLoader.load(props.images[imageIndex], resolve, undefined, reject)
  })

  // Update the material's map (cube.material is an array of 6 materials)
  const materials = cube.material as THREE.MeshPhysicalMaterial[]
  const material = materials[faceIndex]
  material.map = texture
  material.needsUpdate = true
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

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
  if (renderer) {
    renderer.dispose()
  }
})
</script>
