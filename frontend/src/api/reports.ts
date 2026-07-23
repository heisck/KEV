import { z } from 'zod';

import { api } from '@/api/client';
import { StudentReportSchema, type StudentReport } from '@/api/schemas';

export type CreateStudentReportInput = {
  sessionId?: number | null;
  studentId?: number;
  message: string;
};

export async function listReports(): Promise<StudentReport[]> {
  const response = await api.get('/api/reports');
  return z.array(StudentReportSchema).parse(response.data);
}

export async function createReport(input: CreateStudentReportInput): Promise<StudentReport> {
  const response = await api.post('/api/reports', input);
  return StudentReportSchema.parse(response.data);
}

export async function markReportRead(id: number): Promise<void> {
  await api.post(`/api/reports/${id}/read`);
}

export async function markAllReportsRead(): Promise<void> {
  await api.post('/api/reports/read-all');
}

export async function markReportsRead(_ids?: number[]): Promise<void> {
  await markAllReportsRead();
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/api/reports/${id}`);
}
