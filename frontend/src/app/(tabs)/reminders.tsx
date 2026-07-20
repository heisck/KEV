import { TabSwipeNavigator } from '@/components/navigation/TabSwipeNavigator';
import { NotificationsScreen } from '@/screens/kev/NotificationsScreen';

export default function RemindersTab() {
  return (
    <TabSwipeNavigator tab="reminders">
      <NotificationsScreen />
    </TabSwipeNavigator>
  );
}
