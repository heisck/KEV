import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DoodleBrain } from '@/components/doodles/DoodleBrain';
import { AppButton, Card } from '@/components/ui';
import { spacing, typography, usePalette } from '@/theme';

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
  const p = usePalette();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: p.surfaceDim }]}
    >
      <Card variant="mint" style={styles.card}>
        <DoodleBrain size={110} />
        <Text style={[styles.headline, { color: p.ink }]}>
          Go beyond{'\n'}
          <Text style={[styles.headlineAccent, { color: p.primary }]}>five.</Text>
        </Text>
        <Text style={[styles.copy, { color: p.inkSoft }]}>
          {upgradeHint ??
            'The free plan caps invigilators and sessions. Premium removes the limits.'}
        </Text>
        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={[styles.bullet, { backgroundColor: p.primary }]} />
              <Text style={[styles.featureText, { color: p.ink }]}>{feature}</Text>
            </View>
          ))}
        </View>
        {contacted ? (
          <Text style={[styles.contacted, { color: p.success }]}>
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
  screen: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  card: { alignItems: 'center', gap: spacing.lg },
  headline: {
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
  },
  headlineAccent: {},
  copy: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  features: { alignSelf: 'stretch', gap: spacing.sm },
  featureRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  bullet: { borderRadius: 4, height: 8, width: 8 },
  featureText: { fontSize: 14, fontWeight: '600' },
  contacted: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
