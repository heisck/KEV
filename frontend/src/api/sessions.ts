import { z } from 'zod';
import { api } from '@/api/client';
import {
  SessionDetailDtoSchema,
  SessionDtoSchema,
  SessionSummaryDtoSchema,
  type SessionDetailDto,
  type SessionDto,
  type SessionSummaryDto,
} from '@/api/schemas';

export type CreateSessionInput = {
  title?: string;
  building: string;
  floor?: string;
  room?: string;
  courseCodes: string[];
  indexRangeStart?: string;
  indexRangeEnd?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  verificationMethods?: string[];
};

export const RosterIngestStatusSchema = z.object({
  state: z.enum(['IDLE', 'STARTING', 'RUNNING', 'RETRYING', 'COMPLETED', 'FAILED']),
  progress: z.number().int().min(0).max(100),
  total: z.number().int().min(0),
  synced: z.number().int().min(0),
  embedded: z.number().int().min(0),
  message: z.string(),
});
export type RosterIngestStatus = z.infer<typeof RosterIngestStatusSchema>;

/** True while a sync is still working, i.e. while polling is worth the battery. */
export function isRosterIngestLive(state: RosterIngestStatus['state'] | undefined): boolean {
  return state === 'STARTING' || state === 'RUNNING' || state === 'RETRYING';
}

export const RosterStudentSchema = z.object({
  indexNumber: z.string(),
  fullName: z.string(),
  photoUrl: z.string().nullable(),
  nfcCode: z.string().nullable(),
  /** False while the student is synced but still awaiting a face embedding. */
  faceReady: z.boolean(),
});
export type RosterStudent = z.infer<typeof RosterStudentSchema>;

export async function createSession(input: CreateSessionInput): Promise<SessionDto> {
  const res = await api.post('/api/sessions', input);
  return SessionDtoSchema.parse(res.data);
}

export async function updateSession(id: number, input: CreateSessionInput): Promise<SessionDto> {
  const res = await api.put(`/api/sessions/${id}`, input);
  return SessionDtoSchema.parse(res.data);
}

export async function listSessions(): Promise<SessionDto[]> {
  const res = await api.get('/api/sessions');
  return z.array(SessionDtoSchema).parse(res.data);
}

export async function getSession(id: number): Promise<SessionDetailDto> {
  const res = await api.get(`/api/sessions/${id}`);
  return SessionDetailDtoSchema.parse(res.data);
}

export async function joinSession(sessionCode: string): Promise<SessionDto> {
  const res = await api.post('/api/sessions/join', { sessionCode });
  return SessionDtoSchema.parse(res.data);
}

export async function joinSessionById(id: number, sessionPassword: string): Promise<SessionDto> {
  const res = await api.post(`/api/sessions/${id}/join`, { sessionPassword });
  return SessionDtoSchema.parse(res.data);
}

export async function endSession(id: number): Promise<SessionDto> {
  const res = await api.post(`/api/sessions/${id}/end`);
  return SessionDtoSchema.parse(res.data);
}

export async function getSummary(id: number): Promise<SessionSummaryDto> {
  const res = await api.get(`/api/sessions/${id}/summary`);
  return SessionSummaryDtoSchema.parse(res.data);
}

export async function getRosterStatus(id: number): Promise<RosterIngestStatus> {
  const res = await api.get(`/api/sessions/${id}/roster-status`);
  return RosterIngestStatusSchema.parse(res.data);
}

export async function retryRoster(id: number): Promise<void> {
  await api.post(`/api/sessions/${id}/roster-retry`);
}

export async function getRoster(id: number): Promise<RosterStudent[]> {
  const res = await api.get(`/api/sessions/${id}/roster`);
  return RosterStudentSchema.array().parse(res.data);
}
