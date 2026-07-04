import { useCallback, useState } from 'react';

import { getProblemDetail } from '@/api/schemas';
import { signInWithApple } from '@/lib/appleAuth';
import { useGoogleSignIn } from '@/lib/googleAuth';
import { logger } from '@/lib/logger';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAuthStore } from '@/store/authStore';

/**
 * "Verify Account" — the single sign-in surface (email/password, Google, Apple).
 * Lecturers are pre-provisioned; there is no self-registration anywhere.
 */
export default function Welcome() {
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const signInWithGoogleIdToken = useAuthStore((s) => s.signInWithGoogleIdToken);
  const signInWithAppleIdToken = useAuthStore((s) => s.signInWithAppleIdToken);
  const { signIn, isConfigured } = useGoogleSignIn();
  const [problem, setProblem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignIn = useCallback(
    async (email: string, password: string) => {
      if (!email || !password) {
        setProblem('Enter your email and password');
        return;
      }
      setProblem(null);
      setIsSubmitting(true);
      try {
        await signInWithPassword(email, password);
        // Success flips authStore status; the (auth) layout redirects to the tabs.
      } catch (error: unknown) {
        const detail = getProblemDetail(error);
        setProblem(detail?.detail ?? detail?.title ?? 'Could not sign in. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [signInWithPassword],
  );

  const handleGoogle = useCallback(async () => {
    if (!isConfigured) {
      setProblem('Google sign-in is not configured for this build');
      return;
    }
    try {
      const idToken = await signIn();
      if (idToken) await signInWithGoogleIdToken(idToken);
    } catch (error: unknown) {
      logger.warn('Google sign-in failed', { error });
      setProblem('Google sign-in failed. Try again.');
    }
  }, [isConfigured, signIn, signInWithGoogleIdToken]);

  const handleApple = useCallback(async () => {
    try {
      const credential = await signInWithApple();
      if (credential) await signInWithAppleIdToken(credential.identityToken, credential.fullName);
    } catch (error: unknown) {
      logger.warn('Apple sign-in failed', { error });
      setProblem('Apple sign-in failed. Try again.');
    }
  }, [signInWithAppleIdToken]);

  return (
    <AuthScreen
      onGooglePress={() => void handleGoogle()}
      onApplePress={() => void handleApple()}
      onEmailSignIn={(email, password) => void handleEmailSignIn(email, password)}
      errorMessage={problem}
      isSubmitting={isSubmitting}
    />
  );
}
