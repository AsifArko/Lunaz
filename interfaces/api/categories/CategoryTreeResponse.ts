import type { CategoryWithChildren } from './CategoryWithChildren';

/** GET /categories/tree response */
export interface CategoryTreeResponse {
  categories: CategoryWithChildren[];
}
