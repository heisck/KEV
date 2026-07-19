import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { colors, radii, shadows, spacing, typography } from '@/theme';

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
  return (
    <HapticPressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      haptic={onPress ? 'tap' : 'none'}
      onPress={onPress}
      style={[styles.card, tint === 'mint' ? styles.mint : styles.primaryTint]}
      testID={testID}
    >
      {illustration ? <View style={styles.illustration}>{illustration}</View> : null}
      <Text style={styles.headline}>
        {headline[0]}
        {'\n'}
        <Text style={styles.headlineAccent}>{headline[1]}</Text>
      </Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {onPress ? (
        <View style={styles.cta}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12h14m-6-6 6 6-6 6"
              stroke={colors.white}
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
  mint: { backgroundColor: colors.mint },
  primaryTint: { backgroundColor: colors.primary12 },
  illustration: { marginBottom: spacing.sm },
  headline: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  headlineAccent: { color: colors.primary },
  caption: { color: colors.inkSoft, fontSize: 14, textAlign: 'center' },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderColor: colors.primary20,
    borderRadius: radii.pill,
    borderWidth: 6,
    height: 58,
    justifyContent: 'center',
    marginTop: spacing.sm,
    width: 58,
  },
});
