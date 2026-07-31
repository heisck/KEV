function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export function scheduleToday(now = new Date()): string {
  return `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}`;
}

export function scheduleNow(now = new Date()): string {
  return `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`;
}

export function oneHourAfter(start: string, now = new Date()): string {
  const [hours, minutes] = start.split(':').map(Number);
  const base = new Date(now);
  if (Number.isInteger(hours) && Number.isInteger(minutes)) {
    base.setHours(hours, minutes, 0, 0);
  }
  base.setHours(base.getHours() + 1);
  return scheduleNow(base);
}

/** Combine the wizard's `YYYY-MM-DD` + `HH:mm` strings; null when either is unusable. */
export function scheduleAt(date: string, time: string): Date | null {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(y, m - 1, d, Number.isFinite(hours) ? hours : 0, minutes || 0, 0, 0);
}

export type Schedule = { examDate: string; startTime: string; endTime: string };

/**
 * Why a schedule cannot be saved, or null when it is fine.
 *
 * <p>`unchanged` is the schedule as it was loaded, and is exempt from the past-time rules.
 * Without that exemption an exam that started at 09:00 could never be edited after 09:00 —
 * opening the wizard would immediately fail on its own stored values and trap the user.
 * A value the invigilator actually changes still has to be in the future.
 */
export function scheduleError(
  next: Schedule,
  unchanged?: Schedule,
  now = new Date(),
): string | null {
  const dateEdited = !unchanged || next.examDate !== unchanged.examDate;
  const startEdited = !unchanged || next.startTime !== unchanged.startTime;
  const endEdited = !unchanged || next.endTime !== unchanged.endTime;

  if (next.examDate && dateEdited) {
    const day = scheduleAt(next.examDate, '00:00');
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (day && day < today) return 'That date has already passed. Pick today or a later date.';
  }

  // Compare at minute resolution, because that is the resolution the field stores. Tapping
  // "Now" at 13:58:01 and submitting at 13:58:40 is still 13:58 — seconds spent filling in
  // the form must never turn a valid schedule into a past one.
  const thisMinute = new Date(now);
  thisMinute.setSeconds(0, 0);

  const start = next.examDate && next.startTime ? scheduleAt(next.examDate, next.startTime) : null;
  if (start && (dateEdited || startEdited) && start < thisMinute) {
    return 'That start time has already passed. Pick a later time.';
  }

  if (next.startTime && next.endTime && (startEdited || endEdited)) {
    const [sh, sm] = next.startTime.split(':').map(Number);
    const [eh, em] = next.endTime.split(':').map(Number);
    if (Number.isFinite(sh) && Number.isFinite(eh) && eh * 60 + (em || 0) <= sh * 60 + (sm || 0)) {
      return 'The end time must be after the start time.';
    }
  }

  return null;
}
