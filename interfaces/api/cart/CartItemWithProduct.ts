import type { CartItem } from 'interfaces/cart';
import type { Product } from 'interfaces/product';

/** Cart item with product details (for display). */
export interface CartItemWithProduct extends CartItem {
  product: Product;
  variantName: string;
  unitPrice: number;
  total: number;
}
