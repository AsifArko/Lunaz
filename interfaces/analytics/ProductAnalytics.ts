import type { Id } from '../../types/id';

export interface ProductAnalytics {
  id: Id;
  productId: Id;
  date: string;
  views: number;
  uniqueViewers: number;
  addToCart: number;
  purchases: number;
  revenue: number;
  avgViewDuration: number;
  searchAppearances: number;
  searchClicks: number;
  categoryViews: number;
  directViews: number;
}
