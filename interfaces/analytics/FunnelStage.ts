export interface FunnelStage {
  name: string;
  visitors: number;
  dropoff: number;
  conversionRate: number;
  avgTimeToNext?: number;
}
