import { router, useLocalSearchParams } from 'expo-router';

import { VerificationCodeScreen } from '@/screens/VerificationCodeScreen';

/** Decorative step for the email path — no backend OTP yet; forwards to password login. */
export default function Otp() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  return (
    <VerificationCodeScreen
      onBack={() => router.back()}
      onConfirm={() => router.replace({ pathname: '/(auth)/login', params: { email } })}
      recipient={email}
    />
  );
}
