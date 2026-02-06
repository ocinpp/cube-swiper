# Images Directory

Drop your images here! The app automatically loads all images from this directory.

## Supported Formats
- JPG / JPEG
- PNG
- WebP
- GIF
- SVG

## Automatic Image Compression 🗜️

**Images are automatically optimized during production builds!**

- **Development:** Images are served as-is for fast iteration
- **Production build (`npm run build`):** Images are compressed automatically
  - JPG/JPEG: Quality 85 (typically 40-60% size reduction)
  - PNG: Maximum compression with quality 85
  - WebP: Quality 85 (modern format, best size/quality ratio)
  - SVG: Multi-pass optimization for vector graphics

**Tip:** Use WebP format for best compression quality. Original files are never modified - optimization happens at build time.

## How Many Images?

**Minimum:** 6 images (one for each cube face)

**With more than 6:** The cube cycles through all images as faces rotate into view. Each face displays one image at a time, and when a face becomes visible again, it shows the next image in the collection.

## Example
Put images like this:
```
src/assets/images/
  ├── photo1.jpg
  ├── photo2.png
  ├── photo3.webp
  └── ...
```

They'll be automatically loaded and displayed on the cube!
