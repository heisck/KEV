import { TabSwipeNavigator } from '@/components/navigation/TabSwipeNavigator';
import { ProfileScreen } from '@/screens/ProfileScreen';

export default function ProfileTab() {
  return (
    <TabSwipeNavigator tab="profile">
      <ProfileScreen />
    </TabSwipeNavigator>
  );
}
