import { render } from '@testing-library/react-native';

import AdminUsersRoute from '@/app/admin/users';
import { useAuthStore } from '@/store/authStore';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text>Redirect:{href}</Text>;
  },
}));
jest.mock('@/screens/AdminUserDirectoryScreen', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { AdminUserDirectoryScreen: () => <Text>User directory</Text> };
});

it('redirects non-admin users away from the admin directory', () => {
  useAuthStore.setState({
    user: { id: 'lecturer-1', email: 'lecturer@example.com', role: 'LECTURER', plan: 'FREE' },
  });

  expect(render(<AdminUsersRoute />).getByText('Redirect:/(tabs)')).toBeTruthy();
});

it('renders the directory for administrators', () => {
  useAuthStore.setState({
    user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN', plan: 'PREMIUM' },
  });

  expect(render(<AdminUsersRoute />).getByText('User directory')).toBeTruthy();
});

