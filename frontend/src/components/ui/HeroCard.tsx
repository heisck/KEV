import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { colors, radii, shadows, spacing, typography, usePalette } from '@/theme';

type HeroCardProps = {
  /** Two-line oversized serif headline, e.g. ["Every Student.", "Verified."] */
  headline: [string, string];
  caption?: string;
  onPress?: () => void;
  /** Doodle illustration rendered above the headline. */
  illustration?: React.ReactNode;
  tint?: 'mint' | 'primary';
  testID?: string;
};

/** Big Roam-style hero card: doodle + display headline + circular arrow CTA. */
export function HeroCard({
  headline,
  caption,
  onPress,
  illustration,
  tint = 'mint',
  testID,
}: HeroCardProps) {
  const p = usePalette();
  return (
    <HapticPressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      haptic={onPress ? 'tap' : 'none'}
      onPress={onPress}
      style={[styles.card, { backgroundColor: tint === 'mint' ? p.mint : p.primary12 }]}
      testID={testID}
    >
      {illustration ? <View style={styles.illustration}>{illustration}</View> : null}
      <Text style={[styles.headline, { color: p.ink }]}>
        {headline[0]}
        {'\n'}
        <Text style={{ color: p.primary }}>{headline[1]}</Text>
      </Text>
      {caption ? <Text style={[styles.caption, { color: p.inkSoft }]}>{caption}</Text> : null}
      {onPress ? (
        <View style={[styles.cta, { borderColor: p.primary20 }]}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke={p.onPrimary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      ) : null}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: radii.xl,
    gap: spacing.md,
    padding: spacing.xxl,
    ...shadows.card,
  },
  illustration: { marginBottom: spacing.sm },
  headline: {
    fontFamily: typography.display,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  caption: { fontSize: 14, textAlign: 'center' },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: radii.pill,
    borderWidth: 6,
    height: 58,
    justifyContent: 'center',
    marginTop: spacing.sm,
    width: 58,
  },
});
