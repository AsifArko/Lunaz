import type { DeviceType } from 'constants/analytics';

export interface DeviceData {
  type: DeviceType;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  engine?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  touchEnabled?: boolean;
  language?: string;
  userAgent?: string;
}
