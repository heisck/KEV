import { fireEvent, render } from '@testing-library/react-native';

import { ScanMethodSwitcher } from '@/components/scan/ScanMethodSwitcher';
import { SessionAccessCard } from '@/components/session/SessionAccessCard';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('session scan controls', () => {
  beforeEach(() => mockReplace.mockClear());

  it('shows the generated password on the session', () => {
    const { getByText } = render(<SessionAccessCard code="KEV-ABCD" password="F7K9PX" />);

    expect(getByText('F7K9PX')).toBeTruthy();
    expect(getByText('Lecturer join password')).toBeTruthy();
  });

  it('switches scan method while retaining the session', () => {
    const { getByLabelText } = render(<ScanMethodSwitcher active="NFC" sessionId="42" />);

    fireEvent.press(getByLabelText('Switch to Face verification'));
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/verify/face', params: { exam: '42' } });
  });
});
