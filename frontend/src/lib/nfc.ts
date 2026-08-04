import { Platform } from 'react-native';
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
    await NfcManager.requestTechnology([NfcTech.NfcA, NfcTech.NfcB, NfcTech.IsoDep]);
    const tag = await NfcManager.getTag();
    return tag ?? null;
  } catch (error) {
    logger.warn('NFC read cancelled or failed', { error: String(error) });
    return null;
  } finally {
    await cancelNfcRead();
  }
}

/** Normalize UID formatting differences between Android, iOS, and UITS. */
export function normalizeNfcUid(value: string): string {
  return value
    .trim()
    .replace(/[^a-z\d]/gi, '')
    .toLowerCase();
}

/** Read the hardware UID; NDEF payloads are not identity data for a student card. */
export function parseNfcUidFromTag(tag: TagEvent | null): string | null {
  const uid = tag?.id ? normalizeNfcUid(tag.id) : '';
  return uid || null;
}

/** Release any pending NFC technology request. Safe to call unconditionally. */
export async function cancelNfcRead(): Promise<void> {
  try {
    await NfcManager.cancelTechnologyRequest();
  } catch {
    // no pending request — nothing to release
  }
}

export async function isNfcSupported(): Promise<boolean> {
  try {
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
}

/** Whether NFC is switched on (Android; iOS has no toggle, so treat as enabled). */
export async function isNfcEnabled(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    return await NfcManager.isEnabled();
  } catch {
    return false;
  }
}

/** Open the system NFC settings screen (Android only). */
export function goToNfcSettings(): void {
  if (Platform.OS !== 'android') return;
  NfcManager.goToNfcSetting().catch((error: unknown) => {
    logger.warn('Failed to open NFC settings', { error: String(error) });
  });
}
