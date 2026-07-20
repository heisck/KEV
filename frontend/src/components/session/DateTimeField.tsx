import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';
import type { Palette } from '@/theme';

type Mode = 'date' | 'time';

/** Format helpers keep the wizard's string contract (YYYY-MM-DD / HH:mm). */
function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function toTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function parseValue(mode: Mode, value: string): Date {
  const now = new Date();
  if (!value) return now;
  if (mode === 'date') {
    const [y, m, d] = value.split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : now;
  }
  const [h, min] = value.split(':').map(Number);
  if (Number.isFinite(h)) now.setHours(h, min || 0, 0, 0);
  return now;
}

/**
 * Tappable field that opens the native calendar (date) or clock (time) picker
 * in a themed bottom sheet so it's always visible. Stores YYYY-MM-DD / HH:mm.
 */
export function DateTimeField({
  label,
  mode,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  mode: Mode;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  const p = usePalette();
  const s = makeStyles(p);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => parseValue(mode, value));

  const openPicker = () => {
    setDraft(parseValue(mode, value));
    setOpen(true);
  };

  const commit = (d: Date) => onChange(mode === 'date' ? toDateString(d) : toTimeString(d));

  // Android shows its own dialog; commit immediately on selection.
  const handleAndroidChange = (event: DateTimePickerEvent, picked?: Date) => {
    setOpen(false);
    if (event.type === 'dismissed' || !picked) return;
    commit(picked);
  };

  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <HapticPressable
        accessibilityRole="button"
        accessibilityLabel={`Pick ${label}`}
        haptic="select"
        onPress={openPicker}
        style={s.control}
        testID={`picker-${mode}-${label}`}
      >
        <Text style={[s.controlText, !value && s.controlPlaceholder]}>{value || placeholder}</Text>
      </HapticPressable>

      {/* Android: bare dialog. iOS: spinner inside a themed sheet with Done. */}
      {open && Platform.OS !== 'ios' ? (
        <DateTimePicker
          value={draft}
          mode={mode}
          is24Hour
          display="default"
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <BottomDrawer
          visible={open}
          onClose={() => setOpen(false)}
          title={label}
          testID={`picker-drawer-${label}`}
        >
          <DateTimePicker
            value={draft}
            mode={mode}
            is24Hour
            display="spinner"
            themeVariant={p.isDark ? 'dark' : 'light'}
            textColor={p.ink}
            style={s.iosPicker}
            onChange={(_e, picked) => picked && setDraft(picked)}
          />
          <HapticPressable
            accessibilityRole="button"
            haptic="select"
            onPress={() => {
              commit(draft);
              setOpen(false);
            }}
            style={s.done}
            testID={`picker-done-${label}`}
          >
            <Text style={s.doneText}>Done</Text>
          </HapticPressable>
        </BottomDrawer>
      ) : null}
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    field: { gap: spacing.xs },
    fieldLabel: { color: p.inkSoft, fontSize: 13, fontWeight: '700' },
    control: {
      backgroundColor: p.surfaceDim,
      borderColor: p.hairline,
      borderRadius: radii.md,
      borderWidth: 1,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
    },
    controlText: { color: p.ink, fontSize: 16, fontWeight: '600' },
    controlPlaceholder: { color: p.muted, fontWeight: '400' },
    iosPicker: { alignSelf: 'stretch' },
    done: {
      alignItems: 'center',
      backgroundColor: p.primary,
      borderRadius: radii.pill,
      paddingVertical: spacing.lg - 2,
    },
    doneText: { color: p.onPrimary, fontSize: 15, fontWeight: '700' },
  });
