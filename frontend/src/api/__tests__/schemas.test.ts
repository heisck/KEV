import {
  AttendanceDtoSchema,
  FaceVerifyResponseSchema,
  SessionDtoSchema,
  getProblemDetail,
  isPlanLimitError,
} from '@/api/schemas';

const student = {
  id: 7,
  indexNumber: '12345678',
  fullName: 'Ama Mensah',
  programme: 'BSc Computer Science',
  level: 300,
  photoUrl: 'https://cdn.example.com/p/7.jpg',
  enrolled: true,
  feesStatus: 'PAID',
  eligible: true,
};

const session = {
  id: 1,
  sessionCode: 'ABC123',
  building: 'FF',
  floor: null,
  room: null,
  courseCodes: ['CS301'],
  indexRangeStart: null,
  indexRangeEnd: null,
  status: 'ACTIVE',
  startedAt: '2026-07-04T08:00:00Z',
  endedAt: null,
  checkedInCount: 12,
  invigilatorCount: 2,
};

const attendance = {
  id: 3,
  student,
  method: 'NFC',
  status: 'CHECKED_IN',
  checkedInAt: '2026-07-04T08:15:00Z',
  removedAt: null,
};

const axiosError = (status: number, data: unknown) => ({
  isAxiosError: true,
  response: { status, data },
});

describe('api schemas', () => {
  it('parses a SessionDto with null optionals', () => {
    expect(SessionDtoSchema.parse(session)).toEqual(session);
  });

  it('parses an AttendanceDto with nested student', () => {
    expect(AttendanceDtoSchema.parse(attendance).student.indexNumber).toBe('12345678');
  });

  it('parses a FaceVerifyResponse', () => {
    const parsed = FaceVerifyResponseSchema.parse({
      indexNumber: '12345678',
      similarity: 0.93,
      match: true,
      student,
    });
    expect(parsed.match).toBe(true);
  });

  it('rejects an invalid feesStatus', () => {
    expect(() =>
      AttendanceDtoSchema.parse({ ...attendance, student: { ...student, feesStatus: 'FREE' } }),
    ).toThrow();
  });
});

describe('problem detail helpers', () => {
  const planLimitBody = {
    title: 'Plan limit reached',
    status: 403,
    detail: 'Free plan allows one invigilator.',
    properties: { code: 'plan-limit', upgradeHint: 'Upgrade to Premium.' },
  };

  it('detects the plan-limit error from extension properties', () => {
    expect(isPlanLimitError(axiosError(403, planLimitBody))).toBe(true);
  });

  it('detects a top-level plan-limit code', () => {
    expect(isPlanLimitError(axiosError(403, { title: 'x', code: 'plan-limit' }))).toBe(true);
  });

  it('ignores non-403 and non-axios errors', () => {
    expect(isPlanLimitError(axiosError(409, planLimitBody))).toBe(false);
    expect(isPlanLimitError(new Error('nope'))).toBe(false);
  });

  it('extracts title, detail, and upgradeHint', () => {
    expect(getProblemDetail(axiosError(403, planLimitBody))).toEqual({
      title: 'Plan limit reached',
      detail: 'Free plan allows one invigilator.',
      upgradeHint: 'Upgrade to Premium.',
    });
  });

  it('returns null when there is no response body', () => {
    expect(getProblemDetail(new Error('offline'))).toBeNull();
  });
});
