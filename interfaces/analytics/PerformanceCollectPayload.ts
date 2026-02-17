import type { PageData } from './PageData';
import type { PerformanceMetrics } from './PerformanceMetrics';
import type { ConnectionData } from './ConnectionData';
import type { DeviceData } from './DeviceData';

export interface PerformanceCollectPayload {
  visitorId: string;
  sessionId: string;
  page: PageData;
  metrics: PerformanceMetrics;
  connection?: ConnectionData;
  device?: Partial<DeviceData>;
}
