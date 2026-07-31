import { z } from 'zod';

import { api } from '@/api/client';
import { StudentReportSchema, type StudentReport } from '@/api/schemas';

export type CreateStudentReportInput = {
  sessionId?: number;
  studentId?: number;
  message: string;
};

const CreateStudentReportInputSchema = z.object({
  sessionId: z.number().int().positive().optional(),
  studentId: z.number().int().positive().optional(),
  message: z.string().trim().min(1).max(2000),
});

export async function listReports(): Promise<StudentReport[]> {
  const response = await api.get('/api/reports');
  return z.array(StudentReportSchema).parse(response.data);
}

export async function createReport(input: CreateStudentReportInput): Promise<StudentReport> {
  const response = await api.post('/api/reports', CreateStudentReportInputSchema.parse(input));
  return StudentReportSchema.parse(response.data);
}

export async function markReportRead(id: number): Promise<void> {
  await api.post(`/api/reports/${id}/read`);
}

export async function markAllReportsRead(): Promise<void> {
  await api.post('/api/reports/read-all');
}

export async function markReportsRead(ids: number[]): Promise<void> {
  await Promise.all(ids.map(markReportRead));
}
