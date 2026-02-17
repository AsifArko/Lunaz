import type { DeviceType } from '../../constants/analytics';

export interface DeviceStats {
  type: DeviceType;
  count: number;
  percentage: number;
}
