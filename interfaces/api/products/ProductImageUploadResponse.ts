import type { ProductImage } from '../../product';

/** POST /products/:id/images — upload; response includes new image */
export interface ProductImageUploadResponse {
  image: ProductImage;
}
