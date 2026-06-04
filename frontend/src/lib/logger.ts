import { addBreadcrumb, type SeverityLevel } from '@sentry/react-native';

type Level = 'debug' | 'info' | 'warn' | 'error';

const toSentryLevel: Record<Level, SeverityLevel> = {
  debug: 'debug',
  info: 'info',
  warn: 'warning',
  error: 'error',
};

function emit(level: Level, message: string, context?: Record<string, unknown>) {
  const fn = level === 'debug' ? console.log : console[level];
  fn(`[kev] ${message}`, context ?? '');
  addBreadcrumb({ level: toSentryLevel[level], message, data: context });
}

/** App logger that mirrors messages into Sentry breadcrumbs for error tracing. */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => emit('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => emit('error', message, context),
};
