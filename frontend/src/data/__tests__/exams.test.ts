import type { SessionDto } from '@/api/schemas';
import { matchesExamQuery, sessionToExam } from '@/data/exams';

const session = {
  id: 42,
  sessionCode: 'KEV-F7K9',
  building: 'JQB',
  courseCodes: ['DCIT 301'],
  status: 'ACTIVE',
  startedAt: '2026-07-20T10:00:00Z',
  endedAt: null,
  checkedInCount: 0,
  invigilatorCount: 1,
  floor: null,
  room: null,
  indexRangeStart: null,
  indexRangeEnd: null,
} satisfies SessionDto;

it('matches home sessions by their session code', () => {
  const exam = sessionToExam(session);
  expect(matchesExamQuery(exam, 'f7k9')).toBe(true);
  expect(matchesExamQuery(exam, 'dcit')).toBe(true);
});
