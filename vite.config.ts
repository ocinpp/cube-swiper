import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    vue(),
    ViteImageOptimizer({
      // Optimize all images in the project
      // Settings: balance between quality and file size
      jpg: {
        quality: 85, // Good quality, significant size reduction
      },
      jpeg: {
        quality: 85,
      },
      png: {
        quality: 85,
        compressionLevel: 9, // Maximum compression
      },
      webp: {
        quality: 85,
      },
      // SVG optimization
      svg: {
        multipass: true, // Multiple passes for better optimization
        plugins: [
          { name: 'preset-default', params: { overrides: { cleanupNumericValues: false } } },
        ],
      },
      // Don't modify original filenames
      include: /\/assets\/.*\.(jpg|jpeg|png|webp|gif|svg)$/i,
      exclude: /node_modules/,
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
})
