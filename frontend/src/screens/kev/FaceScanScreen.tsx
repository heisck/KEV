import { ScanVerificationScreen } from '@/screens/kev/ScanVerificationScreen';

/** Face verification screen using unified fixed dock scanner. */
export function FaceScanScreen() {
  return <ScanVerificationScreen initialMode="FACE" />;
}
