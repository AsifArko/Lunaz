/* eslint-disable no-console */
/**
 * Seed script to create customers, orders, and transactions.
 *
 * Usage:
 *   npx tsx src/scripts/seed-data.ts
 *   # or with npm script:
 *   npm run seed:data
 *
 * Environment variables (loaded from .env automatically):
 *   MONGODB_URI - MongoDB connection string
 *
 * Options:
 *   --clear - Clear existing customers, orders, and transactions before seeding
 *
 * Prerequisites:
 *   - Run seed:products first to have products to order
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {
  UserRole,
  OrderStatus,
  PaymentStatus,
  TransactionType,
  TransactionStatus,
  ProductStatus,
} from '../constants/enums';

// Load .env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// ============================================================================
// SCHEMAS (recreated to avoid import issues in standalone script)
// ============================================================================

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: String,
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    emailVerified: { type: Boolean, default: false },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

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
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingAmount: { type: Number, default: 0 },
    taxAmount: Number,
    total: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    shippingAddress: { type: orderAddressSchema, required: true },
    billingAddress: orderAddressSchema,
    paymentIntentId: String,
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    notes: String,
  },
  { timestamps: true }
);

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    paymentMethod: { type: String, required: true },
    externalId: String,
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sku: String,
  priceOverride: Number,
  stock: Number,
  attributes: mongoose.Schema.Types.Mixed,
});

const imageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  url: { type: String, required: true },
  order: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
    },
    basePrice: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    variants: [variantSchema],
    images: [imageSchema],
    meta: { title: String, description: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);
const OrderModel = mongoose.model('Order', orderSchema);
const TransactionModel = mongoose.model('Transaction', transactionSchema);
const ProductModel = mongoose.model('Product', productSchema);

// ============================================================================
// HELPERS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 11);

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (daysAgo: number): Date => {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
};

// Order number generator
let orderCounter = 1000;
const generateOrderNumber = (): string => {
  orderCounter++;
  return `LNZ-${orderCounter}`;
};

// ============================================================================
// SEED DATA
// ============================================================================

interface CustomerSeed {
  email: string;
  name: string;
  password: string;
  addresses: Array<{
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
}

const customers: CustomerSeed[] = [
  {
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '123 Oak Street',
        line2: 'Apt 4B',
        city: 'Brooklyn',
        state: 'NY',
        postalCode: '11201',
        country: 'US',
        isDefault: true,
      },
      {
        label: 'Work',
        line1: '456 Madison Avenue',
        line2: 'Floor 12',
        city: 'New York',
        state: 'NY',
        postalCode: '10022',
        country: 'US',
        isDefault: false,
      },
    ],
  },
  {
    email: 'michael.chen@example.com',
    name: 'Michael Chen',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '789 Pine Road',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'emma.wilson@example.com',
    name: 'Emma Wilson',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '321 Maple Lane',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'james.martinez@example.com',
    name: 'James Martinez',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '555 Cedar Boulevard',
        line2: 'Suite 200',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'olivia.brown@example.com',
    name: 'Olivia Brown',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '888 Birch Street',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'william.davis@example.com',
    name: 'William Davis',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '444 Elm Court',
        city: 'Denver',
        state: 'CO',
        postalCode: '80202',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'sophia.garcia@example.com',
    name: 'Sophia Garcia',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '777 Willow Way',
        city: 'Miami',
        state: 'FL',
        postalCode: '33101',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'benjamin.taylor@example.com',
    name: 'Benjamin Taylor',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '222 Spruce Drive',
        line2: 'Apt 15',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'ava.anderson@example.com',
    name: 'Ava Anderson',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '999 Aspen Circle',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'lucas.thomas@example.com',
    name: 'Lucas Thomas',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '111 Redwood Lane',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'mia.jackson@example.com',
    name: 'Mia Jackson',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '333 Hickory Street',
        city: 'Nashville',
        state: 'TN',
        postalCode: '37201',
        country: 'US',
        isDefault: true,
      },
    ],
  },
  {
    email: 'ethan.white@example.com',
    name: 'Ethan White',
    password: 'Customer123!',
    addresses: [
      {
        label: 'Home',
        line1: '666 Magnolia Avenue',
        city: 'Phoenix',
        state: 'AZ',
        postalCode: '85001',
        country: 'US',
        isDefault: true,
      },
    ],
  },
];

const paymentMethods = [
  'card_visa_4242',
  'card_mastercard_5555',
  'card_amex_3782',
  'paypal',
  'apple_pay',
];

const orderNotes = [
  null,
  'Please leave at the door',
  'Gift wrap requested',
  'Call before delivery',
  'Fragile items - handle with care',
  null,
  'Expedited shipping requested',
  null,
  'No signature required',
  null,
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function clearData() {
  console.log('Clearing existing customers, orders, and transactions...');
  await TransactionModel.deleteMany({});
  await OrderModel.deleteMany({});
  // Only delete customer users, not admins
  await UserModel.deleteMany({ role: UserRole.CUSTOMER });
  console.log('Cleared existing data');
}

async function seedCustomers(): Promise<mongoose.Types.ObjectId[]> {
  console.log('\nSeeding customers...');
  const customerIds: mongoose.Types.ObjectId[] = [];

  for (const customer of customers) {
    // Check if customer already exists
    const existing = await UserModel.findOne({
      email: customer.email.toLowerCase(),
    });
    if (existing) {
      console.log(`   Skipping existing customer: ${customer.email}`);
      customerIds.push(existing._id as mongoose.Types.ObjectId);
      continue;
    }

    const passwordHash = await bcrypt.hash(customer.password, 10);
    const addresses = customer.addresses.map((addr) => ({
      id: generateId(),
      ...addr,
    }));

    const user = await UserModel.create({
      email: customer.email.toLowerCase(),
      passwordHash,
      name: customer.name,
      role: UserRole.CUSTOMER,
      emailVerified: true,
      addresses,
    });

    customerIds.push(user._id as mongoose.Types.ObjectId);
    console.log(`   Created customer: ${customer.name} (${customer.email})`);
  }

  return customerIds;
}

interface ProductDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  basePrice: number;
  currency: string;
  variants: Array<{
    id: string;
    name: string;
    priceOverride?: number;
  }>;
  images: Array<{
    url: string;
  }>;
}

async function seedOrders(
  customerIds: mongoose.Types.ObjectId[]
): Promise<mongoose.Types.ObjectId[]> {
  console.log('\nSeeding orders...');
  const orderIds: mongoose.Types.ObjectId[] = [];

  // Get all published products
  const products = (await ProductModel.find({
    status: ProductStatus.PUBLISHED,
  }).lean()) as ProductDoc[];

  if (products.length === 0) {
    console.log('   No published products found. Run seed:products first.');
    return orderIds;
  }

  console.log(`   Found ${products.length} published products`);

  // Get customer data for addresses
  const customerDocs = await UserModel.find({
    _id: { $in: customerIds },
  }).lean();

  const customerMap = new Map(customerDocs.map((c) => [c._id.toString(), c]));

  // Generate orders for the past 60 days
  const ordersToCreate = 45; // Number of orders to create

  for (let i = 0; i < ordersToCreate; i++) {
    const customerId = randomElement(customerIds);
    const customer = customerMap.get(customerId.toString());

    if (!customer || !customer.addresses || customer.addresses.length === 0) {
      continue;
    }

    const address = customer.addresses[0];
    const orderDate = randomDate(60);

    // Random number of items (1-4)
    const numItems = randomInt(1, 4);
    const selectedProducts = new Set<string>();
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      // Pick a random product (avoid duplicates)
      let product: ProductDoc;
      let attempts = 0;
      do {
        product = randomElement(products);
        attempts++;
      } while (selectedProducts.has(product._id.toString()) && attempts < 10);

      if (selectedProducts.has(product._id.toString())) continue;
      selectedProducts.add(product._id.toString());

      // Pick a random variant
      const variant = randomElement(product.variants);
      const unitPrice = variant.priceOverride ?? product.basePrice;
      const quantity = randomInt(1, 3);
      const itemTotal = unitPrice * quantity;

      items.push({
        productId: product._id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        quantity,
        unitPrice,
        total: itemTotal,
        imageUrl: product.images[0]?.url,
      });

      subtotal += itemTotal;
    }

    if (items.length === 0) continue;

    // Calculate shipping (free over 5000 BDT)
    const shippingAmount = subtotal >= 5000 ? 0 : 150;
    const taxRate = 0.05; // 5% VAT
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + shippingAmount + taxAmount) * 100) / 100;

    // Determine order status based on age
    const daysOld = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    let status: OrderStatus;
    let paymentStatus: PaymentStatus;

    if (daysOld > 14) {
      // Older orders are delivered or cancelled
      status = Math.random() > 0.1 ? OrderStatus.DELIVERED : OrderStatus.CANCELLED;
      paymentStatus =
        status === OrderStatus.CANCELLED ? PaymentStatus.REFUNDED : PaymentStatus.PAID;
    } else if (daysOld > 7) {
      // Week old orders are shipped or delivered
      status = Math.random() > 0.3 ? OrderStatus.DELIVERED : OrderStatus.SHIPPED;
      paymentStatus = PaymentStatus.PAID;
    } else if (daysOld > 3) {
      // Few days old are processing or shipped
      status = Math.random() > 0.5 ? OrderStatus.SHIPPED : OrderStatus.PROCESSING;
      paymentStatus = PaymentStatus.PAID;
    } else if (daysOld > 1) {
      // Recent orders are confirmed or processing
      status = Math.random() > 0.5 ? OrderStatus.PROCESSING : OrderStatus.CONFIRMED;
      paymentStatus = PaymentStatus.PAID;
    } else {
      // Today's orders are pending or confirmed
      status = Math.random() > 0.5 ? OrderStatus.CONFIRMED : OrderStatus.PENDING;
      paymentStatus = status === OrderStatus.PENDING ? PaymentStatus.PENDING : PaymentStatus.PAID;
    }

    const order = await OrderModel.create({
      orderNumber: generateOrderNumber(),
      userId: customerId,
      status,
      items,
      subtotal,
      shippingAmount,
      taxAmount,
      total,
      currency: 'BDT',
      shippingAddress: {
        name: customer.name,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      paymentIntentId: `pi_${generateId()}${generateId()}`,
      paymentStatus,
      notes: randomElement(orderNotes),
      createdAt: orderDate,
      updatedAt: orderDate,
    });

    orderIds.push(order._id as mongoose.Types.ObjectId);

    const statusLabel =
      {
        pending: '[P]',
        confirmed: '[C]',
        processing: '[X]',
        shipped: '[S]',
        delivered: '[D]',
        cancelled: '[X]',
      }[status] || '';

    console.log(`   ${statusLabel} Order ${order.orderNumber}: $${total.toFixed(2)} (${status})`);
  }

  return orderIds;
}

async function seedTransactions(orderIds: mongoose.Types.ObjectId[]): Promise<void> {
  console.log('\nSeeding transactions...');

  const orders = await OrderModel.find({ _id: { $in: orderIds } }).lean();

  for (const order of orders) {
    // Skip pending payment orders
    if (order.paymentStatus === PaymentStatus.PENDING) {
      continue;
    }

    const paymentMethod = randomElement(paymentMethods);

    // Create sale transaction
    await TransactionModel.create({
      orderId: order._id,
      type: TransactionType.SALE,
      amount: order.total,
      currency: order.currency,
      paymentMethod,
      externalId: `ch_${generateId()}${generateId()}`,
      status: TransactionStatus.COMPLETED,
      metadata: {
        orderNumber: order.orderNumber,
        items: order.items.length,
      },
      createdAt: order.createdAt,
    });

    // If refunded, create refund transaction
    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      const refundDate = new Date(
        new Date(order.createdAt as Date).getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000
      );
      await TransactionModel.create({
        orderId: order._id,
        type: TransactionType.REFUND,
        amount: order.total,
        currency: order.currency,
        paymentMethod,
        externalId: `re_${generateId()}${generateId()}`,
        status: TransactionStatus.COMPLETED,
        metadata: {
          orderNumber: order.orderNumber,
          reason: 'Customer requested cancellation',
        },
        createdAt: refundDate,
      });
    }
  }

  const totalTransactions = await TransactionModel.countDocuments({
    orderId: { $in: orderIds },
  });
  console.log(`   Created ${totalTransactions} transactions`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const shouldClear = process.argv.includes('--clear');

  console.log('Lunaz Data Seed Script');
  console.log('=========================\n');
  console.log('This script creates dummy customers, orders, and transactions.');
  console.log('Prerequisites: Run seed:products first.\n');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  try {
    if (shouldClear) {
      await clearData();
    }

    // Check for existing data
    const existingCustomers = await UserModel.countDocuments({
      role: UserRole.CUSTOMER,
    });
    const existingOrders = await OrderModel.countDocuments();
    const existingTransactions = await TransactionModel.countDocuments();

    if (existingOrders > 0 || existingTransactions > 0) {
      console.log(`\nFound existing data:`);
      console.log(`   - ${existingCustomers} customers`);
      console.log(`   - ${existingOrders} orders`);
      console.log(`   - ${existingTransactions} transactions`);
      console.log('   Run with --clear flag to remove existing data before seeding\n');
    }

    // Seed data
    const customerIds = await seedCustomers();
    const orderIds = await seedOrders(customerIds);
    await seedTransactions(orderIds);

    // Summary
    const totalCustomers = await UserModel.countDocuments({
      role: UserRole.CUSTOMER,
    });
    const totalOrders = await OrderModel.countDocuments();
    const totalTransactions = await TransactionModel.countDocuments();

    // Order status breakdown
    const statusCounts = await OrderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Revenue calculation
    const revenue = await OrderModel.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    console.log('\n=========================');
    console.log('Seeding Complete!');
    console.log('=========================');
    console.log(`   Customers:     ${totalCustomers}`);
    console.log(`   Orders:        ${totalOrders}`);
    console.log(`   Transactions:  ${totalTransactions}`);
    console.log('');
    console.log('   Order Status Breakdown:');
    for (const { _id, count } of statusCounts) {
      console.log(`     - ${_id}: ${count}`);
    }
    console.log('');
    console.log(`   Total Revenue: $${(revenue[0]?.total || 0).toFixed(2)}`);
    console.log('');
    console.log('   Test customer credentials:');
    console.log('     Email:    sarah.johnson@example.com');
    console.log('     Password: Customer123!');
    console.log('');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
