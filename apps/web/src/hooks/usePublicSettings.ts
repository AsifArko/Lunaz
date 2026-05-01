import { useState, useEffect } from 'react';
import { api } from '@/api/client';

export interface PublicSettings {
  storeName?: string;
  currency?: string;
  allowGuestCheckout?: boolean;
  enableTax?: boolean;
  taxRate?: number;
  taxLabel?: string;
  taxIncludedInPrices?: boolean;
  displayTaxInCart?: boolean;
  shippingInsideDhaka?: number;
  shippingOutsideDhaka?: number;
  allowBackorder?: boolean;
}

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    api<PublicSettings>('/settings/public')
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  return settings;
}
