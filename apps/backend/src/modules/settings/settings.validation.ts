import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    storeName: z.string().min(1).max(100).optional(),
    storeEmail: z.string().email().optional().or(z.literal('')),
    supportEmail: z.string().email().optional().or(z.literal('')),
    currency: z.string().length(3).optional(),
    freeShippingThreshold: z.number().min(0).optional(),
    flatShippingRate: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    taxIncludedInPrices: z.boolean().optional(),
    orderPrefix: z.string().min(1).max(10).optional(),
    allowGuestCheckout: z.boolean().optional(),
    requireEmailVerification: z.boolean().optional(),
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
