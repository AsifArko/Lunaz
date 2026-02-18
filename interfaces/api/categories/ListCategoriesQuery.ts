import type { Id } from 'types/id';
import type { ListQueryParams } from 'interfaces/common';

/** GET /categories query params */
export interface ListCategoriesQuery extends ListQueryParams {
  parentId?: Id | null;
  includeChildren?: boolean;
}
