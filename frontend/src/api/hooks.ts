import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as admin from '@/api/admin';
import * as attendance from '@/api/attendance';
import * as chat from '@/api/chat';
import * as directory from '@/api/directory';
import * as sessions from '@/api/sessions';
import * as verify from '@/api/verify';
import type { CheckInMethod } from '@/api/schemas';

const keys = {
  sessions: ['sessions'] as const,
  session: (id: number) => ['sessions', id] as const,
  summary: (id: number) => ['sessions', id, 'summary'] as const,
  directory: (indexNumber: string) => ['directory', indexNumber] as const,
  lecturers: ['chat', 'lecturers'] as const,
  invigilators: ['admin', 'invigilators'] as const,
  adminSessions: ['admin', 'sessions'] as const,
  report: (id: number) => ['admin', 'sessions', id, 'report'] as const,
};

export function useSessions() {
  return useQuery({ queryKey: keys.sessions, queryFn: sessions.listSessions });
}

export function useSessionDetail(id: number) {
  const valid = Number.isInteger(id) && id > 0;
  return useQuery({
    queryKey: keys.session(id),
    queryFn: () => sessions.getSession(id),
    enabled: valid,
    refetchInterval: valid ? 5000 : false,
  });
}

export function useSessionSummary(id: number) {
  return useQuery({ queryKey: keys.summary(id), queryFn: () => sessions.getSummary(id) });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessions.createSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.sessions }),
  });
}

export function useJoinSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => sessions.joinSession(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.sessions }),
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
