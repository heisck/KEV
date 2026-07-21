import type { ReactNode } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NotificationsScreen } from '@/screens/kev/NotificationsScreen';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getPalette } from '@/theme/palette';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('@/api/notifications', () => ({
  deleteNotification: jest.fn(async () => undefined),
  markNotificationRead: jest.fn(async () => undefined),
}));
jest.mock('react-native-gesture-handler', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Swipeable: ({ children }: { children?: ReactNode }) =>
      React.createElement(View, null, children),
  };
});
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: ({ children }: { children?: ReactNode }) => React.createElement(View, null, children),
  };
});

const INITIAL_ITEMS = [
  {
    id: 'n1',
    title: 'New message',
    body: 'Hello',
    at: 'Now',
    day: 'today' as const,
    icon: 'reminder' as const,
    read: false,
  },
  {
    id: 'n2',
    title: 'Read message',
    body: 'Done',
    at: 'Yesterday',
    day: 'yesterday' as const,
    icon: 'complete' as const,
    read: true,
  },
];

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <NotificationsScreen />
    </SafeAreaProvider>,
  );
}

describe('NotificationsScreen', () => {
  beforeEach(() => {
    useSettingsStore.setState({ theme: 'dark' });
    useNotificationsStore.setState({
      items: INITIAL_ITEMS.map((item) => ({ ...item })),
      loaded: true,
    });
  });

  it('uses a readable active filter in dark mode', () => {
    const { getByTestId, getByText } = renderScreen();
    const palette = getPalette(true);

    expect(StyleSheet.flatten(getByTestId('notification-filter-today').props.style)).toEqual(
      expect.objectContaining({ backgroundColor: palette.primary, height: 32 }),
    );
    expect(StyleSheet.flatten(getByText('Today').props.style).color).toBe(palette.onPrimary);
  });

  it('keeps only one notification filter selected', () => {
    const { getByTestId, getByText, queryByText } = renderScreen();

    expect(getByTestId('notification-unread-n1')).toBeTruthy();
    fireEvent.press(getByTestId('notification-filter-yesterday'));
    expect(getByText('Read message')).toBeTruthy();
    fireEvent.press(getByTestId('notification-filter-unread'));
    expect(getByTestId('notification-filter-yesterday').props.accessibilityState.selected).toBe(
      false,
    );
    expect(getByTestId('notification-filter-unread').props.accessibilityState.selected).toBe(true);
    expect(queryByText('Read message')).toBeNull();
    expect(getByText('New message')).toBeTruthy();
  });

  it('marks every notification read from the header', () => {
    const { getByLabelText, queryByTestId } = renderScreen();

    fireEvent.press(getByLabelText('Mark all notifications as read'));

    expect(useNotificationsStore.getState().unreadCount()).toBe(0);
    expect(queryByTestId('notification-unread-n1')).toBeNull();
  });
});
