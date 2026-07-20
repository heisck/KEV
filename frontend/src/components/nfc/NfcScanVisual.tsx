import { useEffect, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { ContactlessIcon } from '@/components/nfc/NfcIcons';
import { makeStyles } from '@/screens/nfcVerificationStyles';
import { usePalette } from '@/theme';

const RIPPLE_DELAYS = [0, 620, 1240];

export function NfcScanVisual({ onScanComplete }: { onScanComplete?: () => void }) {
  const [ripples] = useState(() => RIPPLE_DELAYS.map(() => new Animated.Value(0)));
  const p = usePalette();
  const styles = makeStyles(p);

  useEffect(() => {
    const animations = ripples.map((ripple, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(RIPPLE_DELAYS[index]),
          Animated.timing(ripple, {
            duration: 1900,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(ripple, {
            duration: 0,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [ripples]);

  return (
    <Pressable
      accessibilityLabel="Simulate NFC scan"
      accessibilityRole="button"
      onPress={onScanComplete}
      style={styles.scanArea}
    >
      <View style={styles.scanContent}>
        <View style={styles.scanIconStage}>
          <View pointerEvents="none" style={styles.rippleLayer}>
            {ripples.map((ripple, index) => {
              const scale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.82, 2] });
              const opacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0] });

              return (
                <Animated.View
                  key={RIPPLE_DELAYS[index]}
                  style={[styles.ripple, { opacity, transform: [{ scale }] }]}
                />
              );
            })}
          </View>
          <View style={styles.scanIconShell}>
            <ContactlessIcon />
          </View>
        </View>
        <View style={styles.scanCopy}>
          <Text style={styles.scanTitle}>Ready to Tap</Text>
        </View>
      </View>
    </Pressable>
  );
}
