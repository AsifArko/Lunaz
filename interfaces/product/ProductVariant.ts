/** Product variant (size, SKU, price override, stock). */
export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  priceOverride?: number;
  stock?: number;
  attributes?: Record<string, string>;
}
