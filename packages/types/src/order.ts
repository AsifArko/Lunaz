import type { Id } from './user.js';
import type { OrderStatus, PaymentStatus, PaymentMethod } from './enums.js';

/** Snapshot of shipping/billing address on order. */
export interface OrderAddress {
  name: string;
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
  customerName?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount?: number;
  total: number;
  currency: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod?: PaymentMethod;
  paymentId?: Id;
  paymentIntentId?: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
