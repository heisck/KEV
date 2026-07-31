import { useCallback, useState } from 'react';

import { getProblemDetail } from '@/api/schemas';
import { toast } from '@/lib/toast';
import { AuthScreen } from '@/screens/AuthScreen';
import { useAuthStore } from '@/store/authStore';

/**
 * "Verify Account" — the single sign-in surface (email/password only).
 * Lecturers are provisioned by an admin; there is no self-registration or social sign-in.
 */
export default function Welcome() {
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignIn = useCallback(
    async (email: string, password: string) => {
      if (!email || !password) {
        toast.error('Enter your email and password');
        return;
      }
      setIsSubmitting(true);
      try {
        await signInWithPassword(email, password);
        // Success flips authStore status; the (auth) layout redirects to the tabs.
      } catch (error: unknown) {
        const detail = getProblemDetail(error);
        toast.error(detail?.detail ?? detail?.title ?? 'Could not sign in. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [signInWithPassword],
  );

  return (
    <AuthScreen
      onEmailSignIn={(email, password) => void handleEmailSignIn(email, password)}
      isSubmitting={isSubmitting}
    />
  );
}
