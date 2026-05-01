/** Nagad payment settings. */
export interface NagadSettings {
  enabled: boolean;
  sandbox: boolean;
  merchantId?: string;
  merchantPrivateKey?: string;
  pgPublicKey?: string;
  callbackUrl?: string;
}
