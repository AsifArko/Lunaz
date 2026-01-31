import type { Product } from '@lunaz/types';

export interface PriceProps {
  amount: number;
  currency?: string;
  className?: string;
}

const defaultCurrency = 'BDT';

export function Price({ amount, currency = defaultCurrency, className = '' }: PriceProps) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return <span className={className}>{formatted}</span>;
}

/** Resolve price for a product (base or variant override). */
export function getProductPrice(product: Product, variantId?: string): number {
  if (variantId) {
    const v = product.variants.find((x) => x.id === variantId);
    if (v?.priceOverride != null) return v.priceOverride;
  }
  return product.basePrice;
}
