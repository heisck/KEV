import { HomeScreen } from '@/screens/kev/HomeScreen';
import { TabSwipeNavigator } from '@/components/navigation/TabSwipeNavigator';

export default function HomeTab() {
  return (
    <TabSwipeNavigator tab="index">
      <HomeScreen />
    </TabSwipeNavigator>
  );
}
