import type { PaymentMethod } from 'constants/enums';
import type { BkashSettings } from './BkashSettings';
import type { NagadSettings } from './NagadSettings';
import type { BankTransferSettings } from './BankTransferSettings';
import type { SSLCommerzSettings } from './SSLCommerzSettings';
import type { CODSettings } from './CODSettings';

/** Payment settings configuration. */
export interface PaymentSettings {
  enabledMethods: PaymentMethod[];
  bkash: BkashSettings;
  nagad: NagadSettings;
  bankTransfer: BankTransferSettings;
  sslcommerz: SSLCommerzSettings;
  cod: CODSettings;
}
