import { z } from 'zod';

export const replaceCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    ),
  }),
});

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1),
  }),
});

export type ReplaceCartInput = z.infer<typeof replaceCartSchema>['body'];
export type AddCartItemInput = z.infer<typeof addCartItemSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
