import { Redirect, Stack, type Href } from 'expo-router';

import { useAuthStore } from '@/store/authStore';

export default function AuthLayout() {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.user?.role);

  if (status === 'authenticated') {
    // Cast needed: admin-tabs routes are generated at dev-server start time.
    const dest = (role === 'ADMIN' ? '/(admin-tabs)' : '/(tabs)') as Href;
    return <Redirect href={dest} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
