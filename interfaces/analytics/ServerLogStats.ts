export interface ServerLogStats {
  totalRequests: number;
  errorCount: number;
  warnCount: number;
  avgResponseTime: number;
  statusCodes: Record<string, number>;
  topPaths: Array<{ path: string; count: number }>;
  topErrors: Array<{ message: string; count: number }>;
}
