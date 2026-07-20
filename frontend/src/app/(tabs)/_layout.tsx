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

export default function TabsLayout() {
  const status = useAuthStore((s) => s.status);
  const p = usePalette();

  if (status !== 'authenticated') return <Redirect href="/(auth)" />;

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
          title: 'Home',
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
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <PlusIcon color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            // The Create tab is an action: open the wizard instead of switching tabs.
            e.preventDefault();
            router.push('/room-setup');
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
      {/* Still under (tabs) for existing deep links — never in the bar. */}
      <Tabs.Screen name="scan" options={{ href: null }} />
    </Tabs>
  );
}
