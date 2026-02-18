import type { Category } from 'interfaces/category';

/** Category with children (nested tree). */
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
