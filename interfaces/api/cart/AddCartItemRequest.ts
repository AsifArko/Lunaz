import type { Id } from '../../../types/id';

/** POST /cart/items — add item to cart */
export interface AddCartItemRequest {
  productId: Id;
  variantId: string;
  quantity: number;
}
