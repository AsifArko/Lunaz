import type { OrderAddress } from 'interfaces/order';

/** POST /orders (Create order from cart) */
export interface CreateOrderRequest {
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  notes?: string;
}
