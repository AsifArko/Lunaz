import type { Id } from '../../types/id';
import type { AnalyticsEventType } from '../../constants/analytics';
import type { PageData } from './PageData';
import type { ReferrerData } from './ReferrerData';
import type { UTMData } from './UTMData';
import type { GeoData } from './GeoData';
import type { DeviceData } from './DeviceData';
import type { CustomEventData } from './CustomEventData';

export interface TrafficLog {
  id: Id;
  visitorId: string;
  sessionId: string;
  userId?: Id;
  timestamp: string;
  type: AnalyticsEventType;
  page: PageData;
  referrer?: ReferrerData;
  utm?: UTMData;
  geo?: GeoData;
  device?: DeviceData;
  event?: CustomEventData;
  ip?: string;
  createdAt: string;
}
