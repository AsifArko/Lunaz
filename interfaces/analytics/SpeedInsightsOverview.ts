export interface SpeedInsightsOverview {
  lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  inp?: { value: number; rating: 'good' | 'needs-improvement' | 'poor'; p75: number };
  ttfb: { value: number; p75: number };
  samples: number;
}
