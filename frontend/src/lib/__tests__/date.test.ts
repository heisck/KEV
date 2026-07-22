import { formatDate, formatDateTime, formatRelativeTime, formatTime, getDayBucket } from '../date';

describe('date utilities', () => {
  const baseNow = new Date(2026, 6, 15, 12, 0, 0);

  describe('getDayBucket', () => {
    it('returns today for same day', () => {
      const date = new Date(2026, 6, 15, 8, 30);
      expect(getDayBucket(date, baseNow)).toBe('today');
    });

    it('returns yesterday for previous day', () => {
      const date = new Date(2026, 6, 14, 23, 0);
      expect(getDayBucket(date, baseNow)).toBe('yesterday');
    });

    it('returns earlier for older dates', () => {
      const date = new Date(2026, 6, 10, 10, 0);
      expect(getDayBucket(date, baseNow)).toBe('earlier');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns Now for less than a minute', () => {
      const date = new Date(baseNow.getTime() - 10_000);
      expect(formatRelativeTime(date, baseNow)).toBe('Now');
    });

    it('returns minutes ago', () => {
      const date = new Date(baseNow.getTime() - 15 * 60_000);
      expect(formatRelativeTime(date, baseNow)).toBe('15m ago');
    });

    it('returns hours ago', () => {
      const date = new Date(baseNow.getTime() - 3 * 3600_000);
      expect(formatRelativeTime(date, baseNow)).toBe('3h ago');
    });
  });

  describe('formatTime', () => {
    it('formats time string correctly', () => {
      const date = new Date(2026, 6, 15, 14, 30);
      expect(formatTime(date)).toMatch(/30/);
    });
  });

  describe('formatDateTime and formatDate', () => {
    it('formats date string correctly', () => {
      const date = new Date(2026, 6, 15);
      expect(formatDate(date)).toBeDefined();
      expect(formatDateTime(date)).toBeDefined();
    });
  });
});
