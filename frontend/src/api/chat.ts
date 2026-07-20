import { z } from 'zod';
import { api } from '@/api/client';
import { UserDtoSchema, type UserDto } from '@/api/schemas';

/** Lecturer/admin directory for the chat picker — not admin-gated (any signed-in user). */
export async function listLecturers(q?: string): Promise<UserDto[]> {
  const res = await api.get('/api/chat/lecturers', { params: q ? { q } : undefined });
  return z.array(UserDtoSchema).parse(res.data);
}
