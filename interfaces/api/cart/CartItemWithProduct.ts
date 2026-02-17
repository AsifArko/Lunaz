import type { CartItem } from '../../cart';
import type { Product } from '../../product';

/** Cart item with product details (for display). */
export interface CartItemWithProduct extends CartItem {
  product: Product;
  variantName: string;
  unitPrice: number;
  total: number;
}
