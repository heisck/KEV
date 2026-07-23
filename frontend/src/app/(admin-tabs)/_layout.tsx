import { Redirect, router, Tabs } from 'expo-router';

import {
  ChatTabIcon,
  HomeTabIcon,
  PlusIcon,
  ProfileTabIcon,
  RemindersTabIcon,
} from '@/components/kev/icons';
import { KevTabBar } from '@/components/kev/KevTabBar';
import { useAuthStore } from '@/store/authStore';
import { usePalette } from '@/theme';

/**
 * Admin tab layout — shown only to ADMIN users.
 * Tabs: Dashboard, Reminders, Add (+), Chat, Profile
 */
export default function AdminTabsLayout() {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.user?.role);
  const p = usePalette();

  if (status !== 'authenticated') return <Redirect href="/(auth)" />;
  if (role !== 'ADMIN') return <Redirect href="/(tabs)" />;

  return (
    <Tabs
      tabBar={(props) => <KevTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: p.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <HomeTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, size }) => <RemindersTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => <PlusIcon color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/admin');
          },
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <ChatTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <ProfileTabIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
