import type { Id } from './user.js';

/** Cart line item. */
export interface CartItem {
  id: Id;
  productId: Id;
  variantId: string;
  quantity: number;
  addedAt?: string;
}

/** Cart entity (logged-in user). */
export interface Cart {
  id: Id;
  userId: Id;
  items: CartItem[];
  updatedAt: string;
}
