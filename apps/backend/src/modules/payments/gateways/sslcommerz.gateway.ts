import { PaymentStatus } from '@lunaz/types';
import { PaymentModel, type PaymentDocument } from '../payments.model.js';
import { OrderModel } from '../../orders/orders.model.js';
import { UserModel } from '../../auth/auth.model.js';
import { getSettings } from '../../settings/settings.model.js';
import type { PaymentGateway, CreatePaymentResult, RefundResult, OrderInfo } from './index.js';

interface SSLCommerzConfig {
  sandbox: boolean;
  storeId: string;
  storePassword: string;
  successUrl?: string;
  failUrl?: string;
  cancelUrl?: string;
  ipnUrl?: string;
}

interface SSLCommerzInitResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
}

/**
 * SSLCommerz Payment Gateway implementation for card payments.
 */
export class SSLCommerzGateway implements PaymentGateway {
  private baseUrl: string = '';
  private storeId: string = '';
  private storePassword: string = '';
  private successUrl: string = '';
  private failUrl: string = '';
  private cancelUrl: string = '';
  private ipnUrl: string = '';
  private initialized = false;

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    const settings = await getSettings();
    const config = settings.payments?.sslcommerz as SSLCommerzConfig | undefined;

    if (!config) {
      throw new Error('SSLCommerz configuration not found');
    }

    const apiUrl = process.env.API_URL || '';
    const webUrl = process.env.WEB_URL || '';

    this.baseUrl = config.sandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com';
    this.storeId = config.storeId || '';
    this.storePassword = config.storePassword || '';
    this.successUrl = config.successUrl || `${apiUrl}/api/v1/payments/sslcommerz/success`;
    this.failUrl = config.failUrl || `${apiUrl}/api/v1/payments/sslcommerz/fail`;
    this.cancelUrl = config.cancelUrl || `${apiUrl}/api/v1/payments/sslcommerz/cancel`;
    this.ipnUrl = config.ipnUrl || `${apiUrl}/api/v1/payments/sslcommerz/ipn`;
    this.initialized = true;
  }

  async createPayment(payment: PaymentDocument, order: OrderInfo): Promise<CreatePaymentResult> {
    await this.initialize();

    const user = await UserModel.findById(payment.userId);
    const transactionId = `TXN_${order.orderNumber}_${Date.now()}`;

    const postData: Record<string, string> = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: payment.amount.toString(),
      currency: 'BDT',
      tran_id: transactionId,
      success_url: this.successUrl,
      fail_url: this.failUrl,
      cancel_url: this.cancelUrl,
      ipn_url: this.ipnUrl,

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

      // Reference values
      value_a: payment._id.toString(),
      value_b: order._id.toString(),
    };

    const response = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(postData).toString(),
    });

    const result = (await response.json()) as SSLCommerzInitResponse;

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
      paymentId: transactionId,
    };
  }

  async handleCallback(data: unknown): Promise<PaymentDocument> {
    await this.initialize();

    const ipnData = data as {
      value_a?: string;
      val_id?: string;
      tran_id?: string;
      card_type?: string;
      card_no?: string;
      card_issuer?: string;
      card_brand?: string;
      card_issuer_country?: string;
      bank_tran_id?: string;
      status?: string;
    };

    // Validate IPN
    const validationResult = await this.validateTransaction(ipnData.val_id || '');

    const payment = await PaymentModel.findById(ipnData.value_a);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (validationResult.status === 'VALID' || validationResult.status === 'VALIDATED') {
      payment.status = PaymentStatus.PAID;
      payment.card = {
        ...payment.card,
        validationId: ipnData.val_id,
        cardType: ipnData.card_type,
        cardNo: ipnData.card_no,
        cardIssuer: ipnData.card_issuer,
        cardBrand: ipnData.card_brand,
        cardIssuerCountry: ipnData.card_issuer_country,
      };
      payment.gatewayTransactionId = ipnData.bank_tran_id;
      payment.gatewayResponse = ipnData;

      // Update order
      await OrderModel.findByIdAndUpdate(payment.orderId, {
        paymentStatus: PaymentStatus.PAID,
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

  async validateTransaction(valId: string): Promise<{ status: string }> {
    const response = await fetch(
      `${this.baseUrl}/validator/api/validationserverAPI.php?` +
        `val_id=${valId}&store_id=${this.storeId}&store_passwd=${this.storePassword}&format=json`,
      { method: 'GET' }
    );

    return response.json() as Promise<{ status: string }>;
  }

  async refund(payment: PaymentDocument, amount: number): Promise<RefundResult> {
    await this.initialize();

    const response = await fetch(`${this.baseUrl}/validator/api/merchantTransIDvalidationAPI.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        store_id: this.storeId,
        store_passwd: this.storePassword,
        bank_tran_id: payment.gatewayTransactionId || '',
        refund_amount: amount.toString(),
        refund_remarks: 'Customer refund request',
        refe_id: `REF_${Date.now()}`,
        format: 'json',
      }).toString(),
    });

    const result = (await response.json()) as {
      status: string;
      errorReason?: string;
      refund_ref_id?: string;
    };

    if (result.status !== 'success') {
      throw new Error(`SSLCommerz refund error: ${result.errorReason}`);
    }

    return {
      transactionId: result.refund_ref_id || `SSL_REFUND_${Date.now()}`,
      originalTransactionId: payment.gatewayTransactionId,
    };
  }
}
