/**
 * Texture Cropping Utility
 *
 * Loads images, crops them to square based on strategy, and creates Three.js textures.
 * Prevents distortion when non-square images are displayed on cube faces.
 */

import * as THREE from 'three'

export type CropStrategy = 'cover' | 'contain' | 'fill'

export interface CropOptions {
  strategy?: CropStrategy
  targetSize?: number
}

/**
 * Main entry point: Load an image, crop it to square, and create a Three.js texture
 */
export async function loadCroppedTexture(
  imageUrl: string,
  options: CropOptions = {}
): Promise<THREE.CanvasTexture> {
  const { strategy = 'cover', targetSize = 2048 } = options

  try {
    // Load the image
    const img = await loadImage(imageUrl)

    // Crop to square
    const canvas = cropImageToSquare(img, strategy, targetSize)

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true

    return texture
  } catch (error) {
    console.error(`Failed to load cropped texture from ${imageUrl}:`, error)
    throw error
  }
}

/**
 * Load an HTMLImageElement from a URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    // Enable CORS for remote images
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`))
    }

    img.src = url
  })
}

/**
 * Crop an image to square using the specified strategy
 */
function cropImageToSquare(
  image: HTMLImageElement,
  strategy: CropStrategy,
  targetSize: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas')
  }

  // Apply the cropping strategy
  switch (strategy) {
    case 'cover':
      return applyCoverStrategy(image, ctx, canvas, targetSize)
    case 'contain':
      return applyContainStrategy(image, ctx, canvas, targetSize)
    case 'fill':
      return applyFillStrategy(image, ctx, canvas, targetSize)
    default:
      throw new Error(`Unknown crop strategy: ${strategy}`)
  }
}

/**
 * Cover strategy: Center crop to square
 * Crops the image to a square from the center, discarding edges
 */
function applyCoverStrategy(
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  targetSize: number
): HTMLCanvasElement {
  const { width, height } = image

  // Determine crop dimensions (use smaller dimension)
  const cropSize = Math.min(width, height)

  // Calculate crop position (center crop)
  let cropX = 0
  let cropY = 0

  if (width > height) {
    // Landscape: crop from left and right
    cropX = (width - cropSize) / 2
    cropY = 0
  } else {
    // Portrait: crop from top and bottom
    cropX = 0
    cropY = (height - cropSize) / 2
  }

  // Set canvas size
  canvas.width = targetSize
  canvas.height = targetSize

  // Draw cropped region to canvas
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropSize,
    cropSize, // Source rectangle
    0,
    0,
    targetSize,
    targetSize // Destination rectangle
  )

  return canvas
}

/**
 * Contain strategy: Letterbox to fit entire image
 * Scales the image to fit within the square, adding black bars if needed
 */
function applyContainStrategy(
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  targetSize: number
): HTMLCanvasElement {
  const { width, height } = image

  // Set canvas size
  canvas.width = targetSize
  canvas.height = targetSize

  // Fill with black background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, targetSize, targetSize)

  // Calculate scale to fit entire image
  const scale = Math.min(targetSize / width, targetSize / height)
  const scaledWidth = width * scale
  const scaledHeight = height * scale

  // Calculate position to center the image
  const x = (targetSize - scaledWidth) / 2
  const y = (targetSize - scaledHeight) / 2

  // Draw scaled image
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight)

  return canvas
}

/**
 * Fill strategy: Stretch to square (legacy behavior)
 * Stretches the image to fill the square, may cause distortion
 */
function applyFillStrategy(
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  targetSize: number
): HTMLCanvasElement {
  // Set canvas size
  canvas.width = targetSize
  canvas.height = targetSize

  // Stretch image to fill canvas
  ctx.drawImage(image, 0, 0, targetSize, targetSize)

  return canvas
}
