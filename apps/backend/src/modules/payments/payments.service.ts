import { PaymentMethod, PaymentStatus, type Payment } from '@lunaz/types';
import { PaymentModel, type PaymentDocument } from './payments.model.js';
import { OrderModel } from '../orders/orders.model.js';
import { getSettings } from '../settings/settings.model.js';
import {
  BkashGateway,
  NagadGateway,
  SSLCommerzGateway,
  BankTransferGateway,
  type CreatePaymentResult,
  type OrderInfo,
} from './gateways/index.js';

// Gateway instances (lazy initialized)
let bkashGateway: BkashGateway | null = null;
let nagadGateway: NagadGateway | null = null;
let sslcommerzGateway: SSLCommerzGateway | null = null;
let bankTransferGateway: BankTransferGateway | null = null;

function getBkashGateway(): BkashGateway {
  if (!bkashGateway) bkashGateway = new BkashGateway();
  return bkashGateway;
}

function getNagadGateway(): NagadGateway {
  if (!nagadGateway) nagadGateway = new NagadGateway();
  return nagadGateway;
}

function getSSLCommerzGateway(): SSLCommerzGateway {
  if (!sslcommerzGateway) sslcommerzGateway = new SSLCommerzGateway();
  return sslcommerzGateway;
}

function getBankTransferGateway(): BankTransferGateway {
  if (!bankTransferGateway) bankTransferGateway = new BankTransferGateway();
  return bankTransferGateway;
}

/**
 * Get expiry time based on payment method.
 */
function getExpiryTime(method: PaymentMethod): Date {
  const now = new Date();
  switch (method) {
    case PaymentMethod.BKASH:
    case PaymentMethod.NAGAD:
    case PaymentMethod.CARD:
      return new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    case PaymentMethod.BANK_TRANSFER:
      return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days for COD
  }
}

/**
 * Format payment document for API response.
 */
export function formatPayment(payment: PaymentDocument): Payment {
  const obj = payment.toObject();
  return {
    id: obj._id.toString(),
    orderId: obj.orderId.toString(),
    userId: obj.userId.toString(),
    method: obj.method,
    status: obj.status,
    amount: obj.amount,
    currency: obj.currency,
    gatewayTransactionId: obj.gatewayTransactionId,
    gatewayPaymentId: obj.gatewayPaymentId,
    gatewayResponse: obj.gatewayResponse,
    bkash: obj.bkash,
    nagad: obj.nagad,
    bankTransfer: obj.bankTransfer
      ? {
          ...obj.bankTransfer,
          transferDate: obj.bankTransfer.transferDate?.toISOString(),
          verifiedBy: obj.bankTransfer.verifiedBy?.toString(),
          verifiedAt: obj.bankTransfer.verifiedAt?.toISOString(),
        }
      : undefined,
    card: obj.card,
    refund: obj.refund
      ? {
          ...obj.refund,
          refundedAt: obj.refund.refundedAt.toISOString(),
          refundedBy: obj.refund.refundedBy?.toString(),
        }
      : undefined,
    ipAddress: obj.ipAddress,
    userAgent: obj.userAgent,
    failureReason: obj.failureReason,
    expiresAt: obj.expiresAt?.toISOString(),
    createdAt: obj.createdAt.toISOString(),
    updatedAt: obj.updatedAt.toISOString(),
  };
}

/**
 * Check if a payment method is enabled.
 */
export async function isPaymentMethodEnabled(method: PaymentMethod): Promise<boolean> {
  const settings = await getSettings();
  const enabledMethods = settings.payments?.enabledMethods || [];

  if (!enabledMethods.includes(method)) {
    return false;
  }

  // Check individual method settings
  switch (method) {
    case PaymentMethod.BKASH:
      return settings.payments?.bkash?.enabled ?? false;
    case PaymentMethod.NAGAD:
      return settings.payments?.nagad?.enabled ?? false;
    case PaymentMethod.BANK_TRANSFER:
      return settings.payments?.bankTransfer?.enabled ?? true;
    case PaymentMethod.CARD:
      return settings.payments?.sslcommerz?.enabled ?? false;
    case PaymentMethod.CASH_ON_DELIVERY:
      return settings.payments?.cod?.enabled ?? true;
    default:
      return false;
  }
}

/**
 * Get all enabled payment methods.
 */
