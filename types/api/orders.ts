import type { Order } from '../../interfaces/order';
import type { PaginatedResponse } from '../../interfaces/common';

/** GET /orders response */
export type ListOrdersResponse = PaginatedResponse<Order>;

/** Order response (single) */
export type OrderResponse = Order;
