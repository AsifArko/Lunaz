/**
 * Lunaz theme tokens — centralized design system values.
 */

export * from './colors';
export * from './spacing';
export * from './typography';

// Re-export combined theme object for convenience
import { colors } from './colors';
import { spacing, radii } from './spacing';
import { fontSizes, fontWeights, lineHeights, letterSpacings } from './typography';

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
