import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminScreen } from '@/screens/AdminScreen';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/api/hooks', () => ({
  useAdminSessions: () => ({ data: [] }),
}));

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AdminScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  useAuthStore.setState({
    user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN', plan: 'PREMIUM' },
  });
});

it('does not expose the user directory from the legacy admin console', () => {
  const screen = renderScreen();

  expect(screen.queryByLabelText('Manage admin users')).toBeNull();
  expect(screen.queryByText('Lecturers')).toBeNull();
  expect(screen.queryByText('Administrators')).toBeNull();
});
