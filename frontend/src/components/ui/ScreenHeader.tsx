import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { radii, spacing, usePalette } from '@/theme';

type ScreenHeaderProps = {
  greeting: string;
  name: string;
  avatarUrl?: string;
  badgeCount?: number;
  onPressAvatar?: () => void;
  onPressBell?: () => void;
  testID?: string;
};

/** Roam-style header: avatar + greeting on the left, bell with badge on the right. */
export function ScreenHeader({
  greeting,
  name,
  avatarUrl,
  badgeCount = 0,
  onPressAvatar,
  onPressBell,
  testID,
}: ScreenHeaderProps) {
  const p = usePalette();
  return (
    <View style={styles.row} testID={testID}>
      <Pressable accessibilityRole="button" onPress={onPressAvatar} style={styles.identity}>
        <InitialAvatar
          uri={avatarUrl}
          seed={name}
          imageStyle={styles.avatar}
          fallbackStyle={[styles.avatar, styles.avatarFallback, { backgroundColor: p.primary20 }]}
          initialStyle={[styles.avatarInitial, { color: p.primaryDeep }]}
        />
        <View>
          <Text style={[styles.greeting, { color: p.muted }]}>{greeting}</Text>
          <Text style={[styles.name, { color: p.ink }]}>{name}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={onPressBell}
        style={[styles.bell, { backgroundColor: p.surface }]}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3a6 6 0 0 0-6 6v3.2l-1.4 2.8a1 1 0 0 0 .9 1.5h13a1 1 0 0 0 .9-1.5L18 12.2V9a6 6 0 0 0-6-6Zm-2 15a2 2 0 0 0 4 0"
            stroke={p.ink}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        {badgeCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: p.error, borderColor: p.surface }]} />
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  identity: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  avatar: { borderRadius: radii.pill, height: 46, width: 46 },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 18, fontWeight: '700' },
  greeting: { fontSize: 13 },
  name: { fontSize: 17, fontWeight: '700' },
  bell: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  badge: {
    borderRadius: 5,
    borderWidth: 1.5,
    height: 10,
    position: 'absolute',
    right: 11,
    top: 10,
    width: 10,
  },
});