export async function getEnabledPaymentMethods() {
  const settings = await getSettings();
  const methods = [];

  if (settings.payments?.bkash?.enabled) {
    methods.push({
      id: PaymentMethod.BKASH,
      name: 'bKash',
      description: 'Pay with bKash mobile wallet',
      enabled: true,
    });
  }

  if (settings.payments?.nagad?.enabled) {
    methods.push({
      id: PaymentMethod.NAGAD,
      name: 'Nagad',
      description: 'Pay with Nagad mobile wallet',
      enabled: true,
    });
  }

  if (settings.payments?.bankTransfer?.enabled) {
    methods.push({
      id: PaymentMethod.BANK_TRANSFER,
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      enabled: true,
    });
  }

  if (settings.payments?.sslcommerz?.enabled) {
    methods.push({
      id: PaymentMethod.CARD,
      name: 'Card Payment',
      description: 'Credit/Debit card via SSLCommerz',
      enabled: true,
    });
  }

  if (settings.payments?.cod?.enabled) {
    methods.push({
      id: PaymentMethod.CASH_ON_DELIVERY,
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      enabled: true,
    });
  }

  return methods;
}

/**
 * Initiate a payment for an order.
 */
export async function initiatePayment(
  orderId: string,
  method: PaymentMethod,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ paymentId: string } & CreatePaymentResult> {
  // Verify method is enabled
  const isEnabled = await isPaymentMethodEnabled(method);
  if (!isEnabled) {
    throw Object.assign(new Error('Payment method is not enabled'), {
      statusCode: 400,
    });
  }

  // Get order
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  }

  if (order.userId.toString() !== userId) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  // Check if order already has a completed payment
  if (order.paymentStatus === PaymentStatus.PAID) {
    throw Object.assign(new Error('Order is already paid'), { statusCode: 400 });
  }

  // Create payment record
  const payment = await PaymentModel.create({
    orderId,
    userId,
    method,
    amount: order.total,
    currency: order.currency,
    status: PaymentStatus.INITIATED,
    expiresAt: getExpiryTime(method),
    ipAddress,
    userAgent,
  });

  // Update order with payment method
  await OrderModel.findByIdAndUpdate(orderId, {
    paymentMethod: method,
    paymentId: payment._id,
  });

  // Build order info for gateways
  const orderInfo: OrderInfo = {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    total: order.total,
    currency: order.currency,
    userId: order.userId.toString(),
    shippingAddress: order.shippingAddress,
  };

  // Initiate with gateway
  let result: CreatePaymentResult;
  switch (method) {
    case PaymentMethod.BKASH:
      result = await getBkashGateway().createPayment(payment, orderInfo);
      break;
    case PaymentMethod.NAGAD:
      result = await getNagadGateway().createPayment(payment, orderInfo);
      break;
    case PaymentMethod.CARD:
      result = await getSSLCommerzGateway().createPayment(payment, orderInfo);
      break;
    case PaymentMethod.BANK_TRANSFER:
      result = await getBankTransferGateway().createPayment(payment, orderInfo);
      break;
    case PaymentMethod.CASH_ON_DELIVERY:
      result = await handleCOD(payment, order);
      break;
    default:
      throw Object.assign(new Error('Invalid payment method'), {
        statusCode: 400,
      });
  }

  return {
    paymentId: payment._id.toString(),
    ...result,
  };
}

/**
 * Handle Cash on Delivery payment.
 */
async function handleCOD(
  payment: PaymentDocument,
  order: { _id: unknown }
): Promise<CreatePaymentResult> {
  // COD doesn't need gateway processing
  payment.status = PaymentStatus.PENDING;
  await payment.save();

  // Update order to processing (will be paid on delivery)
  await OrderModel.findByIdAndUpdate(order._id, {
    status: 'processing',
  });

  return {
    message: 'Order placed successfully. Pay on delivery.',
    instructions: 'Please keep exact change ready for the delivery person.',
  };
}

/**
 * Handle payment callback from gateway.
 */
export async function handleCallback(
  method: PaymentMethod,
  data: unknown
): Promise<PaymentDocument> {
  switch (method) {
    case PaymentMethod.BKASH:
      return getBkashGateway().handleCallback(data);
    case PaymentMethod.NAGAD:
      return getNagadGateway().handleCallback(data);
    case PaymentMethod.CARD:
      return getSSLCommerzGateway().handleCallback(data);
    default:
      throw Object.assign(new Error('Invalid callback method'), {
        statusCode: 400,
      });
  }
}

/**
 * Verify bank transfer payment (admin action).
 */
