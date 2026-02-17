import type { ProductStatus } from '../../../constants/enums';
import type { Id } from '../../../types/id';
import type { ProductVariant } from '../../product';

/** POST /products (Create product) */
export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  categoryId: Id;
  status: ProductStatus;
  basePrice: number;
  currency: string;
  variants: ProductVariant[];
  meta?: { title?: string; description?: string };
}
