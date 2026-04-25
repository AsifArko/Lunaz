/** SSLCommerz IPN data. */
export interface SSLCommerzIPNData {
  tran_id: string;
  val_id: string;
  amount: string;
  card_type?: string;
  card_no?: string;
  card_issuer?: string;
  card_brand?: string;
  card_issuer_country?: string;
  bank_tran_id?: string;
  status: string;
  value_a?: string;
  value_b?: string;
  [key: string]: unknown;
}
