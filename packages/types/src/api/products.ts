import type { ProductStatus } from '../enums.js';
import type { Product, ProductImage, ProductVariant } from '../product.js';
import type { Id } from '../user.js';
import type { ListQueryParams, PaginatedResponse } from './common.js';

/** GET /products query params */
export interface ListProductsQuery extends ListQueryParams {
  category?: Id;
  status?: ProductStatus;
  search?: string;
}

/** GET /products response */
export type ListProductsResponse = PaginatedResponse<Product>;

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

/** PATCH /products/:id (Update product) */
export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

/** Product response (single) */
export type ProductResponse = Product;

/** POST /products/:id/images — upload; response includes new image */
export interface ProductImageUploadResponse {
  image: ProductImage;
}
