import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus } from '@lunaz/types';
import { OrderModel } from './orders.model.js';
import { CartModel } from '../cart/cart.model.js';
import { ProductModel } from '../products/products.model.js';
import type { CreateOrderInput, UpdateOrderStatusInput } from './orders.validation.js';

function createError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

function formatOrder(doc: Record<string, unknown>) {
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    orderNumber: doc.orderNumber,
    userId: (doc.userId as mongoose.Types.ObjectId).toString(),
    status: doc.status,
    items: doc.items,
    subtotal: doc.subtotal,
    shippingAmount: doc.shippingAmount,
    taxAmount: doc.taxAmount,
    total: doc.total,
    currency: doc.currency,
    shippingAddress: doc.shippingAddress,
    billingAddress: doc.billingAddress,
    paymentIntentId: doc.paymentIntentId,
    paymentStatus: doc.paymentStatus,
    notes: doc.notes,
    createdAt: (doc.createdAt as Date)?.toISOString?.(),
    updatedAt: (doc.updatedAt as Date)?.toISOString?.(),
  };
}

async function generateOrderNumber(): Promise<string> {
  const count = await OrderModel.countDocuments();
  return `LN-${String(count + 10001).padStart(6, '0')}`;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  // Get user's cart
  const cart = await CartModel.findOne({ userId });
  if (!cart || !cart.items.length) {
    throw createError('Cart is empty', 400);
  }

  // Get product details for each cart item
  const productIds = cart.items.map((i) => i.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // Build order items with snapshots
  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = productMap.get(cartItem.productId.toString());
    if (!product) {
      throw createError(`Product ${cartItem.productId} not found`, 400);
    }

    const variant = product.variants.find((v: { id: string }) => v.id === cartItem.variantId);
    if (!variant) {
      throw createError(`Variant ${cartItem.variantId} not found for product ${product.name}`, 400);
    }

    const unitPrice = variant.priceOverride ?? product.basePrice;
    const total = unitPrice * cartItem.quantity;
    subtotal += total;

    orderItems.push({
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      productName: product.name,
      variantName: variant.name,
      quantity: cartItem.quantity,
      unitPrice,
      total,
      imageUrl: product.images?.[0]?.url,
    });
  }

  // Calculate totals (shipping and tax can be configured later)
  const shippingAmount = 0; // TODO: Calculate based on address/config
  const taxAmount = 0; // TODO: Calculate based on address/config
  const totalAmount = subtotal + shippingAmount + taxAmount;

  // Create order
  const orderNumber = await generateOrderNumber();
  const order = await OrderModel.create({
    orderNumber,
    userId,
    status: OrderStatus.PENDING,
    items: orderItems,
    subtotal,
    shippingAmount,
    taxAmount,
    total: totalAmount,
    currency: 'USD',
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    paymentStatus: PaymentStatus.PENDING,
    notes: input.notes,
  });

  // Clear cart after successful order creation
  await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } });

  return formatOrder(order.toObject());
}

export async function listOrders(userId: string, isAdmin: boolean, query: { status?: string; page?: number; limit?: number }) {
  const filter: Record<string, unknown> = isAdmin ? {} : { userId };
  if (query.status) filter.status = query.status;

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    OrderModel.countDocuments(filter),
  ]);

  return {
    data: orders.map(formatOrder),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOrder(userId: string, orderId: string, isAdmin: boolean) {
  const order = await OrderModel.findById(orderId).lean();
  if (!order) throw createError('Order not found', 404);

  if (!isAdmin && order.userId.toString() !== userId) {
    throw createError('Access denied', 403);
  }

  return formatOrder(order);
}

export async function updateOrderStatus(orderId: string, input: UpdateOrderStatusInput) {
  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status: input.status,
        ...(input.notes ? { notes: input.notes } : {}),
      },
    },
    { new: true }
  );

  if (!order) throw createError('Order not found', 404);
  return formatOrder(order.toObject());
}
