import type { ArtKey } from '@/components/kev/art';

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

export const EXAMS: Exam[] = [
  {
    id: 'cs101',
    course: 'CS 101',
    dates: 'Apr 20 · 09:00',
    status: 'Upcoming',
    art: 'campus',
    checklist: [
      { label: 'Room assigned', kind: 'done' },
      { label: 'Scanner pickup', kind: 'pending' },
    ],
    action: 'session',
  },
  {
    id: 'ma204',
    course: 'MA 204',
    dates: 'Apr 9 · 13:00',
    status: 'Ongoing',
    art: 'city',
    checklist: [
      { label: 'Room assigned', kind: 'done' },
      { label: 'Roster synced', kind: 'done' },
    ],
    action: 142,
  },
  {
    id: 'ph110',
    course: 'PH 110',
    dates: 'Mar 3 · 09:00',
    status: 'Past',
    art: 'harbor',
    checklist: [
      { label: 'Room assigned', kind: 'done' },
      { label: 'Roster synced', kind: 'done' },
    ],
    action: 'session',
  },
];

export const SESSION = {
  hall: 'Main Exam Hall',
  score: '98%',
  starts: '09:00',
  ends: '12:00',
  date: 'Apr 20',
  students: 142,
  verified: 139,
  flagged: 3,
  /** Mock join password until the backend session API is wired. */
  code: '1234',
} as const;

export type ScannedStudent = {
  id: string;
  name: string;
  person: string;
  index: string;
  course: string;
};

/** Mock pool of scannable students until the verification API is wired. */
export const SCAN_POOL: ScannedStudent[] = [
  {
    id: 'p1',
    name: 'Abena Osei',
    person: 'freja',
    index: '4211020',
    course: 'BSc Computer Science',
  },
  {
    id: 'p2',
    name: 'Kofi Mensah',
    person: 'kofi',
    index: '4211045',
    course: 'BSc Computer Science',
  },
  {
    id: 'p3',
    name: 'Yaw Boateng',
    person: 'ben',
    index: '4211078',
    course: 'BSc Information Technology',
  },
  {
    id: 'p4',
    name: 'Akosua Asante',
    person: 'anna',
    index: '4211102',
    course: 'BSc Computer Science',
  },
  {
    id: 'p5',
    name: 'Kwame Owusu',
    person: 'milan',
    index: '4211130',
    course: 'BSc Information Technology',
  },
];

/** Invigilators available to explore for a session. */
export const INVIGILATORS = [
  { id: 'i1', name: 'Dr. Ben Ansah', person: 'ben', joined: 'Apr 9 · 08:42', hall: 'Hall A' },
  { id: 'i2', name: 'Prof. Freja Holm', person: 'freja', joined: 'Apr 9 · 08:50', hall: 'Hall A' },
  { id: 'i3', name: 'Dr. Kofi Adjei', person: 'kofi', joined: 'Apr 9 · 09:05', hall: 'Hall B' },
  { id: 'i4', name: 'Dr. Milan Novak', person: 'milan', joined: 'Apr 9 · 09:12', hall: 'Hall B' },
  { id: 'i5', name: 'Dr. Anna Rossi', person: 'anna', joined: 'Apr 9 · 09:20', hall: 'Hall C' },
] as const;

/** Mock roster shown in the group session until scanning is wired. */
export const SESSION_STUDENTS = [
  { id: 's1', name: 'Ama', person: 'freja' },
  { id: 's2', name: 'Kojo', person: 'kofi' },
  { id: 's3', name: 'Efua', person: 'anna' },
  { id: 's4', name: 'Yaw', person: 'ben' },
  { id: 's5', name: 'Adwoa', person: 'freja' },
  { id: 's6', name: 'Kwesi', person: 'milan' },
  { id: 's7', name: 'Esi', person: 'anna' },
] as const;
