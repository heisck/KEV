import { isExpoGo } from '@/lib/googleAuth';
import { logger } from '@/lib/logger';

/** Detect which check-in hardware paths are available on this device/runtime. */
export async function getScanCapabilities(): Promise<{ nfc: boolean; camera: boolean }> {
  return { nfc: await hasNfc(), camera: hasCamera() };
}

async function hasNfc(): Promise<boolean> {
  if (isExpoGo()) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NfcManager = (
      require('react-native-nfc-manager') as { default: { isSupported: () => Promise<boolean> } }
    ).default;
    return await NfcManager.isSupported();
  } catch (error) {
    logger.debug('NFC unavailable', { error: String(error) });
    return false;
  }
}

function hasCamera(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('expo-camera');
    return true;
  } catch {
    return false;
  }
}
