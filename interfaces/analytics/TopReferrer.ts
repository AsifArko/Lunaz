import type { ReferrerType } from '../../constants/analytics';

export interface TopReferrer {
  domain: string;
  type: ReferrerType;
  visitors: number;
  icon?: string;
}
