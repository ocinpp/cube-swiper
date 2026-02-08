# Color Scheme Evolution

## Reference Image Analysis

The reference image (`ref.png`) shows dramatic, high-contrast portrait lighting with:
- Deep, rich black shadows
- Warm golden highlights on skin
- Subtle pink-magenta rim lighting on shadowed side
- Cool cyan-blue ambient reflections
- High contrast ratio with dramatic light-to-dark transitions

## Color Changes Applied

### Background Layers
| Element | Before | After | Rationale |
|---------|--------|-------|-----------|
| Void base | `#0a0a0c` | `#050508` | Deeper, richer darkness |
| Obsidian | `#121216` | `#0a0a0f` | More shadow depth |
| Background gradient | Flat color | Radial with warm glow | Matches reference's golden upper region |

### Accent Colors
| Element | Before | After | Rationale |
|---------|--------|-------|-----------|
| Amber | `#ff9500` (orange-amber) | `#ffaa00` (golden amber) | Warmer, more golden like reference |
| Amber glow | `#ffb340` | `#ffcc33` | Brighter golden highlight |
| Magenta | `#8b5cf6` (purple-magenta) | `#d946ef` (pink-magenta) | More pink, less purple |
| Magenta glow | `#a78bfa` | `#e879f9` | Brighter pink glow |
| **New: Rose** | — | `#f472b6` | Subtle warm fill from reference |
| **New: Rose glow** | — | `#fda4af` | Rose gold accent |

### Three.js Lighting Updates

```typescript
// Before
keyLight: 0xff9500, 2.0 intensity  // Orange-amber
rimLight: 0x8b5cf6, 1.5 intensity  // Purple-magenta

// After
keyLight: 0xffaa00, 2.2 intensity  // Golden amber (brighter)
rimLight: 0xd946ef, 1.6 intensity  // Pink-magenta (brighter)
+ roseAccentLight: 0xf472b6, 0.3  // New subtle rose gold fill
```

### Particle System Colors

```typescript
// Before
PARTICLE_COLORS = [0x00d4ff, 0xff9500, 0x8b5cf6]  // Cyan, Orange-amber, Purple

// After
PARTICLE_COLORS = [0x00d4ff, 0xffaa00, 0xd946ef]  // Cyan, Golden amber, Pink-magenta
```

## Visual Impact

### Warmth Shift
- The overall palette shifted from cool-orange to **warm-golden**
- Magenta shifted from purple-dominant to **pink-dominant**
- Added rose gold as a bridging accent between amber and magenta

### Depth Enhancement
- Deeper background (`#050508`) creates more dramatic contrast
- Radial gradient with warm glow adds atmospheric depth
- Higher light intensities (2.2 and 1.6) match reference's drama

### Color Harmony
The new palette creates a **golden hour** aesthetic:
- Warm golden amber (key light)
- Cool cyan (fill light)
- Pink-magenta (rim light)
- Rose gold (subtle accent)

This triadic warm-cool-warm progression matches the reference's sophisticated lighting.

## CSS Variable Summary

```css
:root {
  /* Deepened backgrounds */
  --color-void: #050508;        /* was #0a0a0c */
  --color-obsidian: #0a0a0f;    /* was #121216 */

  /* Warmer amber tones */
  --color-amber: #ffaa00;       /* was #ff9500 */
  --color-amber-glow: #ffcc33;  /* was #ffb340 */

  /* Pink-shifted magenta */
  --color-magenta: #d946ef;     /* was #8b5cf6 */
  --color-magenta-glow: #e879f9; /* was #a78bfa */

  /* New rose gold accents */
  --color-rose: #f472b6;
  --color-rose-glow: #fda4af;

  /* Unchanged */
  --color-cyan: #00d4ff;
  --color-cyan-dim: #0088aa;
}
```

## Browser Rendering

All colors use standard hex notation compatible with:
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Three.js color system (converts hex to RGB automatically)
- CSS custom properties (fully supported)

## Performance Impact

- Zero performance impact (color changes only)
- Build size: ~13.3KB CSS (unchanged)
- No additional DOM elements or complex calculations
