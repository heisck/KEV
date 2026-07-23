import { ScanVerificationScreen } from '@/screens/kev/ScanVerificationScreen';

/** NFC scan screen using unified fixed dock scanner. */
export function NfcScanScreen() {
  return <ScanVerificationScreen initialMode="NFC" />;
}
