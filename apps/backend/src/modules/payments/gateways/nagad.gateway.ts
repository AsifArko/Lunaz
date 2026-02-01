import crypto from 'crypto';
import { PaymentStatus } from '@lunaz/types';
import { PaymentModel, type PaymentDocument } from '../payments.model.js';
import { OrderModel } from '../../orders/orders.model.js';
import { getSettings } from '../../settings/settings.model.js';
import type { PaymentGateway, CreatePaymentResult, RefundResult, OrderInfo } from './index.js';

interface NagadConfig {
  sandbox: boolean;
  merchantId: string;
  merchantPrivateKey: string;
  pgPublicKey: string;
  callbackUrl?: string;
}

/**
 * Nagad Payment Gateway implementation.
 */
export class NagadGateway implements PaymentGateway {
  private baseUrl: string = '';
  private merchantId: string = '';
  private merchantPrivateKey: string = '';
  private pgPublicKey: string = '';
  private callbackUrl: string = '';
  private initialized = false;

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    const settings = await getSettings();
    const config = settings.payments?.nagad as NagadConfig | undefined;

    if (!config) {
      throw new Error('Nagad configuration not found');
    }

    this.baseUrl = config.sandbox
      ? 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0'
      : 'https://api.mynagad.com/api/dfs';
    this.merchantId = config.merchantId || '';
    this.merchantPrivateKey = config.merchantPrivateKey || '';
    this.pgPublicKey = config.pgPublicKey || '';
    this.callbackUrl =
      config.callbackUrl || `${process.env.API_URL || ''}/api/v1/payments/nagad/callback`;
    this.initialized = true;
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

  private getDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  }

  async createPayment(payment: PaymentDocument, order: OrderInfo): Promise<CreatePaymentResult> {
    await this.initialize();

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

    const initResult = (await initResponse.json()) as {
      reason?: string;
      sensitiveData: string;
    };

    if (initResult.reason) {
      throw new Error(`Nagad init error: ${initResult.reason}`);
    }

    // Decrypt sensitive data
    const sensitiveData = JSON.parse(this.decryptData(initResult.sensitiveData)) as {
      paymentReferenceId: string;
      challenge: string;
    };
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
      merchantCallbackURL: this.callbackUrl,
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

    const completeResult = (await completeResponse.json()) as {
      reason?: string;
      callBackUrl: string;
    };

    if (completeResult.reason) {
      throw new Error(`Nagad complete error: ${completeResult.reason}`);
    }

    // Update payment with Nagad data
    await PaymentModel.findByIdAndUpdate(payment._id, {
      'nagad.paymentRefId': paymentReferenceId,
      'nagad.orderId': orderId,
      gatewayPaymentId: paymentReferenceId,
      status: PaymentStatus.INITIATED,
    });

    return {
      redirectUrl: completeResult.callBackUrl,
      paymentId: paymentReferenceId,
    };
  }

  async handleCallback(data: unknown): Promise<PaymentDocument> {
    await this.initialize();

    const callbackData = data as {
      payment_ref_id?: string;
      paymentRefId?: string;
    };
    const paymentRefId = callbackData.payment_ref_id || callbackData.paymentRefId;

    const payment = await PaymentModel.findOne({
      'nagad.paymentRefId': paymentRefId,
    });
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

    const verifyResult = (await verifyResponse.json()) as {
      status: string;
      message?: string;
      issuerPaymentRefNo?: string;
      clientMobileNo?: string;
    };

    if (verifyResult.status === 'Success') {
      payment.status = PaymentStatus.PAID;
      payment.nagad = {
        ...payment.nagad,
        issuerPaymentRefNo: verifyResult.issuerPaymentRefNo,
        clientMobileNo: verifyResult.clientMobileNo,
      };
      payment.gatewayTransactionId = verifyResult.issuerPaymentRefNo;
      payment.gatewayResponse = verifyResult;

      // Update order
      await OrderModel.findByIdAndUpdate(payment.orderId, {
        paymentStatus: PaymentStatus.PAID,
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

  async refund(payment: PaymentDocument, amount: number): Promise<RefundResult> {
    await this.initialize();

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
        originalPaymentRefId: payment.nagad?.paymentRefId,
        refundAmount: amount.toString(),
        referenceReason: 'Customer refund request',
      }),
    });

    const refundResult = (await refundResponse.json()) as {
      status: string;
      message?: string;
      refundTrxId?: string;
    };

    if (refundResult.status !== 'Success') {
      throw new Error(`Nagad refund error: ${refundResult.message}`);
    }

    return {
      transactionId: refundResult.refundTrxId || `NAGAD_REFUND_${Date.now()}`,
      originalTransactionId: payment.nagad?.issuerPaymentRefNo,
    };
  }
}
