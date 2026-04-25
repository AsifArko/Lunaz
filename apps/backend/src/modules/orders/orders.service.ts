import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus, UserRole } from '../../constants/enums';
import { OrderModel } from './orders.model.js';
import { CartModel } from '../cart/cart.model.js';
import { ProductModel } from '../products/products.model.js';
import { UserModel } from '../auth/auth.model.js';
import { OAUTH_PENDING_PHONE } from '../auth/auth.service.js';
import { getSettings } from '../settings/settings.model.js';
import type {
  CreateOrderInput,
  CreateManualOrderInput,
  UpdateOrderStatusInput,
} from './orders.validation.js';

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

async function generateOrderNumber(prefix: string = 'LN'): Promise<string> {
  const count = await OrderModel.countDocuments();
  return `${prefix}-${String(count + 10001).padStart(6, '0')}`;
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

  // Get settings early for allowBackorder validation
  const settings = await getSettings();
  const allowBackorder = settings.allowBackorder ?? false;

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

    const variants = product.variants ?? [];
    const variant = variants.find((v: { id?: string }) => v?.id === cartItem.variantId);
    if (!variant) {
      throw createError(
        `Variant ${cartItem.variantId} not found for product ${(product as { name: string }).name}. Ensure the product has variants.`,
        400
      );
    }

    // Stock validation: when allowBackorder is false, reject if quantity exceeds available stock
    if (!allowBackorder) {
      const availableStock = variant.stock;
      if (
        availableStock !== undefined &&
        availableStock !== null &&
        cartItem.quantity > availableStock
      ) {
        throw createError(
          `Insufficient stock for ${(product as { name: string }).name} - ${variant.name}. Available: ${availableStock}, requested: ${cartItem.quantity}.`,
          400
        );
      }
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

  // Use settings for tax, currency, order prefix, and auto-confirm
  const enableTax = settings.enableTax ?? false;
  const taxRate = (settings.taxRate ?? 0) / 100;
  const taxIncludedInPrices = settings.taxIncludedInPrices ?? false;
  const autoConfirmOrders = settings.autoConfirmOrders ?? false;

  // Calculate tax
  let taxAmount = 0;
  if (enableTax && taxRate > 0) {
    if (taxIncludedInPrices) {
      const preTax = subtotal / (1 + taxRate);
      taxAmount = Math.round(subtotal - preTax);
    } else {
      taxAmount = Math.round(subtotal * taxRate);
    }
  }

  // Shipping: Inside Dhaka vs Outside Dhaka (flat rate)
  const shippingCity = input.shippingAddress?.city ?? '';
  const isInsideDhaka = shippingCity.toLowerCase().includes('dhaka');
  const shippingAmount = isInsideDhaka
    ? (settings.shippingInsideDhaka ?? 100)
    : (settings.shippingOutsideDhaka ?? 150);
  const totalAmount = subtotal + shippingAmount + taxAmount;

  // Create order - use CONFIRMED if auto-confirm is enabled
  const initialStatus = autoConfirmOrders ? OrderStatus.CONFIRMED : OrderStatus.PENDING;
  const orderPrefix = settings.orderPrefix ?? 'LN';
  const orderNumber = await generateOrderNumber(orderPrefix);
  const order = await OrderModel.create({
    orderNumber,
    userId,
    status: initialStatus,
    items: orderItems,
    subtotal,
    shippingAmount,
    taxAmount,
    total: totalAmount,
    currency: settings.currency ?? 'BDT',
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

export async function createManualOrder(_adminId: string, input: CreateManualOrderInput) {
  const userId = input.userId;

  const userDoc = await UserModel.findById(userId).select('role name').lean();
  if (!userDoc) throw createError('Customer not found', 404);
  if ((userDoc as { role: string }).role !== UserRole.CUSTOMER) {
    throw createError('User is not a customer', 400);
  }

  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) throw createError(`Product ${item.productId} not found`, 400);

    const variant = (
      product.variants as { id: string; name: string; priceOverride?: number }[]
    ).find((v) => v.id === item.variantId);
    if (!variant) {
      throw createError(
        `Variant ${item.variantId} not found for product ${(product as { name: string }).name}`,
        400
      );
    }

    const unitPrice = variant.priceOverride ?? (product as { basePrice: number }).basePrice;
    const total = unitPrice * item.quantity;
    subtotal += total;

    orderItems.push({
      productId: new mongoose.Types.ObjectId(item.productId),
      variantId: item.variantId,
      productName: (product as { name: string }).name,
      variantName: variant.name,
      quantity: item.quantity,
      unitPrice,
      total,
      imageUrl: (
        (product as { images?: { url: string }[] }).images?.[0] as { url: string } | undefined
      )?.url,
    });
  }

  const shippingAmount = Number(input.shippingAmount) || 0;
  const taxAmount = 0;
  const totalAmount = subtotal + shippingAmount + taxAmount;

  const orderNumber = await generateOrderNumber();
  const hasTransactionId = Boolean(input.transactionId?.trim());

  const order = await OrderModel.create({
    orderNumber,
    userId: new mongoose.Types.ObjectId(userId),
    status: OrderStatus.PENDING,
    items: orderItems,
    subtotal,
    shippingAmount,
    taxAmount,
    total: totalAmount,
    currency: 'BDT',
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    paymentMethod: input.paymentMethod,
    paymentIntentId: input.transactionId?.trim() || undefined,
    paymentStatus: hasTransactionId ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
    paidAt: hasTransactionId ? new Date() : undefined,
    notes: input.notes,
  });

  const customerName = (userDoc as { name?: string }).name;
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
    userId?: string;
    page?: number;
    limit?: number;
  }
) {
  const filter: Record<string, unknown> = isAdmin ? {} : { userId };
  // When admin requests orders for a specific customer (e.g. customer detail page)
  if (isAdmin && query.userId) {
    filter.userId = new mongoose.Types.ObjectId(query.userId);
  }
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
