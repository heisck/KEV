import { oneHourAfter, scheduleNow, scheduleToday } from '@/components/session/sessionSchedule';

const NOW = new Date(2026, 6, 31, 23, 35);

it('formats Today and Now using local time', () => {
  expect(scheduleToday(NOW)).toBe('2026-07-31');
  expect(scheduleNow(NOW)).toBe('23:35');
});

it('sets the end time one hour after the selected start', () => {
  expect(oneHourAfter('09:15', NOW)).toBe('10:15');
  expect(oneHourAfter('23:35', NOW)).toBe('00:35');
  expect(oneHourAfter('', NOW)).toBe('00:35');
});
