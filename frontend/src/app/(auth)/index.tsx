import { router } from 'expo-router';
import { useCallback } from 'react';

import { signInWithApple } from '@/lib/appleAuth';
import { useGoogleSignIn } from '@/lib/googleAuth';
import { logger } from '@/lib/logger';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAuthStore } from '@/store/authStore';

/**
 * "Verify your account" — the single sign-in surface. Lecturers are
 * pre-provisioned; there is no self-registration anywhere in the app.
 */
export default function Welcome() {
  const signInWithGoogleIdToken = useAuthStore((s) => s.signInWithGoogleIdToken);
  const signInWithAppleIdToken = useAuthStore((s) => s.signInWithAppleIdToken);
  const { signIn, isConfigured } = useGoogleSignIn();

  const handleGoogle = useCallback(async () => {
    if (!isConfigured) {
      logger.warn('Google sign-in is not configured for this build');
      return;
    }
    try {
      const idToken = await signIn();
      if (idToken) await signInWithGoogleIdToken(idToken);
    } catch (error: unknown) {
      logger.warn('Google sign-in failed', { error });
    }
  }, [isConfigured, signIn, signInWithGoogleIdToken]);

  const handleApple = useCallback(async () => {
    try {
      const credential = await signInWithApple();
      if (credential) await signInWithAppleIdToken(credential.identityToken, credential.fullName);
    } catch (error: unknown) {
      logger.warn('Apple sign-in failed', { error });
    }
  }, [signInWithAppleIdToken]);

  return (
    <AuthScreen
      onGooglePress={() => void handleGoogle()}
      onApplePress={() => void handleApple()}
      onSendCode={(email) => router.push({ pathname: '/(auth)/login', params: { email } })}
    />
  );
}
