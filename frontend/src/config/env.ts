import Constants from 'expo-constants';
import { Platform } from 'react-native';

type Extra = {
  apiUrl: string;
  appEnv: string;
  sentryDsn: string;
  googleWebClientId: string;
  googleIosClientId: string;
  eas?: { projectId?: string };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

function resolveApiUrl(rawUrl: string): string {
  // If explicitly pointing to a remote/staging server (not localhost/127.0.0.1), use it directly.
  if (rawUrl && !rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1')) {
    return rawUrl;
  }
  // Try to resolve Metro host IP from Expo manifest (needed for physical phones / Expo Go over Wi-Fi)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      ?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:8080`;
    }
  }
  // Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }
  return rawUrl || 'http://localhost:8080';
}

/** Typed, validated access to public runtime config (from app.config.ts `extra`). */
export const env = {
  apiUrl: resolveApiUrl(extra.apiUrl ?? 'http://localhost:8080'),
  appEnv: extra.appEnv ?? 'development',
  sentryDsn: extra.sentryDsn ?? '',
  googleWebClientId: extra.googleWebClientId ?? '',
  googleIosClientId: extra.googleIosClientId ?? '',
  get isDev() {
    return this.appEnv === 'development';
  },
} as const;
