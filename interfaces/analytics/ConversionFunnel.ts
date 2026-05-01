import type { FunnelStage } from './FunnelStage';

export interface ConversionFunnel {
  date: string;
  period: 'daily' | 'weekly' | 'monthly';
  stages: FunnelStage[];
  overallConversion: number;
}
