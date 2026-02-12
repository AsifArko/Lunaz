import type { Id } from './user.js';
import type { ProductStatus } from './enums.js';

/** Product variant (size, SKU, price override, stock). */
export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  priceOverride?: number;
  stock?: number;
  attributes?: Record<string, string>;
}

/** Product image (URL from MinIO/S3 or legacy base64 data URL). */
export interface ProductImage {
  id: string;
  url: string;
  order: number;
}

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
