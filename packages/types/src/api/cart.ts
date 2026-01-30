import type { CartItem } from '../cart.js';
import type { Product } from '../product.js';
import type { Id } from '../user.js';

/** Cart item with product details (for display). */
export interface CartItemWithProduct extends CartItem {
  product: Product;
  variantName: string;
  unitPrice: number;
  total: number;
}

/** GET /cart response */
export interface CartResponse {
  id: Id;
  userId: Id;
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}

/** POST /cart/items — add item to cart */
export interface AddCartItemRequest {
  productId: Id;
  variantId: string;
  quantity: number;
}

/** PATCH /cart/items/:itemId — update item quantity */
export interface UpdateCartItemRequest {
  quantity: number;
}

/** Cart item update response */
export interface CartItemResponse {
  item: CartItemWithProduct;
  subtotal: number;
  itemCount: number;
}

/** POST /cart/clear response */
export interface ClearCartResponse {
  success: boolean;
  message: string;
}
