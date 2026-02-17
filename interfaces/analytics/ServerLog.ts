import type { Id } from '../../types/id';
import type { LogLevel } from '../../constants/analytics';
import type { RequestDetails } from './RequestDetails';
import type { ResponseDetails } from './ResponseDetails';
import type { ClientDetails } from './ClientDetails';
import type { ServerDetails } from './ServerDetails';
import type { ErrorDetails } from './ErrorDetails';

export interface ServerLog {
  id: Id;
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  route?: string;
  statusCode: number;
  statusText?: string;
  duration: number;
  request?: RequestDetails;
  response?: ResponseDetails;
  client?: ClientDetails;
  server?: ServerDetails;
  error?: ErrorDetails;
  level: LogLevel;
  message?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}
