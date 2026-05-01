import type { ProductImage } from 'interfaces/product';

/** POST /products/:id/images — upload; response includes new image */
export interface ProductImageUploadResponse {
  image: ProductImage;
}