export async function verifyBankTransfer(
  paymentId: string,
  verified: boolean,
  adminId: string,
  notes?: string
): Promise<PaymentDocument> {
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) {
    throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
  }

  if (payment.method !== PaymentMethod.BANK_TRANSFER) {
    throw Object.assign(new Error('Not a bank transfer payment'), {
      statusCode: 400,
    });
  }

  if (verified) {
    payment.status = PaymentStatus.PAID;
    payment.bankTransfer = {
      ...payment.bankTransfer,
      verifiedBy: adminId as unknown as undefined, // Will be cast by mongoose
      verifiedAt: new Date(),
      notes,
    };

    // Update order
    await OrderModel.findByIdAndUpdate(payment.orderId, {
      paymentStatus: PaymentStatus.PAID,
      paidAt: new Date(),
      status: 'processing',
    });
  } else {
    payment.status = PaymentStatus.FAILED;
    payment.failureReason = notes || 'Bank transfer verification failed';
  }

  await payment.save();
  return payment;
}

/**
 * Submit bank transfer proof (customer action).
 */
export async function submitBankTransferProof(
  paymentId: string,
  userId: string,
  proofUrl: string,
  transactionReference: string,
  bankName?: string
): Promise<PaymentDocument> {
  return getBankTransferGateway().submitProof(
    paymentId,
    userId,
    proofUrl,
    transactionReference,
    bankName
  );
}

/**
 * Process refund for a payment.
 */
export async function processRefund(
  paymentId: string,
  amount: number,
  reason: string,
  adminId: string
): Promise<PaymentDocument> {
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) {
    throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
  }

  if (payment.status !== PaymentStatus.PAID) {
    throw Object.assign(new Error('Payment must be paid to refund'), {
      statusCode: 400,
    });
  }

  if (amount > payment.amount) {
    throw Object.assign(new Error('Refund amount exceeds payment amount'), {
      statusCode: 400,
    });
  }

  let refundResult;
  switch (payment.method) {
    case PaymentMethod.BKASH:
      refundResult = await getBkashGateway().refund(payment, amount);
      break;
    case PaymentMethod.NAGAD:
      refundResult = await getNagadGateway().refund(payment, amount);
      break;
    case PaymentMethod.CARD:
      refundResult = await getSSLCommerzGateway().refund(payment, amount);
      break;
    case PaymentMethod.BANK_TRANSFER:
    case PaymentMethod.CASH_ON_DELIVERY:
      // Manual refund process
      refundResult = { transactionId: `MANUAL_${Date.now()}` };
      break;
    default:
      throw Object.assign(new Error('Invalid payment method for refund'), {
        statusCode: 400,
      });
  }

  const isFullRefund = amount >= payment.amount;
  payment.status = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
  payment.refund = {
    amount,
    reason,
    refundedAt: new Date(),
    refundTransactionId: refundResult.transactionId,
    refundedBy: adminId as unknown as undefined,
  };

  await payment.save();

  // Update order
  await OrderModel.findByIdAndUpdate(payment.orderId, {
    paymentStatus: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
  });

  return payment;
}

/**
 * Get payment by ID.
 */
export async function getPayment(
  paymentId: string,
  userId?: string,
  isAdmin = false
): Promise<PaymentDocument> {
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) {
    throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
  }

  // Check authorization
  if (!isAdmin && userId && payment.userId.toString() !== userId) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  return payment;
}

/**
 * Get payment by order ID.
 */
export async function getPaymentByOrder(
  orderId: string,
  userId?: string,
  isAdmin = false
): Promise<PaymentDocument | null> {
  const payment = await PaymentModel.findOne({ orderId }).sort({
    createdAt: -1,
  });

  if (!payment) return null;

  // Check authorization
  if (!isAdmin && userId && payment.userId.toString() !== userId) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  return payment;
}

/**
 * List payments with filters (admin).
 */
export async function listPayments(filters: {
  status?: PaymentStatus;
  method?: PaymentMethod;
  orderId?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const { status, method, orderId, userId, from, to, page = 1, limit = 20 } = filters;

  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (method) query.method = method;
  if (orderId) query.orderId = orderId;
  if (userId) query.userId = userId;

  if (from || to) {
    query.createdAt = {};
    if (from) (query.createdAt as Record<string, Date>).$gte = new Date(from);
    if (to) (query.createdAt as Record<string, Date>).$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    PaymentModel.find(query)
      .populate('orderId', 'orderNumber total')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PaymentModel.countDocuments(query),
  ]);

  return {
    items: payments.map(formatPayment),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get pending bank transfers (admin).
 */
export async function getPendingBankTransfers() {
  const payments = await PaymentModel.find({
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PROCESSING,
  })
    .populate('orderId', 'orderNumber total')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  return payments.map(formatPayment);
}
