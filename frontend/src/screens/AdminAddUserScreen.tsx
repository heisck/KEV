import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/kev/chrome';
import { CloseIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui';
import { CreateAdminSheet } from '@/screens/CreateAdminSheet';
import { CreateLecturerSheet } from '@/screens/CreateLecturerSheet';
import { radii, spacing, usePalette } from '@/theme';

type UserRoleTab = 'lecturer' | 'admin';

export function AdminAddUserScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<UserRoleTab>('lecturer');

  const switchTab = (tab: UserRoleTab) => {
    Keyboard.dismiss();
    setActiveTab(tab);
  };

  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
        <View style={styles.header}>
          <CircleButton label="Close form" onPress={() => router.back()}>
            <CloseIcon color={p.ink} size={20} />
          </CircleButton>
          <Text style={[styles.headerTitle, { color: p.ink }]}>Onboard User</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={[styles.segmentBar, { backgroundColor: p.surfaceDim }]}>
          <RoleTab
            active={activeTab === 'lecturer'}
            label="Lecturer"
            onPress={() => switchTab('lecturer')}
          />
          <RoleTab
            active={activeTab === 'admin'}
            label="Administrator"
            onPress={() => switchTab('admin')}
          />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.body}
        >
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'lecturer' ? (
              <CreateLecturerSheet onClose={() => router.back()} />
            ) : (
              <CreateAdminSheet onClose={() => router.back()} />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

function RoleTab({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const p = usePalette();
  return (
    <HapticPressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      haptic="select"
      onPress={onPress}
      style={[styles.segmentTab, active && { backgroundColor: p.primary }]}
    >
      <Text style={[styles.segmentLabel, { color: active ? p.onPrimary : p.muted }]}>{label}</Text>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  form: { paddingBottom: 60, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  headerSpacer: { width: 48 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  screen: { flex: 1 },
  segmentBar: {
    borderRadius: radii.pill,
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    padding: 4,
  },
  segmentLabel: { fontSize: 14, fontWeight: '700' },
  segmentTab: { alignItems: 'center', borderRadius: radii.pill, flex: 1, paddingVertical: 10 },
});
