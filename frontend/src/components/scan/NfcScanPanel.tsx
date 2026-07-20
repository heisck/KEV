import { StyleSheet, Text, View } from 'react-native';

import { NfcScanVisual } from '@/components/nfc/NfcScanVisual';
import { AppButton } from '@/components/ui';
import { useNfcScan, type NfcErrorKind, type NfcScanStatus } from '@/hooks/useNfcScan';
import { spacing, usePalette } from '@/theme';

const STATUS_COPY: Record<NfcScanStatus, string> = {
  idle: 'Hold a student card near the phone, then start the scan.',
  requesting: 'Preparing the NFC reader…',
  scanning: 'Waiting for a card. Hold it against the back of the phone.',
  reading: 'Card detected — reading…',
  success: 'Card read. Opening student…',
  error: 'Scan failed.',
};

const ERROR_COPY: Record<NfcErrorKind, string> = {
  unsupported: 'This device does not support NFC.',
  disabled: 'NFC is turned off. Enable it in system settings and try again.',
  timeout: 'No card detected in time. Try again.',
  cancelled: 'Scan cancelled.',
  parse_failed: 'Card read, but no index number was found on it.',
  read_failed: 'Could not read the card. Hold it steady and try again.',
};

type NfcScanPanelProps = { onIndexNumber: (indexNumber: string) => void };

/** NFC mode: reuses the animated scan visual with a start/cancel button and status copy. */
export function NfcScanPanel({ onIndexNumber }: NfcScanPanelProps) {
  const p = usePalette();
  const { status, error, start, cancel } = useNfcScan({ onIndexNumber });
  const isBusy = status === 'requesting' || status === 'scanning' || status === 'reading';

  return (
    <View style={styles.panel}>
      <NfcScanVisual />
      <Text style={[styles.status, { color: p.inkSoft }]} testID="nfc-status">
        {status === 'error' && error ? ERROR_COPY[error] : STATUS_COPY[status]}
      </Text>
      <AppButton
        label={isBusy ? 'Cancel scan' : 'Start NFC scan'}
        variant={isBusy ? 'ghost' : 'ink'}
        onPress={isBusy ? cancel : start}
        testID="nfc-toggle"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { alignItems: 'stretch', gap: spacing.lg },
  status: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
