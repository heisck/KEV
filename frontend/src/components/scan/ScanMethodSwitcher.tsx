import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FaceIdIcon, KeypadIcon, NfcIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

export type ScanMethod = 'FACE' | 'NFC' | 'MANUAL';

const ROUTES = {
  FACE: '/verify/face',
  NFC: '/verify/nfc',
  MANUAL: '/verify/manual',
} as const;

const LABELS = { FACE: 'Face', NFC: 'NFC', MANUAL: 'Manual' } as const;

/** Compact method tabs shared by each scanner so switching retains its session. */
export function ScanMethodSwitcher({
  active,
  sessionId,
  allowedMethods,
  onSelectMethod,
}: {
  active: ScanMethod;
  sessionId: string;
  allowedMethods?: readonly ScanMethod[];
  onSelectMethod?: (method: ScanMethod) => void;
}) {
  const p = usePalette();
  const router = useRouter();
  const icons = {
    FACE: <FaceIdIcon color={active === 'FACE' ? p.onPrimary : p.pink} size={19} />,
    NFC: <NfcIcon color={active === 'NFC' ? p.onPrimary : p.blue} size={19} />,
    MANUAL: <KeypadIcon color={active === 'MANUAL' ? p.onPrimary : p.inkSoft} size={19} />,
  };

  const handleSelect = (method: ScanMethod) => {
    if (onSelectMethod) {
      onSelectMethod(method);
    } else {
      router.replace({ pathname: ROUTES[method], params: { exam: sessionId } });
    }
  };

  return (
    <View style={[styles.row, { backgroundColor: p.surfaceDim }]}>
      {(Object.keys(ROUTES) as ScanMethod[])
        .filter((method) => !allowedMethods || allowedMethods.includes(method))
        .map((method) => {
          const selected = method === active;
          return (
            <HapticPressable
              key={method}
              accessibilityLabel={`Switch to ${LABELS[method]} verification`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={selected}
              haptic="select"
              onPress={() => handleSelect(method)}
              style={[styles.method, selected && { backgroundColor: p.primary }]}
            >
              {icons[method]}
              <Text style={[styles.label, { color: selected ? p.onPrimary : p.inkSoft }]}>
                {LABELS[method]}
              </Text>
            </HapticPressable>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: radii.pill, flexDirection: 'row', gap: spacing.xs, padding: spacing.xs },
  method: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
  },
  label: { fontSize: 11, fontWeight: '700' },
});
