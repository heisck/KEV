import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { MinusIcon, PlusIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, shadows, spacing, usePalette } from '@/theme';
import type { Palette } from '@/theme';

/** Circular counter with minus (left) and plus (right) steppers. */
export function FloorStepper({
  value,
  onChange,
  label = 'Floor',
  min = -10,
  max = 30,
}: {
  value: number;
  onChange: (next: number) => void;
  label?: string;
  min?: number;
  max?: number;
}) {
  const p = usePalette();
  const s = makeStyles(p);
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  // Negative floors read as basements (-1 → Basement 1); 0 is Ground.
  const bigLabel = value < 0 ? String(-value) : value === 0 ? 'G' : String(value);
  const caption = value < 0 ? 'Basement' : value === 0 ? 'Ground' : 'Floor';
  return (
    <View style={s.block}>
      <Text style={s.blockLabel}>{label}</Text>
      <View style={s.stepperRow}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Decrease floor"
          haptic="select"
          onPress={dec}
          disabled={value <= min}
          style={[s.stepBtn, value <= min && s.stepBtnDisabled]}
          testID="floor-minus"
        >
          <MinusIcon color={p.ink} />
        </HapticPressable>

        <View style={s.counterCircle}>
          <Text style={s.counterValue}>{bigLabel}</Text>
          <Text style={s.counterCaption}>{caption}</Text>
        </View>

        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Increase floor"
          haptic="select"
          onPress={inc}
          disabled={value >= max}
          style={[s.stepBtn, value >= max && s.stepBtnDisabled]}
          testID="floor-plus"
        >
          <PlusIcon color={p.ink} />
        </HapticPressable>
      </View>
    </View>
  );
}

const THUMB = 28;
const TEETH = 24;

/** Horizontal slider with tick "teeth"; drag or tap to pick a room number. */
export function RoomSlider({
  value,
  onChange,
  label = 'Room number',
  min = 1,
  max = 50,
}: {
  value: number;
  onChange: (next: number) => void;
  label?: string;
  min?: number;
  max?: number;
}) {
  const p = usePalette();
  const s = makeStyles(p);
  const [trackWidth, setTrackWidth] = useState(0);

  const span = Math.max(1, max - min);
  const ratio = trackWidth > 0 ? (value - min) / span : 0;
  const maxTravel = Math.max(0, trackWidth - THUMB);
  const restX = ratio * maxTravel;
  // Thumb position in px. Driven by the gesture; synced to the controlled value
  // after render via useEffect (never written during render, which Reanimated forbids).
  const pos = useSharedValue(0);
  const startPos = useSharedValue(0);

  useEffect(() => {
    pos.value = restX;
  }, [pos, restX]);

  const commit = (px: number) => {
    if (maxTravel <= 0) return;
    const next = min + Math.round((Math.min(Math.max(0, px), maxTravel) / maxTravel) * span);
    if (next !== value) onChange(next);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startPos.value = pos.value;
    })
    .onUpdate((e) => {
      const x = Math.min(Math.max(0, startPos.value + e.translationX), maxTravel);
      pos.value = x;
      runOnJS(commit)(x);
    });

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value }] }));

  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View style={s.block}>
      <View style={s.sliderHeader}>
        <Text style={s.blockLabel}>{label}</Text>
        <View style={s.roomBadge}>
          <Text style={s.roomBadgeText}>{value}</Text>
        </View>
      </View>

      <GestureDetector gesture={pan}>
        <View style={s.track} onLayout={onTrackLayout}>
          <View style={s.teeth} pointerEvents="none">
            {Array.from({ length: TEETH }).map((_, i) => (
              <View key={i} style={[s.tooth, i % 6 === 0 && s.toothMajor]} />
            ))}
          </View>
          <View style={[s.fill, { width: `${ratio * 100}%` }]} pointerEvents="none" />
          <Animated.View style={[s.thumb, thumbStyle]} />
        </View>
      </GestureDetector>

      <View style={s.sliderScale}>
        <Text style={s.scaleText}>{min}</Text>
        <Text style={s.scaleText}>{max}</Text>
      </View>
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    block: { gap: spacing.sm },
    blockLabel: { color: p.inkSoft, fontSize: 13, fontWeight: '700' },
    // Floor stepper
    stepperRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    stepBtn: {
      alignItems: 'center',
      backgroundColor: p.surfaceDim,
      borderColor: p.hairline,
      borderRadius: radii.pill,
      borderWidth: 1,
      height: 52,
      justifyContent: 'center',
      width: 52,
    },
    stepBtnDisabled: { opacity: 0.35 },
    counterCircle: {
      alignItems: 'center',
      backgroundColor: p.primary12,
      borderColor: p.primary,
      borderRadius: 48,
      borderWidth: 2,
      height: 96,
      justifyContent: 'center',
      width: 96,
      ...shadows.card,
    },
    counterValue: { color: p.primary, fontSize: 34, fontWeight: '800', lineHeight: 38 },
    counterCaption: { color: p.muted, fontSize: 11, fontWeight: '600' },
    // Room slider
    sliderHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    roomBadge: {
      backgroundColor: p.primary,
      borderRadius: radii.pill,
      minWidth: 40,
      paddingHorizontal: spacing.md,
      paddingVertical: 3,
    },
    roomBadgeText: { color: p.onPrimary, fontSize: 15, fontWeight: '800', textAlign: 'center' },
    track: {
      backgroundColor: p.surfaceDim,
      borderRadius: radii.md,
      height: 56,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    teeth: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: THUMB / 2,
    },
    tooth: { backgroundColor: p.hairline, borderRadius: 1, height: 12, width: 2 },
    toothMajor: { backgroundColor: p.muted, height: 20 },
    fill: {
      backgroundColor: p.primary12,
      borderRadius: radii.md,
      bottom: 0,
      left: 0,
      position: 'absolute',
      top: 0,
    },
    thumb: {
      backgroundColor: p.primary,
      borderColor: p.onPrimary,
      borderRadius: THUMB / 2,
      borderWidth: 3,
      height: THUMB,
      width: THUMB,
      ...shadows.card,
    },
    sliderScale: { flexDirection: 'row', justifyContent: 'space-between' },
    scaleText: { color: p.muted, fontSize: 11, fontWeight: '600' },
  });
