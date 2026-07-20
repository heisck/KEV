import { TabSwipeNavigator } from '@/components/navigation/TabSwipeNavigator';
import { ChatDirectoryScreen } from '@/screens/kev/ChatDirectoryScreen';

export default function ChatTab() {
  return (
    <TabSwipeNavigator tab="chat">
      <ChatDirectoryScreen />
    </TabSwipeNavigator>
  );
}
