import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as admin from '@/api/admin';
import * as attendance from '@/api/attendance';
import * as chat from '@/api/chat';
import * as directory from '@/api/directory';
import * as notifications from '@/api/notifications';
import * as reports from '@/api/reports';
import * as sessions from '@/api/sessions';
import * as verify from '@/api/verify';
import type { CheckInMethod } from '@/api/schemas';
import { useAuthStore } from '@/store/authStore';

const keys = {
  sessions: ['sessions'] as const,
  session: (id: number) => ['sessions', id] as const,
  summary: (id: number) => ['sessions', id, 'summary'] as const,
  directory: (indexNumber: string) => ['directory', indexNumber] as const,
  lecturers: ['chat', 'lecturers'] as const,
  conversations: ['chat', 'conversations'] as const,
  invigilators: ['admin', 'invigilators'] as const,
  adminDashboard: ['admin', 'dashboard'] as const,
  adminSessions: ['admin', 'sessions'] as const,
  adminLecturers: ['admin', 'lecturers'] as const,
  adminAdmins: ['admin', 'admins'] as const,
  report: (id: number) => ['admin', 'sessions', id, 'report'] as const,
  notifications: ['notifications'] as const,
  reports: ['reports'] as const,
};

export function useSessions() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...keys.sessions, userId],
    queryFn: sessions.listSessions,
    enabled: Boolean(userId),
  });
}

export function useSessionDetail(id: number, enabled = true) {
  const userId = useAuthStore((state) => state.user?.id);
  const valid = Number.isInteger(id) && id > 0;
  return useQuery({
    queryKey: [...keys.session(id), userId],
    queryFn: () => sessions.getSession(id),
    enabled: enabled && valid && Boolean(userId),
    refetchInterval: enabled && valid && userId ? 5000 : false,
  });
}

export function useSessionSummary(id: number) {
  const userId = useAuthStore((state) => state.user?.id);
  const valid = Number.isInteger(id) && id > 0;
  return useQuery({
    queryKey: [...keys.summary(id), userId],
    queryFn: () => sessions.getSummary(id),
    enabled: valid && Boolean(userId),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessions.createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.sessions }),
  });
}

export function useUpdateSession(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: sessions.CreateSessionInput) => sessions.updateSession(id, input),
    onSuccess: (session) => {
      void qc.invalidateQueries({ queryKey: keys.sessions });
      void qc.invalidateQueries({ queryKey: keys.session(session.id) });
    },
  });
}

export function useJoinSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => sessions.joinSession(code),
    onSuccess: (session) => {
      void qc.invalidateQueries({ queryKey: keys.sessions });
      void qc.invalidateQueries({ queryKey: keys.session(session.id) });
    },
  });
}

export function useJoinSessionById(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => sessions.joinSessionById(id, password),
    onSuccess: (session) => {
      void qc.invalidateQueries({ queryKey: keys.sessions });
      void qc.invalidateQueries({ queryKey: keys.session(session.id) });
    },
  });
}

export function useCheckIn(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { indexNumber: string; method: CheckInMethod }) =>
      attendance.checkIn(sessionId, input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: keys.session(sessionId) });
      void qc.invalidateQueries({ queryKey: keys.summary(sessionId) });
    },
  });
}

export function useRemoveAttendance(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attendanceId: number) => attendance.removeAttendance(sessionId, attendanceId),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: keys.session(sessionId) });
      void qc.invalidateQueries({ queryKey: keys.summary(sessionId) });
    },
  });
}

export function useStudentLookup(indexNumber: string | undefined) {
  return useQuery({
    queryKey: keys.directory(indexNumber ?? ''),
    queryFn: () => directory.lookupStudent(indexNumber as string),
    enabled: !!indexNumber,
  });
}

export function useFaceVerify() {
  return useMutation({
    mutationFn: (input: { indexNumber: string; probe: verify.ProbeImage }) =>
      verify.verifyFace(input.indexNumber, input.probe),
  });
}

export function useInvigilators() {
  return useQuery({ queryKey: keys.invigilators, queryFn: admin.listInvigilators });
}

/** Lecturer/admin directory for chat — any signed-in user (non-admin safe). */
export function useLecturers() {
  return useQuery({ queryKey: keys.lecturers, queryFn: () => chat.listLecturers() });
}

export function useConversations() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...keys.conversations, userId],
    queryFn: chat.listConversations,
    enabled: Boolean(userId),
    refetchInterval: userId ? 3_000 : false,
  });
}

export function useNotifications(enabled = true) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...keys.notifications, userId],
    queryFn: notifications.listNotifications,
    enabled: enabled && Boolean(userId),
    refetchInterval: enabled && userId ? 3_000 : false,
  });
}

export function useReports() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...keys.reports, userId],
    queryFn: reports.listReports,
    enabled: Boolean(userId),
    refetchInterval: userId ? 5_000 : false,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reports.createReport,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.reports });
      void qc.invalidateQueries({ queryKey: keys.notifications });
    },
  });
}

export function useMarkReportRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reports.markReportRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.reports }),
  });
}

export function useMarkReportsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reports.markReportsRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.reports }),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reports.deleteReport,
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.reports }),
  });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: keys.adminDashboard, queryFn: admin.getDashboard });
}

export function useAdminSessions() {
  return useQuery({ queryKey: keys.adminSessions, queryFn: admin.listAdminSessions });
}

export function useSessionReport(id: number) {
  return useQuery({ queryKey: keys.report(id), queryFn: () => admin.getSessionReport(id) });
}

export function useAssignInvigilator(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => admin.assignInvigilator(sessionId, userId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useUnassignInvigilator(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => admin.unassignInvigilator(sessionId, userId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useLecturersList() {
  return useQuery({ queryKey: keys.adminLecturers, queryFn: admin.listLecturers });
}

export function useCreateLecturer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admin.createLecturer,
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.adminLecturers }),
  });
}

export function useUpdateLecturer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        fullName: string;
        lecturerId: string;
        universityEmail: string;
        personalEmail: string;
        phone: string;
        status?: string;
        active?: boolean;
      };
    }) => admin.updateLecturer(id, data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.adminLecturers }),
  });
}

export function useDisableLecturer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => admin.disableLecturer(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.adminLecturers }),
  });
}

export function useAdminsList() {
  return useQuery({ queryKey: keys.adminAdmins, queryFn: admin.listAdmins });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admin.createAdmin,
    onSuccess: () => void qc.invalidateQueries({ queryKey: keys.adminAdmins }),
  });
}
