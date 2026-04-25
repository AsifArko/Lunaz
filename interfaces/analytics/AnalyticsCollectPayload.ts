import type { AnalyticsEventType } from 'constants/analytics';
import type { PageData } from './PageData';
import type { ReferrerData } from './ReferrerData';
import type { UTMData } from './UTMData';
import type { CustomEventData } from './CustomEventData';
import type { DeviceData } from './DeviceData';

export interface AnalyticsCollectPayload {
  visitorId: string;
  sessionId: string;
  events: Array<{
    type: AnalyticsEventType;
    timestamp: string;
    page: PageData;
    referrer?: ReferrerData;
    utm?: UTMData;
    event?: CustomEventData;
    device?: Partial<DeviceData>;
  }>;
}
