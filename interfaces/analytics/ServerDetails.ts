export interface ServerDetails {
  host?: string;
  environment?: string;
  version?: string;
  nodeVersion?: string;
  pid?: number;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}
