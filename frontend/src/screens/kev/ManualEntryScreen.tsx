import { ScanVerificationScreen } from '@/screens/kev/ScanVerificationScreen';

/** Manual entry screen using unified fixed dock scanner. */
export function ManualEntryScreen() {
  return <ScanVerificationScreen initialMode="MANUAL" />;
}
