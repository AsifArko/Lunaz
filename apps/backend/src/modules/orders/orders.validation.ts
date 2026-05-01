import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '../../constants/enums';

const addressSchema = z.object({
  name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(1), // Accept full country names or codes
});

const manualOrderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    notes: z.string().optional(),
  }),
});

const paymentMethodValues = Object.values(PaymentMethod) as [string, ...string[]];

export const createManualOrderSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    items: z.array(manualOrderItemSchema).min(1, 'At least one item is required'),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    shippingAmount: z.number().min(0).optional(),
    transactionId: z.string().optional(),
    paymentMethod: z.enum(paymentMethodValues).optional(),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ]),
    notes: z.string().optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type CreateManualOrderInput = z.infer<typeof createManualOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
