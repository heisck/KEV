import { useLocalSearchParams } from 'expo-router';

import { LoginScreen } from '@/screens/LoginScreen';

export default function Login() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  return <LoginScreen initialEmail={email} />;
}
