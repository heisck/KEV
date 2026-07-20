import type { SessionDto } from '@/api/schemas';

export function scanBlockMessage(status: SessionDto['status'] | undefined): string | null {
  if (!status || status === 'ACTIVE' || status === 'ONGOING') return null;
  if (status === 'UPCOMING') return "This session hasn't started yet";
  return 'This session is closed';
}

export function isPastSession(status: SessionDto['status'] | undefined): boolean {
  return status === 'ENDED' || status === 'COMPLETED' || status === 'CANCELLED';
}
