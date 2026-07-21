import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { InvigilatorDto } from '@/api/schemas';
import { CircleButton } from '@/components/kev/chrome';
import { EllipsisIcon } from '@/components/kev/icons';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

export type SessionActionsMenuProps = {
  code?: string;
  password?: string;
  lecturers: InvigilatorDto[];
  joined: boolean;
  onJoin: () => void;
};

/** Compact context overlay anchored below the top-right session action. */
export function SessionActionsMenu({
  code,
  password,
  lecturers,
  joined,
  onJoin,
}: SessionActionsMenuProps) {
  const p = usePalette();
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  const join = () => {
    close();
    onJoin();
  };

  return (
    <View testID="session-actions-menu">
      <CircleButton label="Session actions" onPress={() => setVisible(true)}>
        <EllipsisIcon color={p.ink} />
      </CircleButton>
      <Modal transparent visible={visible} onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <GlassSurface
            fallbackColor={p.surface}
            glassEffectStyle="regular"
            intensity={75}
            style={[styles.menu, { borderColor: p.hairline }]}
            tintColor={p.surface}
          >
            {joined ? (
              <>
                <Text style={[styles.title, { color: p.ink }]}>Session details</Text>
                <Text selectable style={[styles.item, { color: p.inkSoft }]}>
                  Session code: {code ?? 'Loading'}
                </Text>
                <Text selectable style={[styles.item, { color: p.inkSoft }]}>
                  Password: {password ?? 'Loading'}
                </Text>
                <View style={[styles.divider, { backgroundColor: p.hairline }]} />
                <Text style={[styles.title, { color: p.ink }]}>Lecturers</Text>
                <Text style={[styles.item, { color: p.success }]}>Added to this session</Text>
                {lecturers.map((lecturer) => (
                  <Text key={lecturer.userId} style={[styles.item, { color: p.inkSoft }]}>
                    {lecturer.displayName ?? lecturer.email ?? 'Lecturer'}
                  </Text>
                ))}
              </>
            ) : (
              <HapticPressable accessibilityRole="button" onPress={join} style={styles.join}>
                <Text style={[styles.title, { color: p.primary }]}>Join session</Text>
              </HapticPressable>
            )}
          </GlassSurface>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { alignItems: 'flex-end', flex: 1, paddingRight: spacing.xl, paddingTop: 96 },
  menu: {
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    minWidth: 240,
    padding: spacing.lg,
  },
  title: { fontSize: 14, fontWeight: '700' },
  item: { fontSize: 13, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth },
  join: { paddingVertical: spacing.sm },
});
