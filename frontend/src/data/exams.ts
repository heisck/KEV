import type { ArtKey } from '@/components/kev/art';
import type { SessionDto, StudentRecord } from '@/api/schemas';

export type ExamStatus = 'Upcoming' | 'Ongoing' | 'Past';

export type ChecklistItem = { label: string; kind: 'done' | 'pending' };

export type Exam = {
  id: string;
  course: string;
  dates: string;
  status: ExamStatus;
  art: ArtKey;
  checklist: ChecklistItem[];
  /** 'session' → indigo CTA button; number → "N students ›" row */
  action: 'session' | number;
};

export function sessionToExam(s: SessionDto): Exam {
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
  const checklist: ChecklistItem[] = [
    { label: 'Room assigned: ' + s.building, kind: 'done' },
    { label: isOngoing ? 'Roster active' : 'Scanner ready', kind: isOngoing ? 'done' : 'pending' },
  ];
  return {
    id: String(s.id),
    course,
    dates,
    status,
    art,
    checklist,
    action,
  };
}

export type ScannedStudent = {
  id: string;
  name: string;
  person: string;
  index: string;
  course: string;
};

export function studentRecordToScanned(s: StudentRecord): ScannedStudent {
  return {
    id: String(s.id),
    name: s.fullName,
    person: s.photoUrl || 'freja',
    index: s.indexNumber,
    course: s.programme,
  };
}
