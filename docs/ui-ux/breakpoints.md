# Breakpoints — Responsive Design

## Viewport Definitions

| Name    | Min     | Max    | Tailwind    | Description                    |
| ------- | ------- | ------ | ----------- | ------------------------------ |
| Mobile  | 0       | 639px  | (default)   | Single column, touch-optimized |
| Tablet  | 640px   | 1023px | sm, md      | 2-column grids, hybrid nav     |
| Desktop | 1024px+ | —      | lg, xl, 2xl | Full layout, hover states      |

## Usage Guidelines

- **Mobile-first**: Base styles for mobile; enhance for larger screens
- **Same components**: Use responsive props/classes, not separate components
- **Touch targets**: Min 44×44px on mobile
- **Readable line length**: Max ~65ch for body text on desktop
