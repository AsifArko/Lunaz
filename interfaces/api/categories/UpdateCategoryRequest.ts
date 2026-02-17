import type { CreateCategoryRequest } from './CreateCategoryRequest';

/** PATCH /categories/:id — update category */
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}
