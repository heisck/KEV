import { api } from '@/api/client';
import { StudentRecordSchema, type StudentRecord } from '@/api/schemas';

export async function lookupStudent(indexNumber: string): Promise<StudentRecord> {
  const res = await api.get(`/api/directory/students/${encodeURIComponent(indexNumber)}`);
  return StudentRecordSchema.parse(res.data);
}
