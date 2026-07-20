import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { durations, radii, spacing, springs, usePalette } from '@/theme';

type BottomDrawerProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testID?: string;
};

/** Springy bottom sheet with dim backdrop; the app's single drawer primitive. */
export function BottomDrawer({ visible, onClose, title, children, testID }: BottomDrawerProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const p = usePalette();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(height);
  const backdrop = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withSpring(0, springs.sheet);
      backdrop.value = withTiming(1, { duration: durations.base });
    } else {
      backdrop.value = withTiming(0, { duration: durations.fast });
      translateY.value = withTiming(height, { duration: durations.base }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [backdrop, height, translateY, visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent onRequestClose={onClose} testID={testID}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.root}
      >
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: p.isDark ? 'rgba(0, 0, 0, 0.62)' : 'rgba(14, 27, 30, 0.45)' },
            backdropStyle,
          ]}
        >
          <Pressable accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheetClip, sheetStyle]}>
          <GlassSurface
            fallbackColor={p.surface}
            intensity={70}
            testID={testID ? `${testID}-surface` : undefined}
          >
            <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
              <View style={[styles.grabber, { backgroundColor: p.hairline }]} />
              {title ? <Text style={[styles.title, { color: p.ink }]}>{title}</Text> : null}
              {children}
            </View>
          </GlassSurface>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetClip: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  sheet: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  grabber: {
    alignSelf: 'center',
    borderRadius: radii.pill,
    height: 5,
    width: 44,
  },
  title: { fontSize: 18, fontWeight: '700' },
});
