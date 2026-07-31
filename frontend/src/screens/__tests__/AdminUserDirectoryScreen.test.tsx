import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminUserDirectoryScreen } from '@/screens/AdminUserDirectoryScreen';
import { useAuthStore } from '@/store/authStore';

const mockRemoveAdmin = jest.fn();
const mockRemoveLecturer = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@/api/hooks', () => ({
  useAdminAdmins: () => ({
    data: [
      {
        id: 'admin-1',
        displayName: 'Ama Admin',
        email: 'ama@example.com',
        pictureUrl: null,
        role: 'ADMIN',
      },
    ],
    isLoading: false,
  }),
  useAdminLecturers: () => ({
    data: [
      {
        id: 'lecturer-1',
        displayName: 'Kojo Lecturer',
        email: 'kojo@example.com',
        pictureUrl: null,
        role: 'LECTURER',
      },
    ],
    isLoading: false,
  }),
  useRemoveAdmin: () => ({ isPending: false, mutate: mockRemoveAdmin }),
  useRemoveLecturer: () => ({ isPending: false, mutate: mockRemoveLecturer }),
}));

beforeEach(() => {
  mockRemoveAdmin.mockReset();
  mockRemoveLecturer.mockReset();
  useAuthStore.setState({
    user: { id: 'current-admin', email: 'current@example.com', role: 'ADMIN', plan: 'PREMIUM' },
  });
});

it('shows lecturers and administrators as separate sections', () => {
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AdminUserDirectoryScreen />
    </SafeAreaProvider>,
  );

  expect(screen.getByText('Lecturers')).toBeTruthy();
  expect(screen.getByText('Kojo Lecturer')).toBeTruthy();
  expect(screen.getByText('Administrators')).toBeTruthy();
  expect(screen.getByText('Ama Admin')).toBeTruthy();
});

it('confirms and removes added lecturers and administrators', () => {
  const alert = jest.spyOn(Alert, 'alert');
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AdminUserDirectoryScreen />
    </SafeAreaProvider>,
  );

  fireEvent.press(screen.getByLabelText('Remove Kojo Lecturer'));
  const lecturerButtons = alert.mock.calls[0]?.[2];
  lecturerButtons?.find((button) => button.style === 'destructive')?.onPress?.();
  expect(mockRemoveLecturer).toHaveBeenCalledWith('lecturer-1');

  fireEvent.press(screen.getByLabelText('Remove Ama Admin'));
  const adminButtons = alert.mock.calls[1]?.[2];
  adminButtons?.find((button) => button.style === 'destructive')?.onPress?.();
  expect(mockRemoveAdmin).toHaveBeenCalledWith('admin-1');

  alert.mockRestore();
});
