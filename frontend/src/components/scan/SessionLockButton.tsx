import { CircleButton } from '@/components/kev/chrome';
import { LockIcon } from '@/components/kev/icons';
import { useSessionStore } from '@/store/sessionStore';
import { usePalette } from '@/theme';

/** Pins method changes and repeated scans to one session until explicitly unlocked. */
export function SessionLockButton({ sessionId }: { sessionId: string }) {
  const p = usePalette();
  const lockedSessionId = useSessionStore((state) => state.lockedSessionId);
  const toggleSessionLock = useSessionStore((state) => state.toggleSessionLock);
  const locked = lockedSessionId === sessionId;

  return (
    <CircleButton
      label={locked ? 'Unlock scan session' : 'Lock scan session'}
      onPress={() => toggleSessionLock(sessionId)}
    >
      <LockIcon color={locked ? p.primary : p.muted} size={22} />
    </CircleButton>
  );
}
