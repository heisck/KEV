import { render } from '@testing-library/react-native';

import HomeTab from '@/app/(tabs)/index';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/components/navigation/TabSwipeNavigator', () => ({
  TabSwipeNavigator: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/screens/kev/HomeScreen', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { HomeScreen: () => <Text>Lecturer dashboard</Text> };
});

it('keeps the current home dashboard for administrators', () => {
  useAuthStore.setState({
    user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN', plan: 'PREMIUM' },
  });

  expect(render(<HomeTab />).getByText('Lecturer dashboard')).toBeTruthy();
});

it('keeps the lecturer dashboard for lecturers', () => {
  useAuthStore.setState({
    user: { id: 'lecturer-1', email: 'lecturer@example.com', role: 'LECTURER', plan: 'FREE' },
  });

  expect(render(<HomeTab />).getByText('Lecturer dashboard')).toBeTruthy();
});
