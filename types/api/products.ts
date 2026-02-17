import type { Product } from '../../interfaces/product';
import type { PaginatedResponse } from '../../interfaces/common';

/** GET /products response */
export type ListProductsResponse = PaginatedResponse<Product>;

/** Product response (single) */
export type ProductResponse = Product;
