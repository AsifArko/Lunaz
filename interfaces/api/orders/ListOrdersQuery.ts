import type { OrderStatus } from 'constants/enums';
import type { Id } from 'types/id';
import type { ListQueryParams } from 'interfaces/common';

/** GET /orders query params */
export interface ListOrdersQuery extends ListQueryParams {
  status?: OrderStatus;
  userId?: Id;
}
