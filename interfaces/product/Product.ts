import type { Id } from '../../types/id';
import type { ProductStatus } from '../../constants/enums';
import type { ProductVariant } from './ProductVariant';
import type { ProductImage } from './ProductImage';

/** Product entity. */
export interface Product {
  id: Id;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: Id;
  status: ProductStatus;
  basePrice: number;
  currency: string;
  variants: ProductVariant[];
  images: ProductImage[];
  meta?: { title?: string; description?: string } | null;
  createdAt: string;
  updatedAt: string;
}
