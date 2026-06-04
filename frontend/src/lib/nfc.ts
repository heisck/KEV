import NfcManager, { NfcTech, type TagEvent } from 'react-native-nfc-manager';
import { logger } from '@/lib/logger';

let started = false;

/** Initialize the NFC stack. Returns false if the device has no NFC. */
export async function initNfc(): Promise<boolean> {
  try {
    const supported = await NfcManager.isSupported();
    if (!supported) return false;
    if (!started) {
      await NfcManager.start();
      started = true;
    }
    return true;
  } catch (error) {
    logger.warn('NFC init failed', { error: String(error) });
    return false;
  }
}

/**
 * Read a single NFC tag (read-only use case). The caller drives any UI prompt.
 * Always releases the technology request afterwards.
 */
export async function readTag(): Promise<TagEvent | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    return tag ?? null;
  } catch (error) {
    logger.warn('NFC read cancelled or failed', { error: String(error) });
    return null;
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => undefined);
  }
}
