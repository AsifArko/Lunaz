export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  fcp?: number;
  domContentLoaded?: number;
  loadComplete?: number;
  resourceCount?: number;
  totalResourceSize?: number;
  cachedResources?: number;
  customMarks?: Record<string, number>;
}
