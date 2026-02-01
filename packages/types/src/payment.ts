import type { Id } from './user.js';
import type { PaymentMethod, PaymentStatus } from './enums.js';

/** bKash-specific payment data. */
export interface BkashPaymentData {
  paymentID?: string;
  trxID?: string;
  agreementID?: string;
  payerReference?: string;
  customerMsisdn?: string;
}

/** Nagad-specific payment data. */
export interface NagadPaymentData {
  paymentRefId?: string;
  orderId?: string;
  issuerPaymentRefNo?: string;
  clientMobileNo?: string;
}

/** Bank transfer-specific payment data. */
export interface BankTransferPaymentData {
  bankName?: string;
  accountNumber?: string;
  transactionReference?: string;
  transferDate?: string;
  proofUrl?: string;
  verifiedBy?: Id;
  verifiedAt?: string;
  notes?: string;
}

/** Card payment (SSLCommerz) specific data. */
export interface CardPaymentData {
  sessionKey?: string;
  transactionId?: string;
  validationId?: string;
  cardType?: string;
  cardNo?: string;
  cardIssuer?: string;
  cardBrand?: string;
  cardIssuerCountry?: string;
}

/** Refund details. */
export interface RefundData {
  amount: number;
  reason: string;
  refundedAt: string;
  refundTransactionId?: string;
  refundedBy?: Id;
}

/** Payment entity. */
export interface Payment {
  id: Id;
  orderId: Id;
  userId: Id;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  gatewayResponse?: Record<string, unknown>;
  bkash?: BkashPaymentData;
  nagad?: NagadPaymentData;
  bankTransfer?: BankTransferPaymentData;
  card?: CardPaymentData;
  refund?: RefundData;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Bank account configuration for bank transfers. */
export interface BankAccount {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName?: string;
  routingNumber?: string;
  isActive: boolean;
}

/** bKash payment settings. */
export interface BkashSettings {
  enabled: boolean;
  sandbox: boolean;
  appKey?: string;
  appSecret?: string;
  username?: string;
  password?: string;
  callbackUrl?: string;
}

/** Nagad payment settings. */
export interface NagadSettings {
  enabled: boolean;
  sandbox: boolean;
  merchantId?: string;
  merchantPrivateKey?: string;
  pgPublicKey?: string;
  callbackUrl?: string;
}

/** Bank transfer payment settings. */
export interface BankTransferSettings {
  enabled: boolean;
  accounts: BankAccount[];
  instructions?: string;
  expiryHours: number;
}

/** SSLCommerz payment settings. */
export interface SSLCommerzSettings {
  enabled: boolean;
  sandbox: boolean;
  storeId?: string;
  storePassword?: string;
  successUrl?: string;
  failUrl?: string;
  cancelUrl?: string;
  ipnUrl?: string;
}

/** Cash on Delivery settings. */
export interface CODSettings {
  enabled: boolean;
  instructions?: string;
  minimumOrder: number;
  maximumOrder?: number;
  availableAreas?: string[];
}

/** Payment settings configuration. */
export interface PaymentSettings {
  enabledMethods: PaymentMethod[];
  bkash: BkashSettings;
  nagad: NagadSettings;
  bankTransfer: BankTransferSettings;
  sslcommerz: SSLCommerzSettings;
  cod: CODSettings;
}

/** Payment method info for display. */
export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
}
