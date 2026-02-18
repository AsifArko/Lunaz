import type { Id } from 'types/id';

/** Cart line item. */
export interface CartItem {
  id: Id;
  productId: Id;
  variantId: string;
  quantity: number;
  addedAt?: string;
}
