import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, radii, shadows, spacing } from '@/theme';

type CtaCardProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  testID?: string;
};

/** Black CTA card with white text and an arrow chip — the template's action card. */
export function CtaCard({ title, subtitle, onPress, icon, testID }: CtaCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card} testID={testID}>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.xl,
    ...shadows.card,
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
