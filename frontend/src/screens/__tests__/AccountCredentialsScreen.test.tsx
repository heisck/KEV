import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountCredentialsScreen } from '@/screens/AccountCredentialsScreen';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

it('uses the password-change design without exposing email editing', () => {
  useAuthStore.setState({
    user: {
      id: 'lecturer-1',
      email: 'lecturer@example.com',
      role: 'LECTURER',
      plan: 'FREE',
    },
  });
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AccountCredentialsScreen />
    </SafeAreaProvider>,
  );

  expect(screen.getByText('Change Password')).toBeTruthy();
  expect(screen.queryByText('Sign-in email')).toBeNull();
  expect(screen.getByText('Current Password')).toBeTruthy();
  expect(screen.getByText('New Password')).toBeTruthy();
  expect(screen.getByText('Confirm New Password')).toBeTruthy();
  expect(screen.getByText('Save')).toBeTruthy();
  expect(
    StyleSheet.flatten(screen.getByPlaceholderText('Current Password').props.style).textAlign,
  ).not.toBe('center');
});
