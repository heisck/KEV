import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthScreen } from '@/screens/AuthScreen';

function renderAuthScreen(onEmailSignIn = jest.fn()) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AuthScreen onEmailSignIn={onEmailSignIn} />
    </SafeAreaProvider>,
  );
}

describe('AuthScreen', () => {
  it('renders the email, password and social auth actions', () => {
    const { getByLabelText, getByPlaceholderText, getByText } = renderAuthScreen();

    expect(getByLabelText('Verify Account')).toBeTruthy();
    expect(getByPlaceholderText('Write your gmail')).toBeTruthy();
    expect(getByPlaceholderText('Your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByLabelText('Google')).toBeTruthy();
    expect(getByLabelText('Apple')).toBeTruthy();
  });

  it('submits the trimmed email and password', () => {
    const onEmailSignIn = jest.fn();
    const { getByPlaceholderText, getByText } = renderAuthScreen(onEmailSignIn);

    fireEvent.changeText(getByPlaceholderText('Write your gmail'), ' lecturer@kev.app ');
    fireEvent.changeText(getByPlaceholderText('Your password'), 'Lecturer@1234');
    fireEvent.press(getByText('Sign In'));

    expect(onEmailSignIn).toHaveBeenCalledWith('lecturer@kev.app', 'Lecturer@1234');
  });

  it('toggles password visibility with the eye button', () => {
    const { getByLabelText, getByPlaceholderText } = renderAuthScreen();
    const passwordInput = getByPlaceholderText('Your password');

    expect(passwordInput.props.secureTextEntry).toBe(true);
    fireEvent.press(getByLabelText('Show password'));
    expect(passwordInput.props.secureTextEntry).toBe(false);
    fireEvent.press(getByLabelText('Hide password'));
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
