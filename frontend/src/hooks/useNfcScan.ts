import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { logger } from '@/lib/logger';

export type NfcScanStatus = 'idle' | 'requesting' | 'scanning' | 'reading' | 'success' | 'error';
export type NfcErrorKind =
  'unsupported' | 'disabled' | 'timeout' | 'cancelled' | 'parse_failed' | 'read_failed';

const SCAN_TIMEOUT_MS = 20_000;
const TIMEOUT_SENTINEL = Symbol('nfc-timeout');

/** Lazy so the native module is only touched when a scan actually starts (Expo Go safe). */
function loadNfcLib(): typeof import('@/lib/nfc') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@/lib/nfc') as typeof import('@/lib/nfc');
  } catch {
    return null;
  }
}

function loadNfcManager(): typeof import('react-native-nfc-manager') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-nfc-manager') as typeof import('react-native-nfc-manager');
  } catch {
    return null;
  }
}

/**
 * Drives a single NFC card scan: requesting → scanning → reading → success/error.
 * NFC modules are imported lazily so the hook is safe to render in Expo Go.
 */
export function useNfcScan(options: { onIndexNumber: (indexNumber: string) => void }): {
  status: NfcScanStatus;
  error: NfcErrorKind | null;
  start: () => void;
  cancel: () => void;
  reset: () => void;
} {
  const [status, setStatus] = useState<NfcScanStatus>('idle');
  const [error, setError] = useState<NfcErrorKind | null>(null);
  const onIndexNumberRef = useRef(options.onIndexNumber);
  onIndexNumberRef.current = options.onIndexNumber;
  const activeRef = useRef(false);
  const cancelledRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
      void loadNfcLib()?.cancelNfcRead();
    },
    [],
  );

  const update = useCallback((next: NfcScanStatus, kind: NfcErrorKind | null = null) => {
    if (!mountedRef.current) return;
    setStatus(next);
    setError(kind);
  }, []);

  const run = useCallback(async () => {
    const fail = (kind: NfcErrorKind) => update('error', kind);
    const nfc = loadNfcLib();
    const manager = loadNfcManager();
    if (!nfc || !manager) return fail('unsupported');
    try {
      if (!(await nfc.isNfcSupported())) return fail('unsupported');
      if (Platform.OS === 'android' && !(await nfc.isNfcEnabled())) return fail('disabled');
      if (!(await nfc.initNfc())) return fail('unsupported');

      const { default: NfcManager, NfcTech } = manager;
      update('scanning');
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<typeof TIMEOUT_SENTINEL>((resolve) => {
        timer = setTimeout(() => resolve(TIMEOUT_SENTINEL), SCAN_TIMEOUT_MS);
      });
      try {
        const raced = await Promise.race([
          NfcManager.requestTechnology(
            NfcTech.Ndef,
            Platform.OS === 'ios' ? { alertMessage: 'Hold the student card near the phone' } : {},
          ),
          timeout,
        ]);
        if (raced === TIMEOUT_SENTINEL) return fail('timeout');

        update('reading');
        const tag = await NfcManager.getTag();
        const indexNumber = nfc.parseIndexNumberFromTag(tag ?? null);
        if (!indexNumber) return fail('parse_failed');

        update('success');
        onIndexNumberRef.current(indexNumber);
      } catch (err) {
        if (cancelledRef.current) return fail('cancelled');
        logger.warn('NFC scan failed', { error: String(err) });
        fail('read_failed');
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      logger.warn('NFC scan setup failed', { error: String(err) });
      fail('read_failed');
    } finally {
      await nfc?.cancelNfcRead();
      activeRef.current = false;
    }
  }, [update]);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    cancelledRef.current = false;
    update('requesting');
    void run();
  }, [run, update]);

  const cancel = useCallback(() => {
    if (activeRef.current) {
      cancelledRef.current = true;
      // Rejects the pending requestTechnology → run() maps it to 'cancelled'.
      void loadNfcLib()?.cancelNfcRead();
    } else {
      update('idle');
    }
  }, [update]);

  const reset = useCallback(() => {
    cancelledRef.current = false;
    update('idle');
  }, [update]);

  return { status, error, start, cancel, reset };
}
