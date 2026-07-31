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

export const CreateLecturerRequestSchema = z.object({
  fullName: z.string().trim().min(1),
  lecturerId: z.string().trim().min(1),
  universityEmail: z.string().trim().pipe(z.email('Enter a valid university email')),
  personalEmail: z.string().trim().pipe(z.email('Enter a valid personal email')),
  phone: z.string().trim().min(1),
});
export type CreateLecturerRequest = z.infer<typeof CreateLecturerRequestSchema>;

export const CreateAdminRequestSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().pipe(z.email('Enter a valid email')),
  personalEmail: z.string().trim().pipe(z.email('Enter a valid personal email')),
  phone: z.string().trim().optional(),
});
export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export async function listInvigilators(): Promise<UserDto[]> {
  const res = await api.get('/api/admin/invigilators');
  return z.array(UserDtoSchema).parse(res.data);
}

export async function listAdminSessions(): Promise<SessionDto[]> {
  const res = await api.get('/api/admin/sessions');
  return z.array(SessionDtoSchema).parse(res.data);
}

export async function listLecturers(): Promise<UserDto[]> {
  const res = await api.get('/api/admin/lecturers');
  return z.array(UserDtoSchema).parse(res.data);
}

export async function listAdmins(): Promise<UserDto[]> {
  const res = await api.get('/api/admin/admins');
  return z.array(UserDtoSchema).parse(res.data);
}

export async function createLecturer(input: CreateLecturerRequest): Promise<UserDto> {
  const request = CreateLecturerRequestSchema.parse(input);
  const res = await api.post('/api/admin/lecturers', request);
  return UserDtoSchema.parse(res.data);
}

export async function createAdmin(input: CreateAdminRequest): Promise<UserDto> {
  const request = CreateAdminRequestSchema.parse(input);
  const res = await api.post('/api/admin/admins', request);
  return UserDtoSchema.parse(res.data);
}

export async function removeLecturer(id: string): Promise<void> {
  await api.delete(`/api/admin/lecturers/${id}`);
}

export async function removeAdmin(id: string): Promise<void> {
  await api.delete(`/api/admin/admins/${id}`);
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
