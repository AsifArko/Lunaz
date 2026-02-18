import type { Id } from 'types/id';
import type { PageData } from './PageData';
import type { PerformanceMetrics } from './PerformanceMetrics';
import type { ConnectionData } from './ConnectionData';
import type { DeviceData } from './DeviceData';

export interface PerformanceLog {
  id: Id;
  visitorId: string;
  sessionId: string;
  timestamp: string;
  page: PageData;
  metrics: PerformanceMetrics;
  connection?: ConnectionData;
  device?: Partial<DeviceData>;
  createdAt: string;
}
