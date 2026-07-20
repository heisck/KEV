import { useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/screens/kev/ChatScreen';

export default function ChatThreadRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatScreen threadId={typeof id === 'string' ? id : undefined} />;
}
