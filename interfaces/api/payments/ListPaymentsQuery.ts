import type { Id } from 'types/id';
import type { PaymentStatus, PaymentMethod } from 'constants/enums';
import type { ListQueryParams } from 'interfaces/common';

/** Query params for listing payments (admin). */
export interface ListPaymentsQuery extends ListQueryParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  orderId?: Id;
  userId?: Id;
  from?: string;
  to?: string;
}
