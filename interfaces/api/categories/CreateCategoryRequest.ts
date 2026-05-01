import type { Id } from 'types/id';

/** POST /categories — create category. Images added via POST /categories/:id/images and /images/url */
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: Id | null;
  order?: number;
}
