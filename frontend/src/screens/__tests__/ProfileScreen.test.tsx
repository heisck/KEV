import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProfileScreen } from '@/screens/ProfileScreen';
import { useAuthStore } from '@/store/authStore';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));
jest.mock('@/components/settings/ProfilePreferences', () => ({ ProfilePreferences: () => null }));

beforeEach(() => mockPush.mockReset());

it('uses the recovered profile and account-security labels', () => {
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
      <ProfileScreen />
    </SafeAreaProvider>,
  );

  expect(screen.getByText('Profile')).toBeTruthy();
  expect(screen.getByText('Edit Profile')).toBeTruthy();
  expect(screen.getByText('Account Security')).toBeTruthy();
  expect(screen.getByText('Change Password')).toBeTruthy();
  expect(screen.queryByText('KNUST Campus')).toBeNull();
  expect(screen.queryByText('Email in')).toBeNull();
  expect(screen.queryByText('Manage Lecturers & Admins')).toBeNull();
});

it('shows user management in Profile only for administrators', () => {
  useAuthStore.setState({
    user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN', plan: 'PREMIUM' },
  });
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ProfileScreen />
    </SafeAreaProvider>,
  );

  expect(screen.getByText('Administration')).toBeTruthy();
  fireEvent.press(screen.getByText('Manage Lecturers & Admins'));
  expect(mockPush).toHaveBeenCalledWith('/admin/users');
});
