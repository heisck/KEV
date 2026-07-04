import { api } from '@/api/client';
import { AttendanceDtoSchema, type AttendanceDto, type CheckInMethod } from '@/api/schemas';

export type CheckInInput = { indexNumber: string; method: CheckInMethod };

export async function checkIn(sessionId: number, input: CheckInInput): Promise<AttendanceDto> {
  const res = await api.post(`/api/sessions/${sessionId}/attendance`, input);
  return AttendanceDtoSchema.parse(res.data);
}

export async function removeAttendance(
  sessionId: number,
  attendanceId: number,
): Promise<AttendanceDto> {
  const res = await api.delete(`/api/sessions/${sessionId}/attendance/${attendanceId}`);
  return AttendanceDtoSchema.parse(res.data);
}

export async function restoreAttendance(
  sessionId: number,
  attendanceId: number,
): Promise<AttendanceDto> {
  const res = await api.post(`/api/sessions/${sessionId}/attendance/${attendanceId}/restore`);
  return AttendanceDtoSchema.parse(res.data);
}
