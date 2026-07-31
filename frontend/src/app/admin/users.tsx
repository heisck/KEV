import { Redirect } from 'expo-router';

import { AdminUserDirectoryScreen } from '@/screens/AdminUserDirectoryScreen';
import { useAuthStore } from '@/store/authStore';

export default function AdminUsersRoute() {
  const role = useAuthStore((state) => state.user?.role);
  if (role !== 'ADMIN') return <Redirect href="/(tabs)" />;
  return <AdminUserDirectoryScreen />;
}
