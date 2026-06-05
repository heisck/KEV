import { fireEvent, render } from '@testing-library/react-native';
import { type ComponentProps } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VerificationCodeScreen } from '@/screens/VerificationCodeScreen';

function renderVerificationCodeScreen(props: ComponentProps<typeof VerificationCodeScreen> = {}) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <VerificationCodeScreen {...props} />
    </SafeAreaProvider>,
  );
}

describe('VerificationCodeScreen', () => {
  it('renders the verification prompt and actions', () => {
    const { getByLabelText, getByText } = renderVerificationCodeScreen({
      recipient: 'user@gmail.com',
    });

    expect(getByText('Verification code')).toBeTruthy();
    expect(getByText(/user@gmail.com/)).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Resend')).toBeTruthy();
    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('confirms a six digit code', () => {
    const onConfirm = jest.fn();
    const { getByTestId, getByText } = renderVerificationCodeScreen({ onConfirm });

    '273901'.split('').forEach((digit, index) => {
      fireEvent.changeText(getByTestId(`verification-code-digit-${index}`), digit);
    });
    fireEvent.press(getByText('Confirm'));

    expect(onConfirm).toHaveBeenCalledWith('273901');
  });

  it('handles back and resend actions', () => {
    const onBack = jest.fn();
    const onResend = jest.fn();
    const { getByLabelText, getByText } = renderVerificationCodeScreen({ onBack, onResend });

    fireEvent.press(getByLabelText('Go back'));
    fireEvent.press(getByText('Resend'));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onResend).toHaveBeenCalledTimes(1);
  });
});
