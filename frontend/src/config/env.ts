import Constants from 'expo-constants';

type Extra = {
  apiUrl: string;
  appEnv: string;
  sentryDsn: string;
  googleWebClientId: string;
  googleIosClientId: string;
  eas?: { projectId?: string };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

/** Typed, validated access to public runtime config (from app.config.ts `extra`). */
export const env = {
  apiUrl: extra.apiUrl ?? 'http://localhost:8080',
  appEnv: extra.appEnv ?? 'development',
  sentryDsn: extra.sentryDsn ?? '',
  googleWebClientId: extra.googleWebClientId ?? '',
  googleIosClientId: extra.googleIosClientId ?? '',
  get isDev() {
    return this.appEnv === 'development';
  },
} as const;
