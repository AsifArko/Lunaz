import type { Id } from 'types/id';

/** Order line item (snapshot at order time). */
export interface OrderItem {
  productId: Id;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl?: string;
}
