import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus } from '@lunaz/types';
import { OrderModel } from './orders.model.js';
import { CartModel } from '../cart/cart.model.js';
import { ProductModel } from '../products/products.model.js';
import { UserModel } from '../auth/auth.model.js';
import { OAUTH_PENDING_PHONE } from '../auth/auth.service.js';
import type { CreateOrderInput, UpdateOrderStatusInput } from './orders.validation.js';

function createError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

function formatOrder(doc: Record<string, unknown>, customerName?: string) {
  const shippingAddress = doc.shippingAddress as Record<string, unknown> | undefined;
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    orderNumber: doc.orderNumber,
    userId: (doc.userId as mongoose.Types.ObjectId).toString(),
    customerName: customerName || (shippingAddress?.name as string) || undefined,
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
  const userDoc = await UserModel.findById(userId).select('phone').lean();
  const phone = userDoc && (userDoc as { phone?: string }).phone;
  if (phone === OAUTH_PENDING_PHONE) {
    throw createError(
      'Please add your phone number in Account → Profile to place orders (required for order management).',
      400
    );
  }

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
    currency: 'BDT', // Bangladeshi Taka
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    paymentStatus: PaymentStatus.PENDING,
    notes: input.notes,
  });

  // Clear cart after successful order creation
  await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } });

  // Fetch customer name for the response
  const userProfile = await UserModel.findById(userId, { name: 1 }).lean();
  const customerName = userProfile?.name as string | undefined;

  return formatOrder(order.toObject(), customerName);
}

export async function listOrders(
  userId: string,
  isAdmin: boolean,
  query: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) {
  const filter: Record<string, unknown> = isAdmin ? {} : { userId };
  if (query.status) filter.status = query.status;

  // Date range filter
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      (filter.createdAt as Record<string, Date>).$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      // Set end date to end of day
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      (filter.createdAt as Record<string, Date>).$lte = endDate;
    }
  }

  // Search filter - search by order number OR customer name
  if (query.search && isAdmin) {
    // First, find users whose names match the search
    const matchingUsers = await UserModel.find(
      { name: { $regex: query.search, $options: 'i' } },
      { _id: 1 }
    ).lean();
    const matchingUserIds = matchingUsers.map((u) => u._id);

    // Search by order number OR by matching user IDs
    filter.$or = [
      { orderNumber: { $regex: query.search, $options: 'i' } },
      ...(matchingUserIds.length > 0 ? [{ userId: { $in: matchingUserIds } }] : []),
    ];
  } else if (query.search) {
    // Non-admin: only search by order number
    filter.orderNumber = { $regex: query.search, $options: 'i' };
  }

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

  // Fetch user names for all orders
  const userIds = [...new Set(orders.map((o) => o.userId.toString()))];
  const users = await UserModel.find({ _id: { $in: userIds } }, { _id: 1, name: 1 }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u.name as string]));

  return {
    data: orders.map((order) => formatOrder(order, userMap.get(order.userId.toString()))),
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

  // Fetch customer name
  const user = await UserModel.findById(order.userId, { name: 1 }).lean();
  const customerName = user?.name as string | undefined;

  return formatOrder(order, customerName);
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

  // Fetch customer name
  const user = await UserModel.findById(order.userId, { name: 1 }).lean();
  const customerName = user?.name as string | undefined;

  return formatOrder(order.toObject(), customerName);
}
