import { fireEvent, render } from '@testing-library/react-native';

import { VerificationCodeScreen } from '@/screens/VerificationCodeScreen';

describe('VerificationCodeScreen', () => {
  it('renders the verification prompt and actions', () => {
    const { getByLabelText, getByText } = render(
      <VerificationCodeScreen recipient="user@gmail.com" />,
    );

    expect(getByText('Verification code')).toBeTruthy();
    expect(getByText(/user@gmail.com/)).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Resend')).toBeTruthy();
    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('confirms a six digit code', () => {
    const onConfirm = jest.fn();
    const { getByTestId, getByText } = render(<VerificationCodeScreen onConfirm={onConfirm} />);

    '273901'.split('').forEach((digit, index) => {
      fireEvent.changeText(getByTestId(`verification-code-digit-${index}`), digit);
    });
    fireEvent.press(getByText('Confirm'));

    expect(onConfirm).toHaveBeenCalledWith('273901');
  });

  it('handles back and resend actions', () => {
    const onBack = jest.fn();
    const onResend = jest.fn();
    const { getByLabelText, getByText } = render(
      <VerificationCodeScreen onBack={onBack} onResend={onResend} />,
    );

    fireEvent.press(getByLabelText('Go back'));
    fireEvent.press(getByText('Resend'));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onResend).toHaveBeenCalledTimes(1);
  });
});
