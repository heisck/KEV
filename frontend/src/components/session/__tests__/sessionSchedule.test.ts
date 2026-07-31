import {
  oneHourAfter,
  scheduleError,
  scheduleNow,
  scheduleToday,
} from '@/components/session/sessionSchedule';

const NOW = new Date(2026, 6, 31, 23, 35);
const AFTERNOON = new Date(2026, 6, 31, 14, 0);

it('formats Today and Now using local time', () => {
  expect(scheduleToday(NOW)).toBe('2026-07-31');
  expect(scheduleNow(NOW)).toBe('23:35');
});

it('sets the end time one hour after the selected start', () => {
  expect(oneHourAfter('09:15', NOW)).toBe('10:15');
  expect(oneHourAfter('23:35', NOW)).toBe('00:35');
  expect(oneHourAfter('', NOW)).toBe('00:35');
});

describe('scheduleError', () => {
  const schedule = (examDate: string, startTime = '', endTime = '') => ({
    examDate,
    startTime,
    endTime,
  });

  it('accepts a schedule later today and on a later day', () => {
    expect(scheduleError(schedule('2026-07-31', '16:00', '18:00'), undefined, AFTERNOON)).toBeNull();
    expect(scheduleError(schedule('2026-08-02', '08:00', '11:00'), undefined, AFTERNOON)).toBeNull();
  });

  it('rejects a date that has already passed', () => {
    expect(scheduleError(schedule('2026-07-30', '09:00', '12:00'), undefined, AFTERNOON)).toMatch(
      /already passed/,
    );
  });

  /** Tapping "Now" at 13:58:01 and submitting at 13:58:40 is still 13:58 — seconds are free. */
  it('accepts a start time inside the current minute however late in it you submit', () => {
    const submittedLate = new Date(2026, 6, 31, 13, 58, 40);

    expect(scheduleError(schedule('2026-07-31', '13:58', '15:00'), undefined, submittedLate)).toBeNull();
  });

  it('still rejects the minute before', () => {
    const submittedLate = new Date(2026, 6, 31, 13, 58, 40);

    expect(scheduleError(schedule('2026-07-31', '13:57', '15:00'), undefined, submittedLate)).toMatch(
      /start time has already passed/,
    );
  });

  it('rejects a start time earlier today', () => {
    expect(scheduleError(schedule('2026-07-31', '09:00', '12:00'), undefined, AFTERNOON)).toMatch(
      /start time has already passed/,
    );
  });

  it('rejects an end time at or before the start', () => {
    expect(scheduleError(schedule('2026-07-31', '16:00', '16:00'), undefined, AFTERNOON)).toMatch(
      /end time must be after/,
    );
  });

  /** An exam that already started must stay editable — its own stored values cannot block it. */
  it('exempts a stored schedule the user has not changed', () => {
    const stored = schedule('2026-07-31', '09:00', '12:00');

    expect(scheduleError(stored, stored, AFTERNOON)).toBeNull();
  });

  it('still rejects moving an existing start time into the past', () => {
    const stored = schedule('2026-07-31', '09:00', '12:00');

    expect(scheduleError(schedule('2026-07-31', '08:00', '12:00'), stored, AFTERNOON)).toMatch(
      /start time has already passed/,
    );
    expect(scheduleError(schedule('2026-07-31', '16:00', '18:00'), stored, AFTERNOON)).toBeNull();
  });
});
