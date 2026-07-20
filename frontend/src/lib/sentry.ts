import * as Sentry from '@sentry/react-native';
import { env } from '@/config/env';

/** Initialize Sentry once at app start. No-ops when no DSN is configured. */
export function initSentry(): boolean {
  if (!env.sentryDsn) return false;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    tracesSampleRate: env.isDev ? 1.0 : 0.2,
    sendDefaultPii: false,
  });
  return true;
}

export { Sentry };
