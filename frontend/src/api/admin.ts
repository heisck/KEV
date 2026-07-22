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

export async function listLecturers(): Promise<UserDto[]> {
  const res = await api.get('/api/admin/lecturers');
  return z.array(UserDtoSchema).parse(res.data);
}

export async function createLecturer(req: {
  fullName: string;
  lecturerId: string;
  universityEmail: string;
  personalEmail: string;
  phone: string;
}): Promise<UserDto> {
  const res = await api.post('/api/admin/lecturers', req);
  return UserDtoSchema.parse(res.data);
}

export async function updateLecturer(
  id: string,
  req: {
    fullName: string;
    lecturerId: string;
    universityEmail: string;
    personalEmail: string;
    phone: string;
    status?: string;
    active?: boolean;
  },
): Promise<UserDto> {
  const res = await api.put(`/api/admin/lecturers/${id}`, req);
  return UserDtoSchema.parse(res.data);
}

export async function disableLecturer(id: string): Promise<void> {
  await api.delete(`/api/admin/lecturers/${id}`);
}

export async function listAdmins(): Promise<UserDto[]> {
  const res = await api.get('/api/admin/admins');
  return z.array(UserDtoSchema).parse(res.data);
}

export async function createAdmin(req: {
  fullName: string;
  email: string;
  password: string;
}): Promise<UserDto> {
  const res = await api.post('/api/admin/admins', req);
  return UserDtoSchema.parse(res.data);
}

export async function unassignInvigilator(sessionId: number, userId: string): Promise<void> {
  await api.delete(`/api/admin/sessions/${sessionId}/invigilators/${userId}`);
}
