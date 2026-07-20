import { z } from 'zod';

import type { SessionDto } from '@/api/schemas';
import type { CreateSessionInput } from '@/api/sessions';

export const VerificationMethodSchema = z.enum(['FACE', 'NFC', 'MANUAL']);
export type VerificationMethod = z.infer<typeof VerificationMethodSchema>;
export const ALL_METHODS: VerificationMethod[] = ['FACE', 'NFC', 'MANUAL'];

const CourseRangeSchema = z.object({
  course: z.string().max(50),
  indexFrom: z.string().max(30),
  indexTo: z.string().max(30),
});

export type CourseRange = z.infer<typeof CourseRangeSchema>;

export const WizardValuesSchema = z.object({
  building: z.string().max(200),
  floor: z.string().max(20),
  room: z.string().max(30),
  courses: z.array(CourseRangeSchema).min(1).max(20),
  examDate: z.string().max(20),
  startTime: z.string().max(20),
  endTime: z.string().max(20),
  methods: z.array(VerificationMethodSchema).max(3),
});

export type WizardValues = z.infer<typeof WizardValuesSchema>;

export const SessionDraftSchema = z.object({
  step: z.number().int().min(0).max(4),
  values: WizardValuesSchema,
});

export type SessionDraft = z.infer<typeof SessionDraftSchema>;

export const EMPTY_WIZARD_VALUES: WizardValues = {
  building: '',
  floor: '',
  room: '',
  courses: [{ course: '', indexFrom: '', indexTo: '' }],
  examDate: '',
  startTime: '',
  endTime: '',
  methods: ['FACE', 'MANUAL'],
};

export function floorLabel(floor: string): string {
  const value = Number(floor);
  if (!floor.trim() || !Number.isFinite(value)) return '';
  if (value < 0) return `Basement ${-value}`;
  if (value === 0) return 'Ground';
  return `Floor ${value}`;
}

function floorValue(floor: string | null): string {
  if (!floor) return '';
  if (floor === 'Ground') return '0';
  const basement = /^Basement\s+(\d+)$/i.exec(floor);
  if (basement) return `-${basement[1]}`;
  return /^Floor\s+(-?\d+)$/i.exec(floor)?.[1] ?? floor;
}

function rangeNumbers(values: string[]): number[] {
  return values.flatMap((value) => {
    const trimmed = value.trim();
    if (!trimmed) return [];
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? [parsed] : [];
  });
}

export function toCreateInput(values: WizardValues): CreateSessionInput {
  const starts = rangeNumbers(values.courses.map((course) => course.indexFrom));
  const ends = rangeNumbers(values.courses.map((course) => course.indexTo));
  const courseCodes = [
    ...new Set(values.courses.map((course) => course.course.trim()).filter(Boolean)),
  ];
  return {
    title: courseCodes.join(', ') || undefined,
    building: values.building.trim(),
    floor: floorLabel(values.floor) || undefined,
    room: values.room.trim() || undefined,
    courseCodes,
    indexRangeStart: starts.length ? String(Math.min(...starts)) : undefined,
    indexRangeEnd: ends.length ? String(Math.max(...ends)) : undefined,
    examDate: values.examDate.trim() || undefined,
    startTime: values.startTime.trim() || undefined,
    endTime: values.endTime.trim() || undefined,
    verificationMethods: values.methods,
  };
}

export function sessionToWizardValues(session: SessionDto): WizardValues {
  const codes = session.courseCodes.length ? session.courseCodes : [session.title ?? ''];
  const methods = (session.verificationMethods ?? []).filter(
    (method): method is VerificationMethod => VerificationMethodSchema.safeParse(method).success,
  );
  return {
    building: session.building,
    floor: floorValue(session.floor),
    room: session.room ?? '',
    courses: codes.map((course) => ({
      course,
      indexFrom: session.indexRangeStart ?? '',
      indexTo: session.indexRangeEnd ?? '',
    })),
    examDate: session.examDate ?? '',
    startTime: session.startTime ?? '',
    endTime: session.endTime ?? '',
    methods: methods.length ? methods : [...ALL_METHODS],
  };
}
