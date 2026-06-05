import { useState } from 'react';

import { AuthScreen } from '@/screens/AuthScreen';
import { RoomSetupScreen } from '@/screens/RoomSetupScreen';
import { VerificationCodeScreen } from '@/screens/VerificationCodeScreen';

type AppStep = 'auth' | 'verify' | 'room';

export default function Index() {
  const [step, setStep] = useState<AppStep>('auth');
  const [email, setEmail] = useState<string | null>(null);

  if (step === 'room') {
    return <RoomSetupScreen onClose={() => setStep('auth')} />;
  }

  if (step === 'verify') {
    return (
      <VerificationCodeScreen
        onBack={() => setStep('auth')}
        onConfirm={() => setStep('room')}
        recipient={email || undefined}
      />
    );
  }

  return (
    <AuthScreen
      onSendCode={(nextEmail) => {
        setEmail(nextEmail);
        setStep('verify');
      }}
    />
  );
}
