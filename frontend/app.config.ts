import type { ExpoConfig } from 'expo/config';

/**
 * Dynamic, env-aware Expo config (replaces app.json).
 * Public values flow in via EXPO_PUBLIC_* and are surfaced through `extra`
 * (read in src/config/env.ts). Real secrets are never committed — see .env.example.
 *
 * NOTE: The Google sign-in and Sentry Expo *config plugins* are intentionally left
 * out here so `expo prebuild` / `expo-doctor` stay green without real credentials.
 * Before an iOS/production build, add:
 *   ['@react-native-google-signin/google-signin', { iosUrlScheme: '<reversed-ios-client-id>' }]
 *   ['@sentry/react-native/expo', { organization: '<org>', project: 'kev-frontend' }]
 */
const config: ExpoConfig = {
  name: 'KEV',
  slug: 'kev',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'kev',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/images/icon.png',
    bundleIdentifier: 'com.kev.app',
    supportsTablet: true,
  },
  android: {
    package: 'com.kev.app',
    adaptiveIcon: {
      backgroundColor: '#5C9E08',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.NFC'],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#5C9E08',
        image: './assets/images/splash-start.png',
        imageWidth: 160,
      },
    ],
    [
      'react-native-nfc-manager',
      {
        nfcPermission: 'KEV uses NFC to read session and attendance tags.',
        includeNdefEntitlement: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080',
    appEnv: process.env.EXPO_PUBLIC_ENV ?? 'development',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    eas: { projectId: process.env.EAS_PROJECT_ID ?? '' },
  },
};

export default config;
