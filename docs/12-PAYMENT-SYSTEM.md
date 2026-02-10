# Lunaz — Payment System Specification

## Table of Contents

1. [Overview](#1-overview)
2. [Supported Payment Methods](#2-supported-payment-methods)
3. [Architecture Design](#3-architecture-design)
4. [Database Schema](#4-database-schema)
5. [Backend Implementation](#5-backend-implementation)
6. [Web App Checkout Flow](#6-web-app-checkout-flow)
7. [Admin Panel Integration](#7-admin-panel-integration)
8. [bKash Integration](#8-bkash-integration)
9. [Nagad Integration](#9-nagad-integration)
10. [Bank Transfer Integration](#10-bank-transfer-integration)
11. [SSLCommerz Card Payment](#11-sslcommerz-card-payment)
12. [Security Considerations](#12-security-considerations)
13. [Testing Strategy](#13-testing-strategy)
14. [Implementation Phases](#14-implementation-phases)

---

## 1. Overview

### 1.1 Purpose

This document outlines the payment system implementation for Lunaz e-commerce platform, specifically designed for the Bangladesh market. The system supports multiple local payment methods commonly used by Bangladeshi consumers.

### 1.2 Goals

- **Local Focus:** Support Bangladesh's most popular payment methods
- **Seamless Checkout:** Simple, intuitive payment selection during checkout
- **Security:** Secure handling of payment data and transactions
- **Reliability:** Robust error handling and payment verification
- **Admin Control:** Easy payment management from admin panel
- **Extensibility:** Architecture that allows adding new payment methods

### 1.3 Supported Payment Methods

| Method            | Type                     | Priority | Status       |
| ----------------- | ------------------------ | -------- | ------------ |
| bKash             | Mobile Financial Service | High     | To Implement |
| Nagad             | Mobile Financial Service | High     | To Implement |
| Bank Transfer     | Manual Transfer          | Medium   | To Implement |
| Credit/Debit Card | SSLCommerz Gateway       | Medium   | To Implement |
| Cash on Delivery  | Manual                   | High     | Existing     |

### 1.4 Out of Scope (For Now)

- Stripe integration
- PayPal integration
- International payment gateways
- Cryptocurrency payments
- Buy Now Pay Later (BNPL)

---

## 2. Supported Payment Methods

### 2.1 bKash

Bangladesh's leading mobile financial service with 60+ million active users.

**Integration Type:** API-based (Tokenized/Checkout)
**Transaction Flow:** Redirect to bKash → User authenticates → Callback to merchant
**Settlement:** T+1 to T+2 business days

**Key Features:**

- Payment (single transaction)
- Agreement (recurring payments)
- Refund support
- Query transaction status

### 2.2 Nagad

Government-backed digital financial service by Bangladesh Post Office.

**Integration Type:** API-based
**Transaction Flow:** Similar to bKash with redirect/callback
**Settlement:** T+1 business days

**Key Features:**

- Payment initiation
- Payment verification
- Refund support
- Transaction query

### 2.3 Bank Transfer

Manual bank transfer with order confirmation by admin.

**Supported Banks:**

- Dutch-Bangla Bank
- BRAC Bank
- Eastern Bank Limited (EBL)
- City Bank
- Standard Chartered Bangladesh
- HSBC Bangladesh
- Any bank via NPSB (National Payment Switch Bangladesh)

**Flow:**

1. Customer selects Bank Transfer
2. Order placed with "Pending Payment" status
3. Customer transfers to store's bank account
4. Customer submits transfer reference/receipt
5. Admin verifies and confirms payment
6. Order status updated to "Processing"

### 2.4 Credit/Debit Card (SSLCommerz)

Bangladesh's leading payment gateway supporting local and international cards.

**Supported Cards:**

- Visa
- Mastercard
- American Express
- Local bank debit cards

**Integration Type:** Hosted checkout / IPN (Instant Payment Notification)
**Settlement:** T+2 to T+3 business days

---

## 3. Architecture Design

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CHECKOUT FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│   │   Cart   │───▶│   Checkout   │───▶│   Payment    │───▶│  Order   │ │
│   │   Page   │    │    Page      │    │   Selection  │    │ Complete │ │
│   └──────────┘    └──────────────┘    └──────────────┘    └──────────┘ │
│                                              │                          │
│                                              ▼                          │
│                        ┌─────────────────────────────────────┐         │
│                        │       Payment Method Selection       │         │
│                        ├─────────────────────────────────────┤         │
│                        │  ○ bKash                            │         │
│                        │  ○ Nagad                            │         │
│                        │  ○ Bank Transfer                    │         │
│                        │  ○ Card Payment (SSLCommerz)        │         │
│                        │  ○ Cash on Delivery                 │         │
│                        └─────────────────────────────────────┘         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT PROCESSING                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────────┐         ┌────────────────┐         ┌────────────┐ │
│   │   Web App      │────────▶│    Backend     │────────▶│  Payment   │ │
│   │   (React)      │         │    (Express)   │         │  Gateway   │ │
│   └────────────────┘         └────────────────┘         └────────────┘ │
│          │                          │                         │         │
│          │                          ▼                         │         │
│          │                   ┌────────────┐                   │         │
│          │                   │  MongoDB   │                   │         │
│          │                   │  - Orders  │                   │         │
│          │                   │  - Payments│                   │         │
│          │                   └────────────┘                   │         │
│          │                          ▲                         │         │
│          │                          │                         │         │
│          └──────────────────────────┴─────────────────────────┘         │
│                            (Webhooks/Callbacks)                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Payment Flow States

```
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐
│ PENDING │───▶│ INITIATED │───▶│ COMPLETED │───▶│  PAID    │
└─────────┘    └───────────┘    └───────────┘    └──────────┘
     │              │                                  │
     │              │                                  │
     ▼              ▼                                  ▼
┌─────────┐    ┌───────────┐                    ┌──────────┐
│ EXPIRED │    │  FAILED   │                    │ REFUNDED │
└─────────┘    └───────────┘                    └──────────┘
```

### 3.3 Component Architecture

```
apps/backend/src/modules/payments/
├── payments.model.ts           # Payment schema
├── payments.routes.ts          # Payment endpoints
├── payments.service.ts         # Payment business logic
├── payments.validation.ts      # Request validation
├── gateways/
│   ├── index.ts                # Gateway factory
│   ├── bkash.gateway.ts        # bKash integration
│   ├── nagad.gateway.ts        # Nagad integration
│   ├── sslcommerz.gateway.ts   # SSLCommerz integration
│   └── bank-transfer.gateway.ts # Bank transfer logic
├── webhooks/
│   ├── bkash.webhook.ts        # bKash callbacks
│   ├── nagad.webhook.ts        # Nagad callbacks
│   └── sslcommerz.webhook.ts   # SSLCommerz IPN
└── utils/
    ├── payment.helpers.ts      # Utility functions
    └── signature.utils.ts      # Signature verification
```

---

## 4. Database Schema

### 4.1 Payment Model

```typescript
// apps/backend/src/modules/payments/payments.model.ts

import mongoose from 'mongoose';

export enum PaymentMethod {
  BKASH = 'bkash',
  NAGAD = 'nagad',
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  CASH_ON_DELIVERY = 'cod',
}

export enum PaymentStatus {
  PENDING = 'pending',
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  EXPIRED = 'expired',
}

const paymentSchema = new mongoose.Schema(
  {
    // Reference
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Payment Details
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'BDT',
    },

    // Gateway Response
    gatewayTransactionId: String, // Transaction ID from payment gateway
    gatewayPaymentId: String, // Payment ID (bKash paymentID, etc.)
    gatewayResponse: mongoose.Schema.Types.Mixed, // Full response for debugging

    // bKash Specific
    bkash: {
      paymentID: String,
      trxID: String,
      agreementID: String,
      payerReference: String,
      customerMsisdn: String,
    },

    // Nagad Specific
    nagad: {
      paymentRefId: String,
      orderId: String,
      issuerPaymentRefNo: String,
      clientMobileNo: String,
    },

    // Bank Transfer Specific
    bankTransfer: {
      bankName: String,
      accountNumber: String,
      transactionReference: String,
      transferDate: Date,
      proofUrl: String, // Receipt/screenshot upload
      verifiedBy: mongoose.Schema.Types.ObjectId,
      verifiedAt: Date,
      notes: String,
    },

    // Card Payment (SSLCommerz)
    card: {
      sessionKey: String,
      transactionId: String,
      validationId: String,
      cardType: String,
      cardNo: String, // Masked: ****1234
      cardIssuer: String,
      cardBrand: String,
      cardIssuerCountry: String,
    },

    // Refund Details
    refund: {
      amount: Number,
      reason: String,
      refundedAt: Date,
      refundTransactionId: String,
      refundedBy: mongoose.Schema.Types.ObjectId,
    },

    // Metadata
    ipAddress: String,
    userAgent: String,
    failureReason: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ 'bkash.paymentID': 1 });
paymentSchema.index({ 'nagad.paymentRefId': 1 });
paymentSchema.index({ createdAt: -1 });

export const PaymentModel = mongoose.model('Payment', paymentSchema);
```

### 4.2 Order Model Updates

```typescript
// Update to apps/backend/src/modules/orders/orders.model.ts

const orderSchema = new mongoose.Schema(
  {
    // ... existing fields ...

    // Payment Information
    paymentMethod: {
      type: String,
      enum: ['bkash', 'nagad', 'bank_transfer', 'card', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paidAt: Date,

    // ... rest of fields ...
  },
  { timestamps: true }
);
```

### 4.3 Payment Settings Model

```typescript
// Part of Settings model - payment configuration

const paymentSettingsSchema = {
  // General
  enabledMethods: [
    {
      type: String,
      enum: ['bkash', 'nagad', 'bank_transfer', 'card', 'cod'],
    },
  ],

  // bKash Configuration
  bkash: {
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    appKey: String,
    appSecret: String, // Encrypted
    username: String,
    password: String, // Encrypted
    callbackUrl: String,
  },

  // Nagad Configuration
  nagad: {
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    merchantId: String,
    merchantPrivateKey: String, // Encrypted
    pgPublicKey: String,
    callbackUrl: String,
  },

  // Bank Transfer Configuration
  bankTransfer: {
    enabled: { type: Boolean, default: true },
    accounts: [
      {
        bankName: String,
        accountName: String,
        accountNumber: String,
        branchName: String,
        routingNumber: String,
        isActive: { type: Boolean, default: true },
      },
    ],
    instructions: String,
    expiryHours: { type: Number, default: 48 }, // Auto-cancel after hours
  },

  // SSLCommerz Configuration
  sslcommerz: {
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    storeId: String,
    storePassword: String, // Encrypted
    successUrl: String,
    failUrl: String,
    cancelUrl: String,
    ipnUrl: String,
  },

  // Cash on Delivery
  cod: {
    enabled: { type: Boolean, default: true },
    instructions: String,
    minimumOrder: { type: Number, default: 0 },
    maximumOrder: Number,
    availableAreas: [String], // Restrict to certain areas
  },
};
```

---

## 5. Backend Implementation

### 5.1 API Endpoints

```typescript
// Payment Routes

// Initiate Payment
POST   /api/payments/initiate
Body: {
  orderId: string;
  method: 'bkash' | 'nagad' | 'bank_transfer' | 'card' | 'cod';
}
Response: {
  paymentId: string;
  redirectUrl?: string;      // For bKash/Nagad/Card
  bankDetails?: BankAccount[]; // For bank transfer
  instructions?: string;
}

// Payment Callbacks (Webhooks)
POST   /api/payments/bkash/callback
POST   /api/payments/nagad/callback
POST   /api/payments/sslcommerz/ipn
POST   /api/payments/sslcommerz/success
POST   /api/payments/sslcommerz/fail
POST   /api/payments/sslcommerz/cancel

// Bank Transfer Verification (Admin)
POST   /api/payments/:paymentId/verify-bank-transfer
Body: {
  verified: boolean;
  notes?: string;
}

// Get Payment Status
GET    /api/payments/:paymentId/status

// Get Payment by Order
GET    /api/orders/:orderId/payment

// Submit Bank Transfer Proof
POST   /api/payments/:paymentId/bank-transfer-proof
Body: FormData { proof: File, transactionReference: string }

// Refund Payment (Admin)
POST   /api/payments/:paymentId/refund
Body: {
  amount: number;
  reason: string;
}

// Admin: List Payments
GET    /api/admin/payments
Query: { status?, method?, from?, to?, page?, limit? }

// Admin: Pending Bank Transfers
GET    /api/admin/payments/pending-bank-transfers
```

### 5.2 Payment Service

```typescript
// apps/backend/src/modules/payments/payments.service.ts

import { PaymentModel, PaymentMethod, PaymentStatus } from './payments.model';
import { OrderModel } from '../orders/orders.model';
import { BkashGateway } from './gateways/bkash.gateway';
import { NagadGateway } from './gateways/nagad.gateway';
import { SSLCommerzGateway } from './gateways/sslcommerz.gateway';
import { BankTransferGateway } from './gateways/bank-transfer.gateway';

export class PaymentService {
  private bkash: BkashGateway;
  private nagad: NagadGateway;
  private sslcommerz: SSLCommerzGateway;
  private bankTransfer: BankTransferGateway;

  constructor() {
    this.bkash = new BkashGateway();
    this.nagad = new NagadGateway();
    this.sslcommerz = new SSLCommerzGateway();
    this.bankTransfer = new BankTransferGateway();
  }

  async initiatePayment(orderId: string, method: PaymentMethod, userId: string) {
    // Get order
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.userId.toString() !== userId) throw new Error('Unauthorized');

    // Create payment record
    const payment = await PaymentModel.create({
      orderId,
      userId,
      method,
      amount: order.total,
      currency: order.currency,
      status: PaymentStatus.INITIATED,
      expiresAt: this.getExpiryTime(method),
    });

    // Update order with payment method
    await OrderModel.findByIdAndUpdate(orderId, {
      paymentMethod: method,
      paymentId: payment._id,
    });

    // Initiate with gateway
    let result;
    switch (method) {
      case PaymentMethod.BKASH:
        result = await this.bkash.createPayment(payment, order);
        break;
      case PaymentMethod.NAGAD:
        result = await this.nagad.createPayment(payment, order);
        break;
      case PaymentMethod.CARD:
        result = await this.sslcommerz.createPayment(payment, order);
        break;
      case PaymentMethod.BANK_TRANSFER:
        result = await this.bankTransfer.getPaymentDetails(payment);
        break;
      case PaymentMethod.CASH_ON_DELIVERY:
        result = await this.handleCOD(payment, order);
        break;
      default:
        throw new Error('Invalid payment method');
    }

    return {
      paymentId: payment._id,
      ...result,
    };
  }

  async handleCallback(method: PaymentMethod, data: any) {
    switch (method) {
      case PaymentMethod.BKASH:
        return this.bkash.handleCallback(data);
      case PaymentMethod.NAGAD:
        return this.nagad.handleCallback(data);
      case PaymentMethod.CARD:
        return this.sslcommerz.handleCallback(data);
      default:
        throw new Error('Invalid callback method');
    }
  }

  async verifyBankTransfer(paymentId: string, verified: boolean, adminId: string, notes?: string) {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.method !== PaymentMethod.BANK_TRANSFER) {
      throw new Error('Not a bank transfer payment');
    }

    if (verified) {
      payment.status = PaymentStatus.PAID;
      payment.bankTransfer.verifiedBy = adminId;
      payment.bankTransfer.verifiedAt = new Date();
      payment.bankTransfer.notes = notes;

      // Update order
      await OrderModel.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
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

  async submitBankTransferProof(
    paymentId: string,
    userId: string,
    proofUrl: string,
    transactionReference: string
  ) {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.userId.toString() !== userId) throw new Error('Unauthorized');
    if (payment.method !== PaymentMethod.BANK_TRANSFER) {
      throw new Error('Not a bank transfer payment');
    }

    payment.bankTransfer.proofUrl = proofUrl;
    payment.bankTransfer.transactionReference = transactionReference;
    payment.bankTransfer.transferDate = new Date();
    payment.status = PaymentStatus.PROCESSING;

    await payment.save();
    return payment;
  }

  async processRefund(paymentId: string, amount: number, reason: string, adminId: string) {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== PaymentStatus.PAID) {
      throw new Error('Payment must be paid to refund');
    }

    let refundResult;
    switch (payment.method) {
      case PaymentMethod.BKASH:
        refundResult = await this.bkash.refund(payment, amount);
        break;
      case PaymentMethod.NAGAD:
        refundResult = await this.nagad.refund(payment, amount);
        break;
      case PaymentMethod.CARD:
        refundResult = await this.sslcommerz.refund(payment, amount);
        break;
      case PaymentMethod.BANK_TRANSFER:
      case PaymentMethod.CASH_ON_DELIVERY:
        // Manual refund process
        refundResult = { transactionId: `MANUAL_${Date.now()}` };
        break;
    }

    const isFullRefund = amount >= payment.amount;
    payment.status = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    payment.refund = {
      amount,
      reason,
      refundedAt: new Date(),
      refundTransactionId: refundResult.transactionId,
      refundedBy: adminId,
    };

    await payment.save();

    // Update order
    await OrderModel.findByIdAndUpdate(payment.orderId, {
      paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
    });

    return payment;
  }

  private getExpiryTime(method: PaymentMethod): Date {
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

  private async handleCOD(payment: any, order: any) {
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
}
```

### 5.3 Validation Schema

```typescript
// apps/backend/src/modules/payments/payments.validation.ts

import Joi from 'joi';

export const initiatePaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  method: Joi.string().valid('bkash', 'nagad', 'bank_transfer', 'card', 'cod').required(),
});

export const bankTransferProofSchema = Joi.object({
  transactionReference: Joi.string().required(),
  // File handled separately
});

export const verifyBankTransferSchema = Joi.object({
  verified: Joi.boolean().required(),
  notes: Joi.string().max(500),
});

export const refundSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reason: Joi.string().max(500).required(),
});
```

---

## 6. Web App Checkout Flow

### 6.1 Updated Checkout Page Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHECKOUT PAGE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: Shipping Address                                         │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │  ○ Home - 123 Main Street, Dhaka 1205                      │ │   │
│  │ │  ○ Office - 456 Business Ave, Chittagong                   │ │   │
│  │ │  + Add new address                                          │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Step 2: Payment Method                                           │   │
│  │ ┌─────────────────────────────────────────────────────────────┐ │   │
│  │ │                                                              │ │   │
│  │ │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │   │
│  │ │  │  bKash   │  │  Nagad   │  │   Bank   │  │   Card   │   │ │   │
│  │ │  │   [✓]    │  │   [ ]    │  │ Transfer │  │ Payment  │   │ │   │
│  │ │  │          │  │          │  │   [ ]    │  │   [ ]    │   │ │   │
│  │ │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │   │
│  │ │                                                              │ │   │
│  │ │  ┌──────────────────────────────────────────────────────┐  │ │   │
│  │ │  │  Cash on Delivery  [ ]                                │  │ │   │
│  │ │  └──────────────────────────────────────────────────────┘  │ │   │
│  │ │                                                              │ │   │
│  │ └─────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Order Summary                                                    │   │
│  │                                                                  │   │
│  │   Product A × 2                                    ৳ 2,400      │   │
│  │   Product B × 1                                    ৳ 1,200      │   │
│  │   ─────────────────────────────────────────────────────────     │   │
│  │   Subtotal                                         ৳ 3,600      │   │
│  │   Shipping                                         ৳   100      │   │
│  │   ─────────────────────────────────────────────────────────     │   │
│  │   Total                                            ৳ 3,700      │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐   │   │
│  │   │              [  Place Order  ]                          │   │   │
│  │   └────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Payment Method Selection Component

```tsx
// apps/web/src/features/checkout/components/PaymentMethodSelector.tsx

interface PaymentMethod {
  id: 'bkash' | 'nagad' | 'bank_transfer' | 'card' | 'cod';
  name: string;
  icon: ReactNode;
  description: string;
  enabled: boolean;
}

interface PaymentMethodSelectorProps {
  selected: string;
  onSelect: (method: string) => void;
  availableMethods: PaymentMethod[];
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bkash',
    name: 'bKash',
    icon: <BkashIcon />,
    description: 'Pay with bKash mobile wallet',
    enabled: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    icon: <NagadIcon />,
    description: 'Pay with Nagad mobile wallet',
    enabled: true,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <BankIcon />,
    description: 'Direct bank transfer',
    enabled: true,
  },
  {
    id: 'card',
    name: 'Card Payment',
    icon: <CardIcon />,
    description: 'Credit/Debit card via SSLCommerz',
    enabled: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: <CashIcon />,
    description: 'Pay when you receive',
    enabled: true,
  },
];
```

### 6.3 Checkout Flow States

```typescript
// Checkout States
type CheckoutStep = 'address' | 'payment' | 'processing' | 'complete';

interface CheckoutState {
  step: CheckoutStep;
  shippingAddress: Address | null;
  paymentMethod: PaymentMethod | null;
  orderId: string | null;
  paymentId: string | null;
  error: string | null;
}

// Flow:
// 1. address → Select/enter shipping address
// 2. payment → Select payment method
// 3. processing → Order created, payment initiated
// 4. complete → Redirect based on payment method:
//    - bKash/Nagad/Card: Redirect to gateway
//    - Bank Transfer: Show bank details
//    - COD: Show confirmation
```

### 6.4 Bank Transfer Details Component

```tsx
// apps/web/src/features/checkout/components/BankTransferDetails.tsx

interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber?: string;
}

interface BankTransferDetailsProps {
  accounts: BankAccount[];
  orderId: string;
  amount: number;
  expiresAt: Date;
  onProofSubmit: (reference: string, proof: File) => void;
}

// UI shows:
// 1. List of bank accounts to transfer to
// 2. Order reference number to include in transfer
// 3. Amount to transfer
// 4. Deadline for transfer
// 5. Form to submit transfer proof
```

---

## 7. Admin Panel Integration

### 7.1 Payment Management Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PAYMENTS MANAGEMENT                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Tabs: [All] [Pending] [Bank Transfers] [Refunds]                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Filters: Method [All ▼]  Status [All ▼]  Date [Last 7 days ▼]  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Order      │ Customer    │ Method   │ Amount  │ Status │ Action│   │
│  ├────────────┼─────────────┼──────────┼─────────┼────────┼───────┤   │
│  │ #LN-1234   │ John Doe    │ bKash    │ ৳3,500  │ Paid   │ View  │   │
│  │ #LN-1235   │ Jane Smith  │ Bank     │ ৳5,200  │ Pending│ Verify│   │
│  │ #LN-1236   │ Bob Wilson  │ Nagad    │ ৳1,800  │ Paid   │ View  │   │
│  │ #LN-1237   │ Alice Brown │ COD      │ ৳2,400  │ Pending│ View  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Bank Transfer Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│              VERIFY BANK TRANSFER - Order #LN-1235                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Order Details                                                           │
│  ─────────────────────────────────────────────                          │
│  Order ID:        #LN-1235                                              │
│  Customer:        Jane Smith (jane@email.com)                           │
│  Order Total:     ৳ 5,200                                               │
│  Order Date:      Jan 31, 2026, 10:30 AM                                │
│                                                                          │
│  Payment Details                                                         │
│  ─────────────────────────────────────────────                          │
│  Transfer To:     Dutch-Bangla Bank - 1234567890                        │
│  Reference:       TRF-ABC123XYZ                                          │
│  Transfer Date:   Jan 31, 2026, 11:45 AM                                │
│  Submitted:       Jan 31, 2026, 12:00 PM                                │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    [Transfer Receipt Image]                      │   │
│  │                                                                  │   │
│  │                         📄                                       │   │
│  │                    Click to enlarge                              │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Verification Notes:                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────┐    ┌────────────────────┐                      │
│  │   ✓ Verify & Approve │    │   ✗ Reject          │                      │
│  └────────────────────┘    └────────────────────┘                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. bKash Integration

### 8.1 bKash API Overview

**Sandbox URL:** `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
**Production URL:** `https://tokenized.pay.bka.sh/v1.2.0-beta`

### 8.2 Authentication Flow

```typescript
// apps/backend/src/modules/payments/gateways/bkash.gateway.ts

export class BkashGateway {
  private baseUrl: string;
  private appKey: string;
  private appSecret: string;
  private username: string;
  private password: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    const config = getPaymentConfig('bkash');
    this.baseUrl = config.sandbox
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
    this.appKey = config.appKey;
    this.appSecret = config.appSecret;
    this.username = config.username;
    this.password = config.password;
  }

  private async getToken(): Promise<string> {
    // Return cached token if valid
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: this.username,
        password: this.password,
      },
      body: JSON.stringify({
        app_key: this.appKey,
        app_secret: this.appSecret,
      }),
    });

    const data = await response.json();

    if (data.statusCode !== '0000') {
      throw new Error(`bKash token error: ${data.statusMessage}`);
    }

    this.token = data.id_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);

    return this.token;
  }

  async createPayment(payment: Payment, order: Order): Promise<CreatePaymentResult> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': this.appKey,
      },
      body: JSON.stringify({
        mode: '0011', // Checkout URL mode
        payerReference: payment.userId.toString(),
        callbackURL: `${process.env.API_URL}/api/payments/bkash/callback`,
        amount: payment.amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: order.orderNumber,
      }),
    });

    const data = await response.json();

    if (data.statusCode !== '0000') {
      throw new Error(`bKash create error: ${data.statusMessage}`);
    }

    // Update payment with bKash data
    await PaymentModel.findByIdAndUpdate(payment._id, {
      'bkash.paymentID': data.paymentID,
      gatewayPaymentId: data.paymentID,
    });

    return {
      redirectUrl: data.bkashURL,
      paymentId: data.paymentID,
    };
  }

  async executePayment(paymentID: string): Promise<ExecutePaymentResult> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': this.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    const data = await response.json();
    return data;
  }

  async handleCallback(callbackData: any): Promise<Payment> {
    const { paymentID, status } = callbackData;

    const payment = await PaymentModel.findOne({ 'bkash.paymentID': paymentID });
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (status === 'success') {
      // Execute the payment
      const executeResult = await this.executePayment(paymentID);

      if (executeResult.statusCode === '0000') {
        payment.status = PaymentStatus.PAID;
        payment.bkash.trxID = executeResult.trxID;
        payment.bkash.customerMsisdn = executeResult.customerMsisdn;
        payment.gatewayTransactionId = executeResult.trxID;
        payment.gatewayResponse = executeResult;

        // Update order
        await OrderModel.findByIdAndUpdate(payment.orderId, {
          paymentStatus: 'paid',
          paidAt: new Date(),
          status: 'processing',
        });
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = executeResult.statusMessage;
        payment.gatewayResponse = executeResult;
      }
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = `bKash payment ${status}`;
    }

    await payment.save();
    return payment;
  }

  async queryPayment(paymentID: string): Promise<any> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': this.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    return response.json();
  }

  async refund(payment: Payment, amount: number): Promise<RefundResult> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/payment/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-App-Key': this.appKey,
      },
      body: JSON.stringify({
        paymentID: payment.bkash.paymentID,
        amount: amount.toString(),
        trxID: payment.bkash.trxID,
        sku: 'refund',
        reason: 'Customer refund request',
      }),
    });

    const data = await response.json();

    if (data.statusCode !== '0000') {
      throw new Error(`bKash refund error: ${data.statusMessage}`);
    }

    return {
      transactionId: data.refundTrxID,
      originalTransactionId: data.originalTrxID,
    };
  }
}
```

### 8.3 bKash Callback Handler

```typescript
// apps/backend/src/modules/payments/webhooks/bkash.webhook.ts

router.get('/bkash/callback', async (req, res) => {
  try {
    const { paymentID, status } = req.query;

    const payment = await paymentService.handleCallback(PaymentMethod.BKASH, {
      paymentID,
      status,
    });

    // Redirect based on payment status
    if (payment.status === PaymentStatus.PAID) {
      res.redirect(`${process.env.WEB_URL}/checkout/success?orderId=${payment.orderId}`);
    } else {
      res.redirect(`${process.env.WEB_URL}/checkout/failed?orderId=${payment.orderId}`);
    }
  } catch (error) {
    res.redirect(`${process.env.WEB_URL}/checkout/error`);
  }
});
```

---

## 9. Nagad Integration

### 9.1 Nagad API Overview

**Sandbox URL:** `http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0`
**Production URL:** `https://api.mynagad.com/api/dfs`

### 9.2 Nagad Gateway Implementation

```typescript
// apps/backend/src/modules/payments/gateways/nagad.gateway.ts

import crypto from 'crypto';

export class NagadGateway {
  private baseUrl: string;
  private merchantId: string;
  private merchantPrivateKey: string;
  private pgPublicKey: string;

  constructor() {
    const config = getPaymentConfig('nagad');
    this.baseUrl = config.sandbox
      ? 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0'
      : 'https://api.mynagad.com/api/dfs';
    this.merchantId = config.merchantId;
    this.merchantPrivateKey = config.merchantPrivateKey;
    this.pgPublicKey = config.pgPublicKey;
  }

  private generateSignature(data: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(this.merchantPrivateKey, 'base64');
  }

  private encryptData(data: string): string {
    const buffer = Buffer.from(data);
    const encrypted = crypto.publicEncrypt(
      {
        key: this.pgPublicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return encrypted.toString('base64');
  }

  private decryptData(data: string): string {
    const buffer = Buffer.from(data, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: this.merchantPrivateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return decrypted.toString();
  }

  async createPayment(payment: Payment, order: Order): Promise<CreatePaymentResult> {
    const orderId = `${order.orderNumber}_${Date.now()}`;
    const dateTime = this.getDateTime();

    // Step 1: Initialize payment
    const initData = {
      merchantId: this.merchantId,
      orderId: orderId,
      dateTime: dateTime,
    };

    const initSignature = this.generateSignature(JSON.stringify(initData));

    const initResponse = await fetch(
      `${this.baseUrl}/check-out/initialize/${this.merchantId}/${orderId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
          'X-KM-Api-Version': 'v-0.2.0',
        },
        body: JSON.stringify({
          dateTime: dateTime,
          sensitiveData: this.encryptData(JSON.stringify(initData)),
          signature: initSignature,
        }),
      }
    );

    const initResult = await initResponse.json();

    if (initResult.reason) {
      throw new Error(`Nagad init error: ${initResult.reason}`);
    }

    // Decrypt sensitive data
    const sensitiveData = JSON.parse(this.decryptData(initResult.sensitiveData));
    const { paymentReferenceId, challenge } = sensitiveData;

    // Step 2: Complete payment initialization
    const completeData = {
      merchantId: this.merchantId,
      orderId: orderId,
      currencyCode: '050', // BDT
      amount: payment.amount.toString(),
      challenge: challenge,
    };

    const additionalInfo = {
      invoiceNumber: order.orderNumber,
    };

    const completePayload = {
      sensitiveData: this.encryptData(JSON.stringify(completeData)),
      signature: this.generateSignature(JSON.stringify(completeData)),
      merchantCallbackURL: `${process.env.API_URL}/api/payments/nagad/callback`,
      additionalMerchantInfo: JSON.stringify(additionalInfo),
    };

    const completeResponse = await fetch(
      `${this.baseUrl}/check-out/complete/${paymentReferenceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KM-IP-V4': '127.0.0.1',
          'X-KM-Client-Type': 'PC_WEB',
          'X-KM-Api-Version': 'v-0.2.0',
        },
        body: JSON.stringify(completePayload),
      }
    );

    const completeResult = await completeResponse.json();

    if (completeResult.reason) {
      throw new Error(`Nagad complete error: ${completeResult.reason}`);
    }

    // Update payment with Nagad data
    await PaymentModel.findByIdAndUpdate(payment._id, {
      'nagad.paymentRefId': paymentReferenceId,
      'nagad.orderId': orderId,
      gatewayPaymentId: paymentReferenceId,
    });

    return {
      redirectUrl: completeResult.callBackUrl,
      paymentRefId: paymentReferenceId,
    };
  }

  async handleCallback(callbackData: any): Promise<Payment> {
    const paymentRefId = callbackData.payment_ref_id || callbackData.paymentRefId;

    const payment = await PaymentModel.findOne({ 'nagad.paymentRefId': paymentRefId });
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Verify payment
    const verifyResponse = await fetch(`${this.baseUrl}/verify/payment/${paymentRefId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB',
        'X-KM-Api-Version': 'v-0.2.0',
      },
    });

    const verifyResult = await verifyResponse.json();

    if (verifyResult.status === 'Success') {
      payment.status = PaymentStatus.PAID;
      payment.nagad.issuerPaymentRefNo = verifyResult.issuerPaymentRefNo;
      payment.nagad.clientMobileNo = verifyResult.clientMobileNo;
      payment.gatewayTransactionId = verifyResult.issuerPaymentRefNo;
      payment.gatewayResponse = verifyResult;

      // Update order
      await OrderModel.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
        paidAt: new Date(),
        status: 'processing',
      });
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = verifyResult.message || 'Payment failed';
      payment.gatewayResponse = verifyResult;
    }

    await payment.save();
    return payment;
  }

  async refund(payment: Payment, amount: number): Promise<RefundResult> {
    const refundResponse = await fetch(`${this.baseUrl}/purchase/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB',
        'X-KM-Api-Version': 'v-0.2.0',
      },
      body: JSON.stringify({
        merchantId: this.merchantId,
        originalPaymentRefId: payment.nagad.paymentRefId,
        refundAmount: amount.toString(),
        referenceReason: 'Customer refund request',
      }),
    });

    const refundResult = await refundResponse.json();

    if (refundResult.status !== 'Success') {
      throw new Error(`Nagad refund error: ${refundResult.message}`);
    }

    return {
      transactionId: refundResult.refundTrxId,
      originalTransactionId: payment.nagad.issuerPaymentRefNo,
    };
  }

  private getDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  }
}
```

---

## 10. Bank Transfer Integration

### 10.1 Bank Transfer Gateway

```typescript
// apps/backend/src/modules/payments/gateways/bank-transfer.gateway.ts

export class BankTransferGateway {
  async getPaymentDetails(payment: Payment): Promise<BankTransferDetails> {
    // Get configured bank accounts from settings
    const settings = await SettingsModel.findOne();
    const bankAccounts =
      settings?.payments?.bankTransfer?.accounts?.filter((a: BankAccount) => a.isActive) || [];

    const instructions = settings?.payments?.bankTransfer?.instructions || '';
    const expiryHours = settings?.payments?.bankTransfer?.expiryHours || 48;

    // Update payment status
    await PaymentModel.findByIdAndUpdate(payment._id, {
      status: PaymentStatus.PENDING,
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    });

    return {
      bankAccounts,
      instructions,
      orderReference: `LN-${payment.orderId.toString().slice(-8).toUpperCase()}`,
      amount: payment.amount,
      currency: payment.currency,
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    };
  }

  async submitProof(
    paymentId: string,
    userId: string,
    proofUrl: string,
    transactionReference: string,
    bankName?: string
  ): Promise<Payment> {
    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    if (payment.method !== PaymentMethod.BANK_TRANSFER) {
      throw new Error('Invalid payment method');
    }

    // Check if expired
    if (payment.expiresAt && payment.expiresAt < new Date()) {
      throw new Error('Payment has expired');
    }

    payment.bankTransfer = {
      ...payment.bankTransfer,
      bankName,
      transactionReference,
      transferDate: new Date(),
      proofUrl,
    };
    payment.status = PaymentStatus.PROCESSING;

    await payment.save();

    // Notify admin (via email or push notification)
    await this.notifyAdmin(payment);

    return payment;
  }

  private async notifyAdmin(payment: Payment): Promise<void> {
    // TODO: Send notification to admin about pending bank transfer
    // This could be email, push notification, or in-app notification
    console.log(`New bank transfer pending verification: ${payment._id}`);
  }
}
```

### 10.2 Bank Transfer Verification (Admin)

```typescript
// apps/backend/src/modules/payments/payments.routes.ts

// Verify bank transfer (Admin only)
router.post(
  '/:paymentId/verify-bank-transfer',
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { verified, notes } = req.body;

      const payment = await paymentService.verifyBankTransfer(
        paymentId,
        verified,
        req.user.id,
        notes
      );

      res.json({
        success: true,
        payment: formatPayment(payment),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// Get pending bank transfers (Admin)
router.get('/pending-bank-transfers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payments = await PaymentModel.find({
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PROCESSING,
    })
      .populate('orderId', 'orderNumber total')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments.map(formatPayment),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

---

## 11. SSLCommerz Card Payment

### 11.1 SSLCommerz Overview

SSLCommerz is Bangladesh's leading payment gateway. **One integration** gives your store:

- **Cards:** Visa, Mastercard, Amex, DBBL Nexus, QCash, TakaPay
- **Mobile banking:** bKash, Nagad, Rocket, Tap, Upay, Ok Wallet, M-Cash, Islamic Wallet, MYCash, Meghna Pay
- **Internet banking:** Citytouch, Cellfin, EBL SKY, Sonali Bank, MTB, Bank Asia, and more
- **E-Wallet:** Pay Rainbow, iPay, Dmoney, Pocket

Customers choose their channel on the SSLCommerz hosted page after clicking "Place Order".

### 11.1.1 Sandbox quick start

1. **Create a sandbox account:** [developer.sslcommerz.com/registration](https://developer.sslcommerz.com/registration/)
2. **Get Store ID and Store Password** from the SSLCommerz developer/sandbox panel.
3. **Configure `.env`** (no DB change needed):

   ```env
   API_URL=http://localhost:4000
   SSLCOMMERZ_SANDBOX=true
   SSLCOMMERZ_STORE_ID=your_sandbox_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_sandbox_store_password
   ```

4. Restart the backend. The "Card / bKash / Nagad / Bank" option will appear at checkout.
5. **Test cards (sandbox):**
   - VISA: `4111111111111111` | Exp: 12/26 | CVV: 111
   - Mastercard: `5111111111111111` | Exp: 12/26 | CVV: 111
   - Amex: `371111111111111` | Exp: 12/26 | CVV: 111
   - Mobile OTP: `111111` or `123456`

For production, set Store ID/Password in **Manage → Settings → Payments** (or use env) and set `SSLCOMMERZ_SANDBOX=false`.

### 11.2 SSLCommerz Gateway Implementation

```typescript
// apps/backend/src/modules/payments/gateways/sslcommerz.gateway.ts

export class SSLCommerzGateway {
  private baseUrl: string;
  private storeId: string;
  private storePassword: string;

  constructor() {
    const config = getPaymentConfig('sslcommerz');
    this.baseUrl = config.sandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com';
    this.storeId = config.storeId;
    this.storePassword = config.storePassword;
  }

  async createPayment(payment: Payment, order: Order): Promise<CreatePaymentResult> {
    const user = await UserModel.findById(payment.userId);
    const transactionId = `TXN_${order.orderNumber}_${Date.now()}`;

    const postData = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: payment.amount,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${process.env.API_URL}/api/payments/sslcommerz/success`,
      fail_url: `${process.env.API_URL}/api/payments/sslcommerz/fail`,
      cancel_url: `${process.env.API_URL}/api/payments/sslcommerz/cancel`,
      ipn_url: `${process.env.API_URL}/api/payments/sslcommerz/ipn`,

      // Customer info
      cus_name: user?.name || 'Customer',
      cus_email: user?.email || 'customer@example.com',
      cus_phone: user?.phone || '01700000000',
      cus_add1: order.shippingAddress.line1,
      cus_city: order.shippingAddress.city,
      cus_postcode: order.shippingAddress.postalCode,
      cus_country: 'Bangladesh',

      // Shipping info
      shipping_method: 'Courier',
      ship_name: order.shippingAddress.name,
      ship_add1: order.shippingAddress.line1,
      ship_city: order.shippingAddress.city,
      ship_postcode: order.shippingAddress.postalCode,
      ship_country: 'Bangladesh',

      // Product info
      product_name: `Order ${order.orderNumber}`,
      product_category: 'E-commerce',
      product_profile: 'general',

      // Value for reference
      value_a: payment._id.toString(),
      value_b: order._id.toString(),
    };

    const response = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(postData as any).toString(),
    });

    const result = await response.json();

    if (result.status !== 'SUCCESS') {
      throw new Error(`SSLCommerz error: ${result.failedreason}`);
    }

    // Update payment
    await PaymentModel.findByIdAndUpdate(payment._id, {
      'card.sessionKey': result.sessionkey,
      'card.transactionId': transactionId,
      gatewayPaymentId: transactionId,
      status: PaymentStatus.INITIATED,
    });

    return {
      redirectUrl: result.GatewayPageURL,
      sessionKey: result.sessionkey,
      transactionId: transactionId,
    };
  }

  async handleIPN(ipnData: any): Promise<Payment> {
    // Validate IPN
    const validationResult = await this.validateTransaction(ipnData.val_id);

    const payment = await PaymentModel.findById(ipnData.value_a);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (validationResult.status === 'VALID' || validationResult.status === 'VALIDATED') {
      payment.status = PaymentStatus.PAID;
      payment.card.validationId = ipnData.val_id;
      payment.card.cardType = ipnData.card_type;
      payment.card.cardNo = ipnData.card_no;
      payment.card.cardIssuer = ipnData.card_issuer;
      payment.card.cardBrand = ipnData.card_brand;
      payment.card.cardIssuerCountry = ipnData.card_issuer_country;
      payment.gatewayTransactionId = ipnData.bank_tran_id;
      payment.gatewayResponse = ipnData;

      // Update order
      await OrderModel.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
        paidAt: new Date(),
        status: 'processing',
      });
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = validationResult.status;
      payment.gatewayResponse = ipnData;
    }

    await payment.save();
    return payment;
  }

  async validateTransaction(valId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/validator/api/validationserverAPI.php?` +
        `val_id=${valId}&store_id=${this.storeId}&store_passwd=${this.storePassword}&format=json`,
      { method: 'GET' }
    );

    return response.json();
  }

  async refund(payment: Payment, amount: number): Promise<RefundResult> {
    const response = await fetch(`${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        store_id: this.storeId,
        store_passwd: this.storePassword,
        bank_tran_id: payment.gatewayTransactionId,
        refund_amount: amount.toString(),
        refund_remarks: 'Customer refund request',
        refe_id: `REF_${Date.now()}`,
        format: 'json',
      }).toString(),
    });

    const result = await response.json();

    if (result.status !== 'success') {
      throw new Error(`SSLCommerz refund error: ${result.errorReason}`);
    }

    return {
      transactionId: result.refund_ref_id,
      originalTransactionId: payment.gatewayTransactionId,
    };
  }
}
```

### 11.3 SSLCommerz Webhook Handlers

```typescript
// apps/backend/src/modules/payments/webhooks/sslcommerz.webhook.ts

// IPN Handler
router.post('/sslcommerz/ipn', async (req, res) => {
  try {
    const payment = await paymentService.handleCallback(PaymentMethod.CARD, req.body);
    res.status(200).send('IPN Received');
  } catch (error) {
    console.error('SSLCommerz IPN error:', error);
    res.status(500).send('IPN Error');
  }
});

// Success Handler
router.post('/sslcommerz/success', async (req, res) => {
  try {
    const { value_a: paymentId, value_b: orderId } = req.body;

    // Validate the transaction
    const payment = await paymentService.handleCallback(PaymentMethod.CARD, req.body);

    if (payment.status === PaymentStatus.PAID) {
      res.redirect(`${process.env.WEB_URL}/checkout/success?orderId=${orderId}`);
    } else {
      res.redirect(`${process.env.WEB_URL}/checkout/failed?orderId=${orderId}`);
    }
  } catch (error) {
    res.redirect(`${process.env.WEB_URL}/checkout/error`);
  }
});

// Fail Handler
router.post('/sslcommerz/fail', async (req, res) => {
  const { value_b: orderId } = req.body;
  res.redirect(`${process.env.WEB_URL}/checkout/failed?orderId=${orderId}`);
});

// Cancel Handler
router.post('/sslcommerz/cancel', async (req, res) => {
  const { value_b: orderId } = req.body;
  res.redirect(`${process.env.WEB_URL}/checkout/cancelled?orderId=${orderId}`);
});
```

---

## 12. Security Considerations

### 12.1 Data Protection

| Data                   | Storage               | Encryption               |
| ---------------------- | --------------------- | ------------------------ |
| API Keys / Secrets     | Environment variables | AES-256 at rest          |
| Transaction IDs        | Database              | None (not sensitive)     |
| Card Numbers           | Never stored          | N/A (SSLCommerz handles) |
| bKash/Nagad tokens     | Short-lived in memory | TLS in transit           |
| Bank Account Numbers   | Database              | AES-256 at rest          |
| Customer Phone Numbers | Database              | Masked display           |

### 12.2 Security Measures

```typescript
// Security implementations

// 1. Signature Verification
const verifyBkashSignature = (data: string, signature: string): boolean => {
  // Verify using bKash public key
};

const verifyNagadSignature = (data: string, signature: string): boolean => {
  // Verify using Nagad public key
};

// 2. IP Whitelisting (for webhooks)
const allowedIPs = {
  bkash: ['103.230.30.0/24'],
  nagad: ['203.83.172.0/24'],
  sslcommerz: ['103.26.136.0/24'],
};

// 3. Transaction Amount Validation
const validateAmount = (payment: Payment, callbackAmount: number): boolean => {
  return Math.abs(payment.amount - callbackAmount) < 0.01;
};

// 4. Duplicate Transaction Prevention
const isDuplicateTransaction = async (transactionId: string): Promise<boolean> => {
  const existing = await PaymentModel.findOne({ gatewayTransactionId: transactionId });
  return !!existing;
};

// 5. Rate Limiting
const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment attempts per window
  message: 'Too many payment attempts, please try again later',
});
```

### 12.3 PCI DSS Compliance

Since we're using SSLCommerz as the payment gateway:

- Card data never touches our servers
- Redirect to SSLCommerz hosted page for card entry
- Only store masked card info (last 4 digits)
- No CVV/CVC storage

---

## 13. Testing Strategy

### 13.1 Test Credentials

| Gateway    | Sandbox Credentials                                    |
| ---------- | ------------------------------------------------------ |
| bKash      | App Key: test_app_key, Wallet: 01770618575, PIN: 12121 |
| Nagad      | Merchant ID: test_merchant, Wallet: 01700000000        |
| SSLCommerz | Store ID: teststore, Password: testpass                |

### 13.2 Test Cases

```typescript
// Payment Test Cases

describe('Payment Integration Tests', () => {
  // bKash Tests
  describe('bKash', () => {
    it('should create bKash payment successfully');
    it('should handle bKash callback - success');
    it('should handle bKash callback - failure');
    it('should process bKash refund');
    it('should handle token expiry');
  });

  // Nagad Tests
  describe('Nagad', () => {
    it('should create Nagad payment successfully');
    it('should verify Nagad payment');
    it('should handle Nagad callback');
    it('should process Nagad refund');
  });

  // Bank Transfer Tests
  describe('Bank Transfer', () => {
    it('should return bank details for transfer');
    it('should accept proof submission');
    it('should allow admin verification');
    it('should expire pending transfers');
  });

  // SSLCommerz Tests
  describe('SSLCommerz', () => {
    it('should create card payment session');
    it('should validate IPN');
    it('should handle success callback');
    it('should handle failure callback');
    it('should process refund');
  });

  // Integration Tests
  describe('Checkout Flow', () => {
    it('should complete checkout with bKash');
    it('should complete checkout with bank transfer');
    it('should handle payment timeout');
    it('should prevent duplicate payments');
  });
});
```

---

## 14. Implementation Phases

### Phase 1: Foundation (3-4 days)

1. **Database Schema**
   - Create Payment model
   - Update Order model with payment fields
   - Add payment settings schema

2. **Base Infrastructure**
   - Payment service class
   - Gateway interface/factory
   - API routes structure

3. **Web App UI**
   - Payment method selector component
   - Checkout flow update
   - Payment status pages (success/failed/cancelled)

### Phase 2: Bank Transfer (2-3 days)

1. **Backend**
   - Bank transfer gateway
   - Proof upload endpoint
   - Admin verification endpoint

2. **Web App**
   - Bank details display
   - Proof submission form

3. **Admin Panel**
   - Pending transfers list
   - Verification modal

### Phase 3: bKash Integration (3-4 days)

1. **Backend**
   - bKash gateway implementation
   - Token management
   - Callback handlers

2. **Testing**
   - Sandbox testing
   - Callback verification

### Phase 4: Nagad Integration (3-4 days)

1. **Backend**
   - Nagad gateway implementation
   - Signature handling
   - Callback handlers

2. **Testing**
   - Sandbox testing
   - Integration verification

### Phase 5: SSLCommerz Integration (2-3 days)

1. **Backend**
   - SSLCommerz gateway
   - IPN handler
   - Validation API

2. **Testing**
   - Card payment testing
   - Refund testing

### Phase 6: Polish & Production (2-3 days)

1. **Production Setup**
   - Switch to production credentials
   - IP whitelisting
   - SSL verification

2. **Monitoring**
   - Payment logging
   - Alert setup
   - Dashboard updates

3. **Documentation**
   - API documentation
   - Admin user guide

---

## Summary

This payment system implementation provides:

- **4 Payment Methods:** bKash, Nagad, Bank Transfer, Card (SSLCommerz)
- **Secure Architecture:** PCI DSS compliant, encrypted credentials
- **Admin Control:** Easy verification and refund management
- **Bangladesh Focus:** Local payment methods prioritized
- **Extensible Design:** Easy to add new payment gateways

The phased implementation ensures working features at each stage while building toward the complete payment system.
