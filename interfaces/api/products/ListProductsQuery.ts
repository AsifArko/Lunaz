import type { ProductStatus } from 'constants/enums';
import type { Id } from 'types/id';
import type { ListQueryParams } from 'interfaces/common';

/** GET /products query params */
export interface ListProductsQuery extends ListQueryParams {
  category?: Id;
  status?: ProductStatus;
  search?: string;
}
