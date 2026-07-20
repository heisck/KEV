import { isPastSession, scanBlockMessage } from '@/lib/sessionLifecycle';

it('allows scans only while a session is active', () => {
  expect(scanBlockMessage('ONGOING')).toBeNull();
  expect(scanBlockMessage('UPCOMING')).toContain("hasn't started");
  expect(scanBlockMessage('COMPLETED')).toContain('closed');
  expect(isPastSession('ENDED')).toBe(true);
  expect(isPastSession('UPCOMING')).toBe(false);
});
