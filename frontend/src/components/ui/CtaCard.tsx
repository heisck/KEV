import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { colors, radii, shadows, spacing } from '@/theme';

type CtaCardProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  testID?: string;
};

/** Liquid-glass dark CTA card with arrow chip. */
export function CtaCard({ title, subtitle, onPress, icon, testID }: CtaCardProps) {
  return (
    <GlassPressable
      onPress={onPress}
      surfaceStyle={styles.card}
      tintColor={colors.black}
      testID={testID}
    >
      <View style={styles.row}>
        {icon}
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.arrow}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 17 17 7m0 0H9m8 0v8"
              stroke={colors.black}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
    </GlassPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.card,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  body: { flex: 1, gap: 2 },
  title: { color: colors.white, fontSize: 16, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  arrow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
