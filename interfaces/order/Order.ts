import type { Id } from '../../types/id';
import type { OrderStatus, PaymentStatus, PaymentMethod } from '../../constants/enums';
import type { OrderAddress } from './OrderAddress';
import type { OrderItem } from './OrderItem';

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
