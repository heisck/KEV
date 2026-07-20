import { useLocalSearchParams } from 'expo-router';

import { useSessionStore } from '@/store/sessionStore';

/** Explicit route session wins; a lock supplies context for method-to-method navigation. */
export function useScanSessionId(): string {
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const lockedSessionId = useSessionStore((state) => state.lockedSessionId);
  return exam ?? lockedSessionId ?? '1';
}
