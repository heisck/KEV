import { fireEvent, render } from '@testing-library/react-native';
import { Image, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthScreen } from '@/screens/AuthScreen';
import { AUTH_HERO_DARK_IMAGE } from '@/screens/authConfig';
import { getPalette } from '@/theme/palette';
import { useSettingsStore } from '@/store/settingsStore';

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

function renderKeyboardView(os: 'android' | 'ios') {
  const platformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });

  try {
    return renderAuthScreen().UNSAFE_getByType(KeyboardAvoidingView);
  } finally {
    if (platformDescriptor) Object.defineProperty(Platform, 'OS', platformDescriptor);
  }
}

describe('AuthScreen', () => {
  beforeEach(() => useSettingsStore.setState({ theme: 'light' }));

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

  it('moves the full form above the Android keyboard', () => {
    expect(renderKeyboardView('android').props.behavior).toBe('height');
  });

  it('moves the full form as one layer on iOS', () => {
    const keyboardView = renderKeyboardView('ios');

    expect(keyboardView.props.behavior).toBe('position');
    expect(keyboardView.props.contentContainerStyle).toEqual(expect.objectContaining({ flex: 1 }));
  });

  it('uses the dark hero and readable dark form controls', () => {
    useSettingsStore.setState({ theme: 'dark' });
    const { UNSAFE_getByType, getByPlaceholderText } = renderAuthScreen();
    const emailInput = getByPlaceholderText('Write your gmail');
    const darkPalette = getPalette(true);

    expect(UNSAFE_getByType(Image).props.source).toBe(AUTH_HERO_DARK_IMAGE);
    expect(emailInput.props.placeholderTextColor).toBe(darkPalette.muted);
    expect(StyleSheet.flatten(emailInput.props.style).color).toBe(darkPalette.ink);
  });

  it('uses the bundled auth image without a network URI', () => {
    expect(AUTH_HERO_DARK_IMAGE).toBe(
      require('../../../assets/images/campus-landscape-terrace.jpg'),
    );
  });
});
