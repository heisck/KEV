import { Redirect } from 'expo-router';

import { AdminAddUserScreen } from '@/screens/AdminAddUserScreen';
import { useAuthStore } from '@/store/authStore';

export default function AdminAddUserRoute() {
  const role = useAuthStore((state) => state.user?.role);
  if (role !== 'ADMIN') return <Redirect href="/(tabs)" />;
  return <AdminAddUserScreen />;
}
