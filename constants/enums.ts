/**
 * Shared enum constants for Lunaz (Web, Manage, Backend).
 */

export const UserRole = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ProductStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const PaymentStatus = {
  PENDING: 'pending',
  INITIATED: 'initiated',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  EXPIRED: 'expired',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  CASH_ON_DELIVERY: 'cod',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const TransactionType = {
  SALE: 'sale',
  REFUND: 'refund',
  PAYOUT: 'payout',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
