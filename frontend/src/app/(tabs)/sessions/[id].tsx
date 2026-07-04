import { useLocalSearchParams } from 'expo-router';

import { SessionDetailScreen } from '@/screens/SessionDetailScreen';

export default function SessionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SessionDetailScreen sessionId={Number(id)} />;
}
