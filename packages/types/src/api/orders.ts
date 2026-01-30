import type { Order, OrderAddress } from '../order.js';
import type { OrderStatus } from '../enums.js';
import type { Id } from '../user.js';
import type { ListQueryParams, PaginatedResponse } from './common.js';

/** GET /orders query params */
export interface ListOrdersQuery extends ListQueryParams {
  status?: OrderStatus;
  userId?: Id;
}

/** GET /orders response */
export type ListOrdersResponse = PaginatedResponse<Order>;

/** POST /orders (Create order from cart) */
export interface CreateOrderRequest {
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  notes?: string;
}

/** Order response (single) */
export type OrderResponse = Order;

/** PATCH /orders/:id/status */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}
