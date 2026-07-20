// Jest setup. React Native Testing Library v12.4+ registers its matchers
// automatically (jest-native is deprecated), so no extend-expect import is needed.

// Mock native modules so unit tests never touch the native runtime.
jest.mock('@/components/SystemStatusBar', () => ({
  SystemStatusBar: () => null,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: {
    start: jest.fn(async () => undefined),
    isSupported: jest.fn(async () => true),
    isEnabled: jest.fn(async () => true),
    goToNfcSetting: jest.fn(async () => undefined),
    requestTechnology: jest.fn(async () => undefined),
    getTag: jest.fn(async () => ({ id: 'mock-tag' })),
    cancelTechnologyRequest: jest.fn(async () => undefined),
  },
  NfcTech: { Ndef: 'Ndef' },
  Ndef: {},
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({ data: { idToken: 'mock-id-token' } })),
    signOut: jest.fn(async () => undefined),
  },
  statusCodes: {},
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: (component: unknown) => component,
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  notificationAsync: jest.fn(async () => undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-glass-effect', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GlassView: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(View, props, children),
    GlassContainer: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(View, props, children),
    isGlassEffectAPIAvailable: () => false,
    isLiquidGlassAvailable: () => false,
  };
});
