import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthScreen } from '@/screens/AuthScreen';

function renderAuthScreen(onSendCode = jest.fn()) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AuthScreen onSendCode={onSendCode} />
    </SafeAreaProvider>,
  );
}

describe('AuthScreen', () => {
  it('renders the email and social auth actions', () => {
    const { getByLabelText, getByPlaceholderText, getByText } = renderAuthScreen();

    expect(getByLabelText('Verify Account')).toBeTruthy();
    expect(getByPlaceholderText('Write your gmail')).toBeTruthy();
    expect(getByText('Send Code')).toBeTruthy();
    expect(getByLabelText('Google')).toBeTruthy();
    expect(getByLabelText('Apple')).toBeTruthy();
  });

  it('submits the trimmed email address', () => {
    const onSendCode = jest.fn();
    const { getByPlaceholderText, getByText } = renderAuthScreen(onSendCode);

    fireEvent.changeText(getByPlaceholderText('Write your gmail'), ' user@gmail.com ');
    fireEvent.press(getByText('Send Code'));

    expect(onSendCode).toHaveBeenCalledWith('user@gmail.com');
  });
});
