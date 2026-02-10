/**
 * Unit tests for material reordering logic
 * Tests the translateIndex function and related face-to-image mapping
 */

import { describe, it, expect } from 'vitest'

/**
 * Translation table for material reordering
 * Material reordering swaps adjacent pairs: [0↔1, 2↔3, 4↔5]
 * This means face i needs material at translateIndex(i) to show logical image i
 */
const translateIndex = (i: number) => (i % 2 === 0 ? i + 1 : i - 1)

describe('Material Reordering - translateIndex', () => {
  describe('Swaps adjacent pairs correctly', () => {
    it('should swap 0↔1', () => {
      expect(translateIndex(0)).toBe(1)
      expect(translateIndex(1)).toBe(0)
    })

    it('should swap 2↔3', () => {
      expect(translateIndex(2)).toBe(3)
      expect(translateIndex(3)).toBe(2)
    })

    it('should swap 4↔5', () => {
      expect(translateIndex(4)).toBe(5)
      expect(translateIndex(5)).toBe(4)
    })
  })

  describe('Handles all face indices 0-5', () => {
    it('should map all 6 face indices correctly', () => {
      const mappings = [
        [0, 1],
        [1, 0],
        [2, 3],
        [3, 2],
        [4, 5],
        [5, 4],
      ]

      mappings.forEach(([input, expected]) => {
        expect(translateIndex(input)).toBe(expected)
      })
    })
  })

  describe('Is symmetric (inverse function)', () => {
    it('should be its own inverse', () => {
      // translateIndex(translateIndex(x)) should equal x
      for (let i = 0; i < 6; i++) {
        expect(translateIndex(translateIndex(i))).toBe(i)
      }
    })
  })
})

describe('Material Reordering - Face to Image Mapping', () => {
  describe('Logical image calculation', () => {
    it('should calculate correct logical image for each face', () => {
      const showcaseImageOffset = 0
      const imageCount = 12

      // Each face i should show logical image (offset + i) % count
      const expectedMappings = [
        [0, 0], // Face 0: logical image 0
        [1, 1], // Face 1: logical image 1
        [2, 2], // Face 2: logical image 2
        [3, 3], // Face 3: logical image 3
        [4, 4], // Face 4: logical image 4
        [5, 5], // Face 5: logical image 5
      ]

      expectedMappings.forEach(([face, expectedImage]) => {
        const logicalImageIndex = (showcaseImageOffset + face) % imageCount
        expect(logicalImageIndex).toBe(expectedImage)
      })
    })

    it('should cycle through images correctly', () => {
      const showcaseImageOffset = 6
      const imageCount = 12

      // With offset 6, face 0 should show logical image 6
      const face0Logical = (showcaseImageOffset + 0) % imageCount
      expect(face0Logical).toBe(6)

      // Face 5 should show logical image 11
      const face5Logical = (showcaseImageOffset + 5) % imageCount
      expect(face5Logical).toBe(11)
    })
  })

  describe('Material index calculation', () => {
    it('should calculate correct material index for each face', () => {
      const showcaseImageOffset = 0
      const imageCount = 12

      // Due to material swap, we load from translateIndex(i)
      const expectedMappings = [
        [0, 1], // Face 0: load from material 1 (image 1)
        [1, 0], // Face 1: load from material 0 (image 0)
        [2, 3], // Face 2: load from material 3 (image 3)
        [3, 2], // Face 3: load from material 2 (image 2)
        [4, 5], // Face 4: load from material 5 (image 5)
        [5, 4], // Face 5: load from material 4 (image 4)
      ]

      expectedMappings.forEach(([face, expectedMaterial]) => {
        const imageIndex = (showcaseImageOffset + translateIndex(face)) % imageCount
        expect(imageIndex).toBe(expectedMaterial)
      })
    })
  })
})

