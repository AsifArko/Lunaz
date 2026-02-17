import type { LogLevel } from '../../constants/analytics';

export interface ServerLogsQuery {
  from?: string;
  to?: string;
  level?: LogLevel;
  status?: string;
  method?: string;
  path?: string;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
}
