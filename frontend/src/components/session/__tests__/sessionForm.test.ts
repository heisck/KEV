import type { SessionDto } from '@/api/schemas';
import {
  SessionDraftSchema,
  sessionToWizardValues,
  toCreateInput,
} from '@/components/session/sessionForm';

const session: SessionDto = {
  id: 7,
  sessionCode: 'KEV-ABCD',
  sessionPassword: 'F7K9PX',
  title: 'DCIT 301, DCIT 305',
  building: 'Very Long Engineering Building',
  floor: 'Floor 3',
  room: '18',
  courseCodes: ['DCIT 301', 'DCIT 305'],
  indexRangeStart: '10000001',
  indexRangeEnd: '10000100',
  examDate: '2026-07-21',
  startTime: '09:00',
  endTime: '12:00',
  verificationMethods: ['NFC', 'MANUAL'],
  status: 'UPCOMING',
  startedAt: '2026-07-20T12:00:00Z',
  endedAt: null,
  checkedInCount: 0,
  invigilatorCount: 2,
};

it('maps API-backed session fields into editable wizard values', () => {
  const values = sessionToWizardValues(session);

  expect(values.floor).toBe('3');
  expect(values.courses).toHaveLength(2);
  expect(values.courses[0].indexFrom).toBe('10000001');
  expect(values.methods).toEqual(['NFC', 'MANUAL']);
});

it('does not turn blank index ranges into zero', () => {
  const values = sessionToWizardValues({ ...session, indexRangeStart: null, indexRangeEnd: null });

  expect(toCreateInput(values).indexRangeStart).toBeUndefined();
  expect(toCreateInput(values).indexRangeEnd).toBeUndefined();
});

it('rejects malformed persisted drafts', () => {
  expect(SessionDraftSchema.safeParse({ step: 12, values: {} }).success).toBe(false);
});
