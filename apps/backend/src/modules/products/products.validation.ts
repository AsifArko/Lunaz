import { z } from 'zod';
import { ProductStatus } from '@lunaz/types';

const variantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().optional(),
  priceOverride: z.number().optional(),
  stock: z.number().int().optional(),
  attributes: z.record(z.string()).optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
    description: z.string().optional(),
    categoryId: z.string().min(1),
    status: z.enum([ProductStatus.DRAFT, ProductStatus.PUBLISHED]).default(ProductStatus.DRAFT),
    basePrice: z.number().min(0),
    currency: z.string().default('USD'),
    variants: z.array(variantSchema).default([]),
    meta: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional().nullable(),
    categoryId: z.string().min(1).optional(),
    status: z.enum([ProductStatus.DRAFT, ProductStatus.PUBLISHED]).optional(),
    basePrice: z.number().min(0).optional(),
    currency: z.string().optional(),
    variants: z.array(variantSchema).optional(),
    meta: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }).optional().nullable(),
  }),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  status: z.enum([ProductStatus.DRAFT, ProductStatus.PUBLISHED]).optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['createdAt', 'name', 'basePrice']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
