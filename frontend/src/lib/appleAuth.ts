import { Platform } from 'react-native';

import { logger } from '@/lib/logger';

export type AppleCredential = { identityToken: string; fullName: string | null };

/** Lazy so non-iOS platforms never touch the native module. */
function loadAppleAuth(): typeof import('expo-apple-authentication') | null {
  if (Platform.OS !== 'ios') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-apple-authentication') as typeof import('expo-apple-authentication');
  } catch {
    return null;
  }
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  const apple = loadAppleAuth();
  if (!apple) return false;
  try {
    return await apple.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Runs the native Apple sign-in sheet. Returns null when the user cancels. */
export async function signInWithApple(): Promise<AppleCredential | null> {
  const apple = loadAppleAuth();
  if (!apple) return null;
  try {
    const credential = await apple.signInAsync({
      requestedScopes: [
        apple.AppleAuthenticationScope.FULL_NAME,
        apple.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) return null;
    const name = [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter(Boolean)
      .join(' ');
    return { identityToken: credential.identityToken, fullName: name || null };
  } catch (error: unknown) {
    // ERR_REQUEST_CANCELED = user dismissed the sheet — not an error.
    if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    logger.warn('Apple sign-in failed', { error: String(error) });
    return null;
  }
}
