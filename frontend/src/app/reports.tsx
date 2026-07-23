import { Stack } from 'expo-router';
import { ReportsScreen } from '@/screens/kev/ReportsScreen';

export default function ReportsRoute() {
  return (
    <>
      <Stack.Screen options={{ fullScreenGestureEnabled: false, gestureEnabled: false }} />
      <ReportsScreen />
    </>
  );
}
