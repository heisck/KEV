import * as Haptics from 'expo-haptics';

import { haptic } from '@/lib/haptics';
import { useSettingsStore } from '@/store/settingsStore';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Error: 'error', Success: 'success', Warning: 'warning' },
}));

beforeEach(() => {
  jest.clearAllMocks();
  useSettingsStore.setState({ hapticsEnabled: true });
});

it('suppresses every app haptic when the preference is off', () => {
  useSettingsStore.setState({ hapticsEnabled: false });

  haptic('tap');
  haptic('select');
  haptic('success');

  expect(Haptics.impactAsync).not.toHaveBeenCalled();
  expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  expect(Haptics.notificationAsync).not.toHaveBeenCalled();
});
