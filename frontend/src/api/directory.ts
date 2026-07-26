import { api } from '@/api/client';
import { StudentRecordSchema, type StudentRecord } from '@/api/schemas';
import { lookupStudentOffline } from '@/services/syncService';

export async function lookupStudent(
  indexNumber: string,
  sessionId?: string,
): Promise<StudentRecord> {
  try {
    const res = await api.get(`/api/directory/students/${encodeURIComponent(indexNumber)}`);
    return StudentRecordSchema.parse(res.data);
  } catch (error) {
    const cached = await lookupStudentOffline(indexNumber, sessionId);
    if (cached) {
      return {
        id: Number(cached.id) || 1,
        indexNumber: cached.indexNumber,
        fullName: `${cached.firstName} ${cached.lastName}`,
        programme: 'Computer Science',
        level: 300,
        photoUrl: cached.imageBase64 || cached.imageUrl || '',
        enrolled: true,
        feesStatus: 'PAID',
        eligible: true,
        courses: [],
      };
    }
    throw error;
  }
}
