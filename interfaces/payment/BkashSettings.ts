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
