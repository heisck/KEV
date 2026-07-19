import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticKind = 'tap' | 'select' | 'success' | 'warning' | 'error' | 'none';

/**
 * Single choke point for button / control haptics.
 * iOS: UIKit feedback (Light impact ≈ liquid-glass control press).
 * Android: mapped equivalents. Web: no-op.
 */
export function haptic(kind: HapticKind = 'tap'): void {
  if (kind === 'none' || Platform.OS === 'web') return;

  switch (kind) {
    case 'select':
      void Haptics.selectionAsync();
      return;
    case 'success':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    case 'warning':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    case 'error':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    case 'tap':
    default:
      // Light impact is the closest match to interactive control depression.
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
