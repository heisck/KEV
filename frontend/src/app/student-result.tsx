import { useLocalSearchParams } from 'expo-router';

import { CheckInMethodSchema } from '@/api/schemas';
import { StudentResultScreen } from '@/screens/StudentResultScreen';

export default function StudentResultModal() {
  const params = useLocalSearchParams<{
    indexNumber: string;
    sessionId: string;
    method: string;
  }>();
  const method = CheckInMethodSchema.safeParse(params.method);

  return (
    <StudentResultScreen
      indexNumber={params.indexNumber ?? ''}
      sessionId={Number(params.sessionId)}
      method={method.success ? method.data : 'MANUAL'}
    />
  );
}
