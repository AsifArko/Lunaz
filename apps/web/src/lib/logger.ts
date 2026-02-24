/**
 * Frontend logger - use instead of console.log/error for consistent logging.
 * In development: logs to console with levels.
 * In production: only errors/warns by default; can be configured via window.__LOG_LEVEL__.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getCurrentLevel(): LogLevel {
  const w =
    typeof window !== 'undefined' ? (window as Window & { __LOG_LEVEL__?: LogLevel }) : null;
  if (w?.__LOG_LEVEL__) {
    return w.__LOG_LEVEL__;
  }
  return import.meta.env.DEV ? 'debug' : 'warn';
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getCurrentLevel()];
}

export interface LogContext {
  path?: string;
  status?: number;
  [key: string]: unknown;
}

function formatMessage(
  level: LogLevel,
  message: string,
  context?: LogContext,
  meta?: unknown
): void {
  const prefix = `[${level.toUpperCase()}]`;
  if (import.meta.env.DEV) {
    const args: unknown[] = [prefix, message];
    if (context && Object.keys(context).length > 0) args.push(context);
    if (meta !== undefined) args.push(meta);
    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(...args);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(...args);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(...args);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(...args);
        break;
    }
  } else if (level === 'error' || level === 'warn') {
    // eslint-disable-next-line no-console
    console[level](prefix, message, context ?? {}, meta ?? {});
  }
}

export const logger = {
  debug: (message: string, context?: LogContext, meta?: unknown) => {
    if (shouldLog('debug')) formatMessage('debug', message, context, meta);
  },
  info: (message: string, context?: LogContext, meta?: unknown) => {
    if (shouldLog('info')) formatMessage('info', message, context, meta);
  },
  warn: (message: string, context?: LogContext, meta?: unknown) => {
    if (shouldLog('warn')) formatMessage('warn', message, context, meta);
  },
  error: (message: string, context?: LogContext, meta?: unknown) => {
    if (shouldLog('error')) formatMessage('error', message, context, meta);
  },

  /** Log an Error with stack. Use for caught exceptions. */
  errorException(err: unknown, message?: string, context?: LogContext): void {
    const msg = message ?? (err instanceof Error ? err.message : 'Unknown error');
    const meta =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : { raw: String(err) };
    formatMessage('error', msg, context, meta);
  },
};
