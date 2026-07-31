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
