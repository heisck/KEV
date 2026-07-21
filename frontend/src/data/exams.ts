import type { ArtKey } from '@/components/kev/art';
import type { CheckInMethod, SessionDto, StudentRecord } from '@/api/schemas';
import { env } from '@/config/env';

export type ExamStatus = 'Upcoming' | 'Ongoing' | 'Past';
export type HomeExamFilter = 'All' | ExamStatus | 'Favorites';

export type ChecklistItem = { label: string; kind: 'done' | 'pending' };

export type Exam = {
  id: string;
  sessionCode: string;
  course: string;
  dates: string;
  status: ExamStatus;
  art: ArtKey;
  checklist: ChecklistItem[];
  /** 'session' → indigo CTA button; number → "N students ›" row */
  action: 'session' | number;
};

export function sessionToExam(s: SessionDto): Exam {
  // Backend computes UPCOMING/ONGOING/COMPLETED from the schedule; ACTIVE is the
  // legacy "live" value and CANCELLED/ENDED are treated as past.
  const isOngoing = s.status === 'ONGOING' || s.status === 'ACTIVE';
  const isEnded = s.status === 'ENDED' || s.status === 'COMPLETED' || s.status === 'CANCELLED';
  const status: ExamStatus = isEnded ? 'Past' : isOngoing ? 'Ongoing' : 'Upcoming';
  const course =
    s.courseCodes && s.courseCodes.length > 0
      ? s.courseCodes.join(', ')
      : (s.title ?? s.sessionCode);
  const dates = s.examDate
    ? `${s.examDate} · ${s.startTime ?? ''}`
    : new Date(s.startedAt).toLocaleDateString();
  const arts: ArtKey[] = ['campus', 'city', 'harbor'];
  const art: ArtKey = arts[Math.abs(Number(s.id) || 0) % arts.length];
  const action = isOngoing ? Number(s.checkedInCount || 0) : 'session';
  const methodLabels: Record<string, string> = {
    FACE: 'Face',
    MANUAL: 'Manual',
    NFC: 'NFC',
  };
  const statusItems: ChecklistItem[] = isEnded
    ? (s.verificationMethods ?? ['FACE', 'NFC', 'MANUAL']).map((method) => ({
        label: `${methodLabels[method] ?? method} verification`,
        kind: 'done',
      }))
    : [
        {
          label: isOngoing ? 'Roster active' : 'Scanner ready',
          kind: isOngoing ? 'done' : 'pending',
        },
      ];
  const checklist: ChecklistItem[] = [
    { label: 'Room assigned: ' + s.building, kind: 'done' },
    ...statusItems,
  ];
  return {
    id: String(s.id),
    sessionCode: s.sessionCode,
    course,
    dates,
    status,
    art,
    checklist,
    action,
  };
}

export function matchesExamQuery(exam: Exam, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  return (
    exam.course.toLowerCase().includes(normalized) ||
    exam.sessionCode.toLowerCase().includes(normalized)
  );
}

export function filterHomeExams(
  exams: Exam[],
  filter: HomeExamFilter,
  query: string,
  favoriteIds: ReadonlySet<string>,
): Exam[] {
  return exams.filter(
    (exam) =>
      (filter === 'All' ||
        (filter === 'Favorites' ? favoriteIds.has(exam.id) : exam.status === filter)) &&
      matchesExamQuery(exam, query),
  );
}

export type ScannedStudent = {
  id: string;
  attendanceId?: number;
  name: string;
  person: string;
  index: string;
  course: string;
  method?: CheckInMethod;
};

export type StudentMethodFilter = Extract<CheckInMethod, 'FACE' | 'MANUAL' | 'NFC'> | null;

export function resolveStudentPhotoUrl(photoUrl: string, apiUrl = env.apiUrl): string {
  const apiOrigin = apiUrl.replace(/\/+$/, '');
  if (photoUrl.startsWith('/')) return `${apiOrigin}${photoUrl}`;
  return photoUrl.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i, apiOrigin);
}

export function studentRecordToScanned(
  s: StudentRecord,
  method?: CheckInMethod,
  attendanceId?: number,
): ScannedStudent {
  return {
    id: String(s.id),
    attendanceId,
    name: s.fullName,
    person: s.photoUrl ? resolveStudentPhotoUrl(s.photoUrl) : 'freja',
    index: s.indexNumber,
    course: s.programme,
    method,
  };
}

export function filterSessionStudents(
  students: ScannedStudent[],
  query: string,
  method: StudentMethodFilter,
  alphabetical: boolean,
): ScannedStudent[] {
  const normalized = query.trim().toLowerCase();
  const filtered = students.filter(
    (student) =>
      (!normalized ||
        student.name.toLowerCase().includes(normalized) ||
        student.index.toLowerCase().includes(normalized)) &&
      (!method || student.method === method),
  );
  return alphabetical
    ? [...filtered].sort((left, right) => left.name.localeCompare(right.name))
    : filtered;
}
