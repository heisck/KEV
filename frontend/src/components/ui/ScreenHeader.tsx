import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, radii, spacing } from '@/theme';

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
  return (
    <View style={styles.row} testID={testID}>
      <Pressable accessibilityRole="button" onPress={onPressAvatar} style={styles.identity}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={onPressBell}
        style={styles.bell}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3a6 6 0 0 0-6 6v3.2l-1.4 2.8a1 1 0 0 0 .9 1.5h13a1 1 0 0 0 .9-1.5L18 12.2V9a6 6 0 0 0-6-6Zm-2 15a2 2 0 0 0 4 0"
            stroke={colors.ink}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        {badgeCount > 0 ? <View style={styles.badge} /> : null}
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
    backgroundColor: colors.primary20,
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.primaryDeep, fontSize: 18, fontWeight: '700' },
  greeting: { color: colors.muted, fontSize: 13 },
  name: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  bell: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  badge: {
    backgroundColor: colors.error,
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 1.5,
    height: 10,
    position: 'absolute',
    right: 11,
    top: 10,
    width: 10,
  },
});
