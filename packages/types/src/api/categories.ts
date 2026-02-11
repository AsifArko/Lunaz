import type { Category } from '../category.js';
import type { Id } from '../user.js';
import type { ListQueryParams, PaginatedResponse } from './common.js';

/** GET /categories query params */
export interface ListCategoriesQuery extends ListQueryParams {
  parentId?: Id | null;
  includeChildren?: boolean;
}

/** GET /categories response */
export type ListCategoriesResponse = PaginatedResponse<Category>;

/** Category with children (nested tree). */
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

/** GET /categories/tree response */
export interface CategoryTreeResponse {
  categories: CategoryWithChildren[];
}

/** POST /categories — create category. Images added via POST /categories/:id/images and /images/url */
export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: Id | null;
  order?: number;
}

/** PATCH /categories/:id — update category */
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

/** Category response (single) */
export type CategoryResponse = Category;

/** DELETE /categories/:id response */
export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}
