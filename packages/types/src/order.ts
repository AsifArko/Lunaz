import type { Id } from './user.js';
import type { OrderStatus, PaymentStatus } from './enums.js';

/** Snapshot of shipping/billing address on order. */
export interface OrderAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/** Order line item (snapshot at order time). */
export interface OrderItem {
  productId: Id;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl?: string;
}

/** Order entity. */
export interface Order {
  id: Id;
  orderNumber: string;
  userId: Id;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount?: number;
  total: number;
  currency: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentIntentId?: string;
  paymentStatus: PaymentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
