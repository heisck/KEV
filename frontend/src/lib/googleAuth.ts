import { useCallback, useRef } from 'react';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

WebBrowser.maybeCompleteAuthSession();

/** True when running inside the Expo Go client (no custom native modules). */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

type GoogleSignInModule = {
  GoogleSignin: {
    configure: (options: { webClientId: string }) => void;
    hasPlayServices: () => Promise<boolean>;
    signIn: () => Promise<{ data?: { idToken?: string | null } | null }>;
  };
};

let nativeConfigured = false;

async function nativeSignIn(): Promise<string | null> {
  try {
    // Absent in Expo Go — must never be required at module scope.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleSignin } =
      require('@react-native-google-signin/google-signin') as GoogleSignInModule;
    if (!nativeConfigured) {
      GoogleSignin.configure({ webClientId: env.googleWebClientId });
      nativeConfigured = true;
    }
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    return result.data?.idToken ?? null;
  } catch (error) {
    logger.warn('Native Google sign-in failed', { error: String(error) });
    return null;
  }
}

/** Google sign-in that works in both Expo Go (AuthSession) and dev builds (native SDK). */
export function useGoogleSignIn(): { signIn: () => Promise<string | null>; isConfigured: boolean } {
  const [, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId || undefined,
  });
  const promptRef = useRef(promptAsync);
  promptRef.current = promptAsync;

  const signIn = useCallback(async (): Promise<string | null> => {
    if (!isExpoGo()) return nativeSignIn();
    try {
      const result = await promptRef.current();
      if (result.type !== 'success') return null;
      return (result.params.id_token as string | undefined) ?? null;
    } catch (error) {
      logger.warn('Google auth session failed', { error: String(error) });
      return null;
    }
  }, []);

  return { signIn, isConfigured: !!env.googleWebClientId };
}
