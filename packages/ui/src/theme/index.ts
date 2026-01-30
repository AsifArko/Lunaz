/**
 * Lunaz theme tokens — centralized design system values.
 */

export * from './colors.js';
export * from './spacing.js';
export * from './typography.js';

// Re-export combined theme object for convenience
import { colors } from './colors.js';
import { spacing, radii } from './spacing.js';
import { fontSizes, fontWeights, lineHeights, letterSpacings } from './typography.js';

export const theme = {
  colors,
  spacing,
  radii,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
} as const;

export type Theme = typeof theme;
