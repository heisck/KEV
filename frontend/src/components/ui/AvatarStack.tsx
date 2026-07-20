import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, usePalette } from '@/theme';

type AvatarStackProps = {
  urls: (string | undefined)[];
  max?: number;
  size?: number;
  testID?: string;
};

/** Overlapping avatar group with a "+N" overflow badge. */
export function AvatarStack({ urls, max = 4, size = 28, testID }: AvatarStackProps) {
  const p = usePalette();
  const shown = urls.slice(0, max);
  const overflow = urls.length - shown.length;
  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={styles.row} testID={testID}>
      {shown.map((url, index) => (
        <View
          key={index}
          style={[
            styles.ring,
            { borderColor: p.surface },
            circle,
            index > 0 && { marginLeft: -size / 3 },
          ]}
        >
          {url ? (
            <Image source={{ uri: url }} style={circle} contentFit="cover" />
          ) : (
            <View style={[circle, styles.fallback, { backgroundColor: p.primary20 }]} />
          )}
        </View>
      ))}
      {overflow > 0 ? (
        <View style={[styles.ring, styles.overflow, circle, { marginLeft: -size / 3 }]}>
          <Text style={[styles.overflowText, { color: p.onPrimary }]}>+{overflow}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row' },
  ring: {
    borderRadius: radii.pill,
    borderWidth: 2,
    overflow: 'hidden',
  },
  fallback: {},
  overflow: {
    alignItems: 'center',
    backgroundColor: colors.black,
    justifyContent: 'center',
  },
  overflowText: { fontSize: 10, fontWeight: '700' },
});
