import type { Id } from 'types/id';
import type { CartItemWithProduct } from './CartItemWithProduct';

/** GET /cart response */
export interface CartResponse {
  id: Id;
  userId: Id;
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}
