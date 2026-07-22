import type {
  AttendanceDto,
  AuthResponse,
  FaceVerifyResponse,
  InvigilatorDto,
  SessionDto,
  SessionSummaryDto,
  StudentRecord,
  StudentReport,
  UserDto,
} from '@/api/schemas';

/** Valid DTO fixtures mirroring the backend shapes the Zod schemas expect. */

export const studentRecord: StudentRecord = {
  id: 1,
  indexNumber: '6180724',
  fullName: 'Ama Mensah',
  programme: 'BSc Computer Science',
  level: 400,
  photoUrl: 'https://example.test/photo.jpg',
  enrolled: true,
  feesStatus: 'PAID',
  eligible: true,
  courses: ['CS101'],
};

export const userDto: UserDto = {
  id: 'd9a36b8a-6170-455d-9b46-2d2a78959980',
  email: 'invigilator@st.knust.edu.gh',
  displayName: 'Dr. Ama',
  pictureUrl: null,
  role: 'LECTURER',
  plan: 'FREE',
};

export const authResponse: AuthResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: userDto,
};

export const sessionDto: SessionDto = {
  id: 7,
  sessionCode: 'KEV-7',
  title: 'Algorithms Final',
  building: 'PB',
  floor: '2',
  room: '204',
  courseCodes: ['CS301'],
  indexRangeStart: null,
  indexRangeEnd: null,
  status: 'ACTIVE',
  startedAt: '2026-07-20T09:00:00Z',
  endedAt: null,
  checkedInCount: 3,
  invigilatorCount: 1,
};

export const invigilatorDto: InvigilatorDto = {
  userId: 'd9a36b8a-6170-455d-9b46-2d2a78959980',
  displayName: 'Dr. Ama',
  email: 'invigilator@st.knust.edu.gh',
  pictureUrl: null,
  joinedAt: '2026-07-20T09:00:00Z',
  assignedByAdmin: true,
};

export const attendanceDto: AttendanceDto = {
  id: 11,
  student: studentRecord,
  method: 'MANUAL',
  status: 'CHECKED_IN',
  checkedInAt: '2026-07-20T09:05:00Z',
  removedAt: null,
};

export const sessionSummaryDto: SessionSummaryDto = {
  checkedIn: 3,
  removed: 0,
  byMethod: { MANUAL: 2, FACE: 1 },
  recent: [attendanceDto],
};

export const faceVerifyResponse: FaceVerifyResponse = {
  indexNumber: '6180724',
  similarity: 0.91,
  match: true,
  student: studentRecord,
};

export const studentReport: StudentReport = {
  id: 5,
  sessionId: 7,
  sessionTitle: 'Algorithms Final',
  sessionCode: 'KEV-7',
  examDate: '2026-07-20',
  authorId: 'd9a36b8a-6170-455d-9b46-2d2a78959980',
  authorName: 'Dr. Ama',
  authorEmail: 'invigilator@st.knust.edu.gh',
  student: studentRecord,
  message: 'Attempted to use a second phone.',
  createdAt: '2026-07-20T10:00:00Z',
  read: false,
};
