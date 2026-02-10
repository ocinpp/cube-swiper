import { ref, computed, onMounted, onUnmounted } from 'vue'

export type NavigationState = 'idle' | 'dragging'

export function useCubeNavigation(
  imageCount: number,
  onNavigate: (direction: 'next' | 'prev') => void,
  dragEnabled?: Ref<boolean>
) {
  const currentIndex = ref(0)
  const navigationState = ref<NavigationState>('idle')
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const dragDeltaX = ref(0)
  const dragDeltaY = ref(0)
  const dragSpeed = ref(0)

  // Thresholds - increased to distinguish free rotation from swipe navigation
  const swipeThreshold = 100 // Increased from 50 - requires longer distance for nav
  const speedThreshold = 1.5 // Increased from 0.8 - requires faster flick for nav

  // For speed calculation
  let lastX = 0
  let lastTime = 0
  let velocitySamples: number[] = []
  const maxSamples = 5

  const isDragging = computed(() => navigationState.value === 'dragging')
  const currentImage = computed(() => currentIndex.value)

  const handlePointerDown = (e: PointerEvent) => {
    // Check if dragging is disabled (e.g., during showcase mode)
    if (dragEnabled?.value === false) {
      if (import.meta.env.DEV) {
        console.log('🚫 Drag disabled - pointer event ignored')
      }
      return
    }
    dragStartX.value = e.clientX
    dragStartY.value = e.clientY
    lastX = e.clientX
    lastTime = performance.now()
    dragDeltaX.value = 0
    dragDeltaY.value = 0
    dragSpeed.value = 0
    velocitySamples = []
    navigationState.value = 'dragging'

    // Capture pointer to track movement outside element
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (navigationState.value !== 'dragging') return

    const currentTime = performance.now()
    const deltaX = e.clientX - lastX
    const deltaTime = currentTime - lastTime

    dragDeltaX.value = e.clientX - dragStartX.value
    dragDeltaY.value = e.clientY - dragStartY.value

    // Calculate instantaneous velocity
    if (deltaTime > 0) {
      const velocity = Math.abs(deltaX / deltaTime)
      velocitySamples.push(velocity)
      if (velocitySamples.length > maxSamples) {
        velocitySamples.shift()
      }

      // Average velocity for smoother detection
      const avgVelocity = velocitySamples.reduce((sum, v) => sum + v, 0) / velocitySamples.length
      dragSpeed.value = avgVelocity
    }

    lastX = e.clientX
    lastTime = currentTime
  }

  const handlePointerUp = (e: PointerEvent) => {
    // Check if this is a horizontal swipe (navigation) vs free rotation
    // Only navigate if horizontal movement is greater than vertical movement
    const isHorizontalSwipe = Math.abs(dragDeltaX.value) > Math.abs(dragDeltaY.value) * 1.5

    if (!isHorizontalSwipe) {
      // This was mostly vertical drag - just free rotation, no navigation
      navigationState.value = 'idle'
      dragStartX.value = 0
      dragStartY.value = 0
      dragDeltaX.value = 0
      dragDeltaY.value = 0
      dragSpeed.value = 0
      velocitySamples = []
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      return
    }

    // Check if speed threshold was reached for flick gesture
    const speedTriggered = dragSpeed.value >= speedThreshold
    const distanceTriggered = Math.abs(dragDeltaX.value) >= swipeThreshold

    if (speedTriggered || distanceTriggered) {
      // Drag right (positive delta) -> next
      // Drag left (negative delta) -> prev
      const direction = dragDeltaX.value > 0 ? 'next' : 'prev'
      onNavigate(direction)
    }

    // Reset state
    navigationState.value = 'idle'
    dragStartX.value = 0
    dragStartY.value = 0
    dragDeltaX.value = 0
    dragDeltaY.value = 0
    dragSpeed.value = 0
    velocitySamples = []
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const nextImage = () => {
    currentIndex.value = (currentIndex.value + 1) % imageCount
  }

  const prevImage = () => {
    currentIndex.value = (currentIndex.value - 1 + imageCount) % imageCount
  }

  const goToIndex = (index: number) => {
    currentIndex.value = (index + imageCount) % imageCount
  }

  onMounted(() => {
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  })

  onUnmounted(() => {
    window.removeEventListener('pointerdown', handlePointerDown)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  })

  return {
    currentIndex,
    navigationState,
    dragDeltaX,
    dragDeltaY,
    dragSpeed,
    isDragging,
    currentImage,
    nextImage,
    prevImage,
    goToIndex,
  }
}
