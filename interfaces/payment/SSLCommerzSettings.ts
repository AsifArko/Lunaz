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
