import { PaymentStatus } from 'constants/enums';
import { PaymentModel, type PaymentDocument } from '../payments.model.js';
import { OrderModel } from '../../orders/orders.model.js';
import { getSettings } from '../../settings/settings.model.js';
import type { PaymentGateway, CreatePaymentResult, RefundResult, OrderInfo } from './index.js';

interface BkashConfig {
  sandbox: boolean;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
}

interface BkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  expires_in: number;
}

interface BkashCreateResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  bkashURL: string;
}

interface BkashExecuteResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  trxID: string;
  customerMsisdn: string;
  amount: string;
}

/**
 * bKash Payment Gateway implementation.
 */
export class BkashGateway implements PaymentGateway {
  private baseUrl: string = '';
  private appKey: string = '';
  private appSecret: string = '';
  private username: string = '';
  private password: string = '';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private initialized = false;

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    const settings = await getSettings();
    const config = settings.payments?.bkash as BkashConfig | undefined;

    if (!config) {
      throw new Error('bKash configuration not found');
    }

    this.baseUrl = config.sandbox
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
    this.appKey = config.appKey || '';
    this.appSecret = config.appSecret || '';
    this.username = config.username || '';
    this.password = config.password || '';
    this.initialized = true;
  }

  private async getToken(): Promise<string> {
    await this.initialize();

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

    const data = (await response.json()) as BkashTokenResponse;

    if (data.statusCode !== '0000') {
      throw new Error(`bKash token error: ${data.statusMessage}`);
    }

    this.token = data.id_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);

    return this.token;
  }

  async createPayment(payment: PaymentDocument, order: OrderInfo): Promise<CreatePaymentResult> {
    const token = await this.getToken();
    const settings = await getSettings();
    const callbackUrl =
      settings.payments?.bkash?.callbackUrl ||
      `${process.env.API_URL || ''}/api/v1/payments/bkash/callback`;

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
        callbackURL: callbackUrl,
        amount: payment.amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: order.orderNumber,
      }),
    });

    const data = (await response.json()) as BkashCreateResponse;

    if (data.statusCode !== '0000') {
      throw new Error(`bKash create error: ${data.statusMessage}`);
    }

    // Update payment with bKash data
    await PaymentModel.findByIdAndUpdate(payment._id, {
      'bkash.paymentID': data.paymentID,
      gatewayPaymentId: data.paymentID,
      status: PaymentStatus.INITIATED,
    });

    return {
      redirectUrl: data.bkashURL,
      paymentId: data.paymentID,
    };
  }

  private async executePayment(paymentID: string): Promise<BkashExecuteResponse> {
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

    return response.json() as Promise<BkashExecuteResponse>;
  }

  async handleCallback(data: unknown): Promise<PaymentDocument> {
    const callbackData = data as { paymentID: string; status: string };
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
        payment.bkash = {
          ...payment.bkash,
          trxID: executeResult.trxID,
          customerMsisdn: executeResult.customerMsisdn,
        };
        payment.gatewayTransactionId = executeResult.trxID;
        payment.gatewayResponse = executeResult;

        // Update order
        await OrderModel.findByIdAndUpdate(payment.orderId, {
          paymentStatus: PaymentStatus.PAID,
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

  async queryStatus(paymentID: string): Promise<unknown> {
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

  async refund(payment: PaymentDocument, amount: number): Promise<RefundResult> {
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
        paymentID: payment.bkash?.paymentID,
        amount: amount.toString(),
        trxID: payment.bkash?.trxID,
        sku: 'refund',
        reason: 'Customer refund request',
      }),
    });

    const data = (await response.json()) as {
      statusCode: string;
      statusMessage: string;
      refundTrxID: string;
      originalTrxID: string;
    };

    if (data.statusCode !== '0000') {
      throw new Error(`bKash refund error: ${data.statusMessage}`);
    }

    return {
      transactionId: data.refundTrxID,
      originalTransactionId: data.originalTrxID,
    };
  }
}
