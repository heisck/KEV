import { act, renderHook } from '@testing-library/react-native';

import { checkIn } from '@/api/attendance';
import type { CheckInMethod, StudentRecord } from '@/api/schemas';
import { useScanCheckIn } from '@/hooks/useScanCheckIn';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@/api/attendance', () => ({ checkIn: jest.fn() }));
jest.mock('@/lib/haptics', () => ({ haptic: jest.fn() }));
jest.mock('@/lib/toast', () => ({
  toast: { error: jest.fn(), info: jest.fn(), success: jest.fn() },
}));

const mockCheckIn = jest.mocked(checkIn);
const student: StudentRecord = {
  id: 7,
  indexNumber: '10953001',
  fullName: 'Ama Boateng',
  programme: 'BSc CS',
  level: 300,
  photoUrl: 'https://example.com/ama.jpg',
  enrolled: true,
  feesStatus: 'PAID',
  eligible: true,
  courses: ['DCIT 301'],
};

beforeEach(() => {
  mockReplace.mockReset();
  mockCheckIn.mockReset();
  useSessionStore.setState({ roster: {} });
});

it.each<CheckInMethod>(['FACE', 'NFC', 'MANUAL'])(
  'opens the result page for %s only when the latest preference is enabled',
  async (method) => {
    mockCheckIn.mockResolvedValue({
      id: 8,
      method,
      status: 'CHECKED_IN',
      checkedInAt: '2026-07-20T09:30:00Z',
      removedAt: null,
      student,
    });
    useSettingsStore.setState({ showSuccessPage: false });
    const { result } = renderHook(() => useScanCheckIn('2', method));

    useSettingsStore.setState({ showSuccessPage: true });
    await act(async () => result.current(student.indexNumber));

    expect(mockCheckIn).toHaveBeenCalledWith(2, { indexNumber: student.indexNumber, method });
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/verify/result',
      params: { exam: '2', method, status: 'added', student: '7' },
    });
  },
);

it('stays on the scanner when the latest preference is disabled', async () => {
  mockCheckIn.mockResolvedValue({
    id: 8,
    method: 'NFC',
    status: 'CHECKED_IN',
    checkedInAt: '2026-07-20T09:30:00Z',
    removedAt: null,
    student,
  });
  useSettingsStore.setState({ showSuccessPage: true });
  const { result } = renderHook(() => useScanCheckIn('2', 'NFC'));

  useSettingsStore.setState({ showSuccessPage: false });
  await act(async () => result.current(student.indexNumber));

  expect(mockReplace).not.toHaveBeenCalled();
});
