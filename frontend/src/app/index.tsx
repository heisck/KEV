import { useState } from 'react';

import { AuthScreen } from '@/screens/AuthScreen';
import { NfcVerificationScreen } from '@/screens/NfcVerificationScreen';
import { RoomSetupScreen } from '@/screens/RoomSetupScreen';
import { StudentVerificationResultScreen } from '@/screens/StudentVerificationResultScreen';
import { VerificationCodeScreen } from '@/screens/VerificationCodeScreen';

type AppStep = 'auth' | 'nfc' | 'result' | 'room' | 'verify';
const ROOM_CODE = '482913';

export default function Index() {
  const [step, setStep] = useState<AppStep>('auth');
  const [email, setEmail] = useState<string | null>(null);

  if (step === 'room') {
    return <RoomSetupScreen onComplete={() => setStep('nfc')} roomCode={ROOM_CODE} />;
  }

  if (step === 'nfc') {
    return (
      <NfcVerificationScreen
        onClose={() => setStep('room')}
        onFaceCapture={() => setStep('result')}
        onManualSubmit={() => setStep('result')}
        onNfcScan={() => setStep('result')}
        roomCode={ROOM_CODE}
      />
    );
  }

  if (step === 'result') {
    return <StudentVerificationResultScreen onClose={() => setStep('nfc')} />;
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
