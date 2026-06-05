import { fireEvent, render } from '@testing-library/react-native';

import { AuthScreen } from '@/screens/AuthScreen';

function renderAuthScreen(onSendCode = jest.fn()) {
  return render(<AuthScreen onSendCode={onSendCode} />);
}

describe('AuthScreen', () => {
  it('renders the email and social auth actions', () => {
    const { getByPlaceholderText, getByText } = renderAuthScreen();

    expect(getByText('Verify your Account')).toBeTruthy();
    expect(getByPlaceholderText('Write your gmail')).toBeTruthy();
    expect(getByText('Send Code')).toBeTruthy();
    expect(getByText('Google')).toBeTruthy();
    expect(getByText('Apple')).toBeTruthy();
  });

  it('submits the trimmed email address', () => {
    const onSendCode = jest.fn();
    const { getByPlaceholderText, getByText } = renderAuthScreen(onSendCode);

    fireEvent.changeText(getByPlaceholderText('Write your gmail'), ' user@gmail.com ');
    fireEvent.press(getByText('Send Code'));

    expect(onSendCode).toHaveBeenCalledWith('user@gmail.com');
  });
});
