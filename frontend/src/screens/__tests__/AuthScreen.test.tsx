import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthScreen } from '@/screens/AuthScreen';

function renderAuthScreen(onEmailSignIn = jest.fn(), errorMessage: string | null = null) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <AuthScreen onEmailSignIn={onEmailSignIn} errorMessage={errorMessage} />
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

  it('shows the error pill when a message is passed', () => {
    const { getByText } = renderAuthScreen(jest.fn(), 'Invalid email or password');

    expect(getByText('Invalid email or password')).toBeTruthy();
  });
});
