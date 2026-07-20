import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { useSessionStore } from '@/store/sessionStore';

/** Disables native back-swipe while a scanner is pinned to its session. */
export function useScanNavigation(sessionId: string) {
  const navigation = useNavigation();
  const router = useRouter();
  const locked = useSessionStore((state) => state.lockedSessionId === sessionId);

  useEffect(() => {
    navigation.setOptions({ fullScreenGestureEnabled: !locked, gestureEnabled: !locked });
  }, [locked, navigation]);

  const goBack = useCallback(() => {
    if (!locked) router.back();
  }, [locked, router]);

  return { goBack, locked };
}
