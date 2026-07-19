import { type ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { haptic, type HapticKind } from '@/lib/haptics';

type Props = ComponentProps<typeof Pressable> & {
  /** Feedback fired on press-in (Apple control feel). Default: tap. */
  haptic?: HapticKind;
};

/**
 * Drop-in Pressable that always fires haptics on touch-down.
 * Prefer this (or GlassPressable) over raw RN Pressable for any control.
 */
export function HapticPressable({
  haptic: kind = 'tap',
  disabled,
  onPressIn,
  onPress,
  ...rest
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) haptic(kind);
        onPressIn?.(e);
      }}
      onPress={onPress}
      {...rest}
    />
  );
}
