import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminAddUserScreen } from '@/screens/AdminAddUserScreen';

const mockCreateAdmin = jest.fn();
const mockCreateLecturer = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@/api/hooks', () => ({
  useCreateAdmin: () => ({ isPending: false, mutate: mockCreateAdmin }),
  useCreateLecturer: () => ({ isPending: false, mutate: mockCreateLecturer }),
}));

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AdminAddUserScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockCreateAdmin.mockReset();
  mockCreateLecturer.mockReset();
});

it('uses the original onboarding structure for lecturers and administrators', () => {
  const screen = renderScreen();

  expect(screen.getByText('Onboard User')).toBeTruthy();
  expect(screen.getByText('Lecturer')).toBeTruthy();
  expect(screen.getByText('Administrator')).toBeTruthy();
  expect(screen.getByPlaceholderText('e.g. LEC-001')).toBeTruthy();

  fireEvent.press(screen.getByText('Administrator'));

  expect(screen.getByPlaceholderText('First name')).toBeTruthy();
  expect(screen.getByPlaceholderText('Last name')).toBeTruthy();
  expect(screen.getByPlaceholderText('e.g. admin.personal@gmail.com')).toBeTruthy();
  expect(screen.getByText('Create Administrator')).toBeTruthy();
});
