import type { CartItemWithProduct } from './CartItemWithProduct';

/** Cart item update response */
export interface CartItemResponse {
  item: CartItemWithProduct;
  subtotal: number;
  itemCount: number;
}