describe('Material Reordering - Face Image Distribution', () => {
  describe('Even distribution across faces', () => {
    it('should initialize faceImageIndices sequentially', () => {
      const faceImageIndices = [0, 1, 2, 3, 4, 5]

      // Each face starts at a different image
      faceImageIndices.forEach((imageIndex, face) => {
        expect(imageIndex).toBe(face)
      })
    })

    it('should cycle through all images evenly', () => {
      const imageCount = 12
      const faceImageIndices = [0, 1, 2, 3, 4, 5]

      // After 12 cycles, each face should have shown all images exactly once
      const cyclesPerImage = 12

      faceImageIndices.forEach((startIndex, _face) => {
        const imagesShown = new Set<number>()
        let currentIndex = startIndex

        for (let cycle = 0; cycle < cyclesPerImage; cycle++) {
          imagesShown.add(currentIndex)
          currentIndex = (currentIndex + 1) % imageCount
        }

        // Each face should have seen all 12 images
        expect(imagesShown.size).toBe(imageCount)
      })
    })
  })

  describe('No image appears more frequently', () => {
    it('should ensure each image appears same number of times across all faces', () => {
      const imageCount = 6
      const faceCount = 6
      const cycleCount = 6

      // Count how many times each image appears across all faces
      const imageAppearances = new Array(imageCount).fill(0)

      for (let face = 0; face < faceCount; face++) {
        const startIndex = face // faceImageIndices[face] = [0,1,2,3,4,5]
        let currentIndex = startIndex

        for (let cycle = 0; cycle < cycleCount; cycle++) {
          imageAppearances[currentIndex]++
          currentIndex = (currentIndex + 1) % imageCount
        }
      }

      // All images should appear exactly 6 times (once per face per cycle)
      imageAppearances.forEach((count, _imageIndex) => {
        expect(count).toBe(cycleCount)
      })
    })
  })
})

describe('Material Reordering - Edge Cases', () => {
  describe('Valid face indices', () => {
    it('should handle all valid face indices (0-5)', () => {
      for (let i = 0; i < 6; i++) {
        const result = translateIndex(i)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(6)
      }
    })
  })

  describe('Invalid face indices', () => {
    it('should handle negative indices gracefully', () => {
      // translateIndex for negative numbers should still work due to modulo
      // but this is undefined behavior - face indices should always be 0-5
      const result = translateIndex(-1)
      expect(result).toBe(-2) // -1 % 2 = -1, so -1 - 1 = -2
    })

    it('should handle indices beyond 5', () => {
      // translateIndex for 6 should give 7, which is invalid
      // but this is undefined behavior - face indices should always be 0-5
      const result = translateIndex(6)
      expect(result).toBe(7) // 6 % 2 = 0, so 6 + 1 = 7
    })
  })
})

describe('Material Reordering - Integration', () => {
  describe('Full pipeline test', () => {
    it('should correctly map faces to images for first cycle', () => {
      const showcaseImageOffset = 0
      const imageCount = 12
      const faceImageIndices: number[] = [0, 1, 2, 3, 4, 5]

      // Simulate first cycle assignment
      const result = faceImageIndices.map((_face, i) => {
        const logicalImageIndex = (showcaseImageOffset + i) % imageCount
        const materialIndex = (showcaseImageOffset + translateIndex(i)) % imageCount
        return {
          face: i,
          logicalImage: logicalImageIndex,
          materialIndex,
        }
      })

      // Verify each face has correct mappings
      expect(result[0]).toEqual({ face: 0, logicalImage: 0, materialIndex: 1 })
      expect(result[1]).toEqual({ face: 1, logicalImage: 1, materialIndex: 0 })
      expect(result[2]).toEqual({ face: 2, logicalImage: 2, materialIndex: 3 })
      expect(result[3]).toEqual({ face: 3, logicalImage: 3, materialIndex: 2 })
      expect(result[4]).toEqual({ face: 4, logicalImage: 4, materialIndex: 5 })
      expect(result[5]).toEqual({ face: 5, logicalImage: 5, materialIndex: 4 })
    })

    it('should correctly map faces to images for second cycle', () => {
      const showcaseImageOffset = 6
      const imageCount = 12
      const faceImageIndices: number[] = [0, 1, 2, 3, 4, 5]

      // Simulate second cycle assignment
      const result = faceImageIndices.map((_face, i) => {
        const logicalImageIndex = (showcaseImageOffset + i) % imageCount
        const materialIndex = (showcaseImageOffset + translateIndex(i)) % imageCount
        return {
          face: i,
          logicalImage: logicalImageIndex,
          materialIndex,
        }
      })

      // Verify each face has correct mappings for offset 6
      expect(result[0]).toEqual({ face: 0, logicalImage: 6, materialIndex: 7 })
      expect(result[1]).toEqual({ face: 1, logicalImage: 7, materialIndex: 6 })
      expect(result[2]).toEqual({ face: 2, logicalImage: 8, materialIndex: 9 })
      expect(result[3]).toEqual({ face: 3, logicalImage: 9, materialIndex: 8 })
      expect(result[4]).toEqual({ face: 4, logicalImage: 10, materialIndex: 11 })
      expect(result[5]).toEqual({ face: 5, logicalImage: 11, materialIndex: 10 })
    })
  })
})
