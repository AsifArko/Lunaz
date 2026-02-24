/**
 * Structured logger for the backend.
 * Use this instead of console.log/error for consistent, filterable logging.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export interface LogContext {
  requestId?: string;
  path?: string;
  method?: string;
  userId?: string;
  [key: string]: unknown;
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  const sensitive = ['password', 'token', 'secret', 'authorization', 'cookie', 'apiKey'];
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (sensitive.some((s) => lower.includes(s))) {
      out[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      out[key] = sanitize(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function formatMessage(
  level: LogLevel,
  message: string,
  context?: LogContext,
  meta?: unknown
): string {
  const timestamp = formatTimestamp();
  const payload: Record<string, unknown> = {
    timestamp,
    level,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
    ...(meta !== undefined ? { meta: sanitize(meta) } : {}),
  };

  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(payload);
  }
  return `${timestamp} [${level.toUpperCase()}] ${message}${context && Object.keys(context).length > 0 ? ' ' + JSON.stringify(context) : ''}${meta !== undefined ? ' ' + JSON.stringify(sanitize(meta)) : ''}`;
}

function log(level: LogLevel, message: string, context?: LogContext, meta?: unknown): void {
  if (!shouldLog(level)) return;

  const formatted = formatMessage(level, message, context, meta);

  switch (level) {
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(formatted);
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.log(formatted);
      break;
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(formatted);
      break;
    case 'error':
      // eslint-disable-next-line no-console
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext, meta?: unknown) =>
    log('debug', message, context, meta),
  info: (message: string, context?: LogContext, meta?: unknown) =>
    log('info', message, context, meta),
  warn: (message: string, context?: LogContext, meta?: unknown) =>
    log('warn', message, context, meta),
  error: (message: string, context?: LogContext, meta?: unknown) =>
    log('error', message, context, meta),

  /** Log an Error with stack trace. Use for caught exceptions. */
  errorException(err: unknown, message?: string, context?: LogContext): void {
    const msg = message ?? (err instanceof Error ? err.message : 'Unknown error');
    const meta =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : { raw: String(err) };
    log('error', msg, context, meta);
  },
};
