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
