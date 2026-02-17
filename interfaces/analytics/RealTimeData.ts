import type { AnalyticsEventType } from '../../constants/analytics';

export interface RealTimeData {
  activeVisitors: number;
  activePages: Array<{
    path: string;
    visitors: number;
  }>;
  recentEvents: Array<{
    type: AnalyticsEventType;
    timestamp: string;
    page?: string;
    data?: Record<string, unknown>;
  }>;
}
