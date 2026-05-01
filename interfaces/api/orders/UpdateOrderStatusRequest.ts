import type { OrderStatus } from 'constants/enums';

/** PATCH /orders/:id/status */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}
