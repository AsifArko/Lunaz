import type { CreateProductRequest } from './CreateProductRequest';

/** PATCH /products/:id (Update product) */
export interface UpdateProductRequest extends Partial<CreateProductRequest> {}
