# Lunaz UI/UX Documentation

This folder contains design specifications and UI/UX documentation for each feature of the Lunaz application. Documentation is created **before** implementation to ensure consistent, professional, and responsive experiences across all devices.

## Design Philosophy

- **Off-white gray color scheme** — Soft, sophisticated neutrals
- **Mild transparency** — Glassmorphism and subtle overlays
- **Smooth transitions** — 300–400ms ease for all interactive elements
- **Futuristic minimalist** — Clean lines, ample whitespace, refined typography

## Structure

Each feature has its own subfolder with viewport-specific documentation:

```
ui-ux/
├── README.md
├── design-tokens.md          # Shared theme, colors, typography
├── breakpoints.md            # Mobile, tablet, desktop breakpoints
└── homepage/
    ├── README.md             # Overview & component map
    ├── mobile/
    │   └── spec.md           # Mobile-specific layout & behavior
    ├── tablet/
    │   └── spec.md           # Tablet-specific layout & behavior
    └── desktop/
        └── spec.md           # Desktop-specific layout & behavior
```

## Breakpoints

| Viewport | Min Width | Max Width | Tailwind Prefix |
| -------- | --------- | --------- | --------------- |
| Mobile   | 0         | 639px     | (default)       |
| Tablet   | 640px     | 1023px    | sm, md          |
| Desktop  | 1024px+   | —         | lg, xl, 2xl     |

## Workflow

1. Create feature folder (e.g., `homepage/`)
2. Document mobile, tablet, and desktop specs
3. Implement using shared components with responsive variants
4. Validate against specs
