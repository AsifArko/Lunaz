import type { ReferrerType } from '../../constants/analytics';

export interface ReferrerData {
  url?: string;
  domain?: string;
  type: ReferrerType;
  searchEngine?: string;
  socialNetwork?: string;
}
