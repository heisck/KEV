import { z } from 'zod';
import { api } from '@/api/client';
import {
  InvigilatorDtoSchema,
  SessionDtoSchema,
  SessionSummaryDtoSchema,
  UserDtoSchema,
  type InvigilatorDto,
  type SessionDto,
  type SessionSummaryDto,
  type UserDto,
} from '@/api/schemas';

export async function listInvigilators(): Promise<UserDto[]> {
  const res = await api.get('/api/admin/invigilators');
  return z.array(UserDtoSchema).parse(res.data);
}

export async function listAdminSessions(): Promise<SessionDto[]> {
  const res = await api.get('/api/admin/sessions');
  return z.array(SessionDtoSchema).parse(res.data);
}

export async function getSessionReport(id: number): Promise<SessionSummaryDto> {
  const res = await api.get(`/api/admin/sessions/${id}/report`);
  return SessionSummaryDtoSchema.parse(res.data);
}

export async function assignInvigilator(
  sessionId: number,
  userId: string,
): Promise<InvigilatorDto> {
  const res = await api.post(`/api/admin/sessions/${sessionId}/invigilators`, { userId });
  return InvigilatorDtoSchema.parse(res.data);
}

export async function unassignInvigilator(sessionId: number, userId: string): Promise<void> {
  await api.delete(`/api/admin/sessions/${sessionId}/invigilators/${userId}`);
}
