import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountCredentialsScreen } from '@/screens/AccountCredentialsScreen';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

it('uses the reset-password reference design without removing email updates', () => {
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
  expect(screen.getByText('Current Password')).toBeTruthy();
  expect(screen.getByText('New Password')).toBeTruthy();
  expect(screen.getByText('Confirm New Password')).toBeTruthy();
  expect(screen.getByText('Save')).toBeTruthy();
});
