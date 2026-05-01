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
