import { Redirect, Tabs } from 'expo-router';

import {
  ChatTabIcon,
  HomeTabIcon,
  ProfileTabIcon,
  RemindersTabIcon,
  ExamsTabIcon,
} from '@/components/kev/icons';
import { KevTabBar } from '@/components/kev/KevTabBar';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

export default function TabsLayout() {
  const status = useAuthStore((s) => s.status);

  if (status !== 'authenticated') return <Redirect href="/(auth)" />;

  return (
    <Tabs
      tabBar={(props) => <KevTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.white },
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
        name="exams"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color, size }) => <ExamsTabIcon color={color} size={size} />,
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
      <Tabs.Screen name="sessions" options={{ href: null }} />
    </Tabs>
  );
}
