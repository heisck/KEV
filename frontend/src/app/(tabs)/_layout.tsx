import { Redirect, Tabs } from 'expo-router';

import { AdminIcon, HomeIcon, ProfileIcon, ScanIcon, SessionsIcon } from '@/components/ui/TabIcons';
import { PillTabBar } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function TabsLayout() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status !== 'authenticated') return <Redirect href="/(auth)" />;

  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.surfaceDim },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <ScanIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => <SessionsIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: user?.role === 'ADMIN' ? undefined : null,
          tabBarIcon: ({ color, size }) => <AdminIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
