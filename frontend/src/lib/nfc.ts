// FIX: This is a refactor of the entire file
import { Platform } from 'react-native';
import NfcManager, { NfcTech, type TagEvent } from 'react-native-nfc-manager';

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
  } catch {
    return false;
  }
}

/**
 * Read a single NFC tag using low-level protocols.
 * Infinite loop fallback prevents hardware polling timeouts.
 */
export async function readTag(): Promise<TagEvent | null> {
  // Keep trying to capture the tag if the hardware drops the polling connection
  while (true) {
    try {
      await NfcManager.requestTechnology([NfcTech.NfcA, NfcTech.NfcB, NfcTech.IsoDep]);
      const tag = await NfcManager.getTag();
      return tag ?? null;
    } catch (error) {
      // If the user deliberately canceled via UI, break the loop and exit
      if (String(error).includes('UserCancel')) {
        return null;
      }
      // If it timed out or lost connection, loop immediately to restart the sensor
      await new Promise((resolve) => setTimeout(resolve, 50));
    } finally {
      await cancelNfcRead();
    }
  }
}

export function parseIndexNumberFromTag(tag: TagEvent | null): string | null {
  return tag?.id ?? null;
}

/** Release any pending NFC technology request. Safe to call unconditionally. */
export async function cancelNfcRead(): Promise<void> {
  try {
    await NfcManager.cancelTechnologyRequest();
  } catch {}
}

export async function isNfcSupported(): Promise<boolean> {
  try {
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
}

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
  NfcManager.goToNfcSetting().catch(() => {});
}

// HACK: ————————————————————— LOGICAL ERROR (NFC cards are blank) ——————————————————————————

// import { Platform } from 'react-native';
// import NfcManager, { Ndef, NfcTech, type TagEvent } from 'react-native-nfc-manager';
// import { logger } from '@/lib/logger';
//
// let started = false;
//
// /** Initialize the NFC stack. Returns false if the device has no NFC. */
// export async function initNfc(): Promise<boolean> {
//   try {
//     const supported = await NfcManager.isSupported();
//     if (!supported) return false;
//     if (!started) {
//       await NfcManager.start();
//       started = true;
//     }
//     return true;
//   } catch (error) {
//     logger.warn('NFC init failed', { error: String(error) });
//     return false;
//   }
// }
//
// /**
//  * Read a single NFC tag (read-only use case). The caller drives any UI prompt.
//  * Always releases the technology request afterwards.
//  */
// export async function readTag(): Promise<TagEvent | null> {
//   try {
//     await NfcManager.requestTechnology(NfcTech.Ndef);
//     const tag = await NfcManager.getTag();
//     console.log("tag data:", tag)
//     return tag ?? null;
//   } catch (error) {
//     logger.warn('NFC read cancelled or failed', { error: String(error) });
//     return null;
//   } finally {
//     await cancelNfcRead();
//   }
// }
//
// // 8 digits not embedded in a longer digit run; letters may sit adjacent
// // (raw NDEF text payloads keep the "en" language prefix glued to the number).
// const INDEX_NUMBER_RE = /(?:\D|^)(\d{8})(?:\D|$)/;
//
// /** Extract an 8-digit index number from the first NDEF record of a tag, or null. */
// export function parseIndexNumberFromTag(tag: TagEvent | null): string | null {
//   const payload = tag?.ndefMessage?.[0]?.payload;
//   if (!payload?.length) return null;
//   const bytes = payload as number[];
//   const candidates = [
//     () => Ndef.text.decodePayload(Uint8Array.from(bytes)),
//     () => Ndef.uri.decodePayload(Uint8Array.from(bytes)),
//     () => String.fromCharCode(...bytes), // bare payload fallback
//   ];
//   for (const decode of candidates) {
//     try {
//       const match = INDEX_NUMBER_RE.exec(decode() ?? '');
//       if (match) return match[1];
//     } catch {
//       // try the next decoder
//     }
//   }
//   return null;
// }
//
// /** Release any pending NFC technology request. Safe to call unconditionally. */
// export async function cancelNfcRead(): Promise<void> {
//   try {
//     await NfcManager.cancelTechnologyRequest();
//   } catch {
//     // no pending request — nothing to release
//   }
// }
//
// export async function isNfcSupported(): Promise<boolean> {
//   try {
//     return await NfcManager.isSupported();
//   } catch {
//     return false;
//   }
// }
//
// /** Whether NFC is switched on (Android; iOS has no toggle, so treat as enabled). */
// export async function isNfcEnabled(): Promise<boolean> {
//   if (Platform.OS !== 'android') return true;
//   try {
//     return await NfcManager.isEnabled();
//   } catch {
//     return false;
//   }
// }
//
// /** Open the system NFC settings screen (Android only). */
// export function goToNfcSettings(): void {
//   if (Platform.OS !== 'android') return;
//   NfcManager.goToNfcSetting().catch((error: unknown) => {
//     logger.warn('Failed to open NFC settings', { error: String(error) });
//   });
// }
