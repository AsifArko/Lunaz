import mongoose from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../constants/enums';

const orderAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String, required: true },
  productName: { type: String, required: true },
  variantName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  imageUrl: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingAmount: { type: Number, default: 0 },
    taxAmount: Number,
    total: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    shippingAddress: { type: orderAddressSchema, required: true },
    billingAddress: orderAddressSchema,
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    paymentIntentId: String,
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paidAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Index already defined via `unique: true` on orderNumber field
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const OrderModel = mongoose.model('Order', orderSchema);
