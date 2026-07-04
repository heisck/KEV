import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DoodleBrain } from '@/components/doodles/DoodleBrain';
import { AppButton, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

const FEATURES = [
  'Unlimited invigilators per session',
  'Unlimited concurrent sessions',
  'Face verification at scale',
  'Priority support',
];

/** Premium upsell modal — no payments yet, so upgrading flips to a contact-sales state. */
export default function UpgradeModal() {
  const { upgradeHint } = useLocalSearchParams<{ upgradeHint?: string }>();
  const [contacted, setContacted] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Card variant="mint" style={styles.card}>
        <DoodleBrain size={110} />
        <Text style={styles.headline}>
          Go beyond{'\n'}
          <Text style={styles.headlineAccent}>five.</Text>
        </Text>
        <Text style={styles.copy}>
          {upgradeHint ??
            'The free plan caps invigilators and sessions. Premium removes the limits.'}
        </Text>
        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        {contacted ? (
          <Text style={styles.contacted}>
            Thanks — our team will reach out to set up Premium for your institution.
          </Text>
        ) : (
          <AppButton
            label="Upgrade to Premium"
            variant="ink"
            onPress={() => setContacted(true)}
            testID="upgrade-cta"
          />
        )}
        <AppButton label="Not now" variant="ghost" onPress={() => router.back()} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.surfaceDim, flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  card: { alignItems: 'center', gap: spacing.lg },
  headline: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
  },
  headlineAccent: { color: colors.primary },
  copy: { color: colors.inkSoft, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  features: { alignSelf: 'stretch', gap: spacing.sm },
  featureRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  bullet: { backgroundColor: colors.primary, borderRadius: 4, height: 8, width: 8 },
  featureText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  contacted: { color: colors.success, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
