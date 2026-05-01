export interface AnalyticsOverview {
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  visitorsChange?: number;
  pageViewsChange?: number;
  bounceRateChange?: number;
  avgSessionDurationChange?: number;
}
