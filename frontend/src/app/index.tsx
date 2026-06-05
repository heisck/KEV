import { useState } from 'react';

import { AuthScreen } from '@/screens/AuthScreen';
import { VerificationCodeScreen } from '@/screens/VerificationCodeScreen';

export default function Index() {
  const [email, setEmail] = useState<string | null>(null);

  if (email) {
    return <VerificationCodeScreen onBack={() => setEmail(null)} recipient={email} />;
  }

  return <AuthScreen onSendCode={setEmail} />;
}
