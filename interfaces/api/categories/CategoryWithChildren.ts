import type { Category } from '../../category';

/** Category with children (nested tree). */
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
