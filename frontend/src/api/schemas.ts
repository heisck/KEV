import { isAxiosError } from 'axios';
import { z } from 'zod';

/** Zod schemas mirroring the backend DTOs — parsed at every API-module boundary. */

export const FeesStatusSchema = z.enum(['PAID', 'PARTIAL', 'OWING']);
export type FeesStatus = z.infer<typeof FeesStatusSchema>;

export const CheckInMethodSchema = z.enum(['NFC', 'QR', 'MANUAL', 'FACE']);
export type CheckInMethod = z.infer<typeof CheckInMethodSchema>;

export const StudentRecordSchema = z.object({
  id: z.number(),
  indexNumber: z.string(),
  fullName: z.string(),
  programme: z.string(),
  level: z.number(),
  photoUrl: z.string(),
  enrolled: z.boolean(),
  feesStatus: FeesStatusSchema,
  eligible: z.boolean(),
  courses: z.array(z.string()).default([]),
});
export type StudentRecord = z.infer<typeof StudentRecordSchema>;

export const UserDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
  pictureUrl: z.string().nullable(),
  role: z.enum(['USER', 'LECTURER', 'ADMIN']),
  plan: z.enum(['FREE', 'PREMIUM']),
  lecturerId: z.string().nullable().optional(),
  personalEmail: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  active: z.boolean().nullable().optional(),
});
export type UserDto = z.infer<typeof UserDtoSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserDtoSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const SessionDtoSchema = z.object({
  id: z.number(),
  sessionCode: z.string(),
  sessionPassword: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  building: z.string(),
  floor: z.string().nullable(),
  room: z.string().nullable(),
  courseCodes: z.array(z.string()),
  indexRangeStart: z.string().nullable(),
  indexRangeEnd: z.string().nullable(),
  examDate: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  verificationMethods: z.array(z.string()).nullable().optional(),
  status: z.enum(['ACTIVE', 'ENDED', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  checkedInCount: z.number(),
  invigilatorCount: z.number(),
});
export type SessionDto = z.infer<typeof SessionDtoSchema>;

export const InvigilatorDtoSchema = z.object({
  userId: z.string(),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  pictureUrl: z.string().nullable(),
  joinedAt: z.string(),
  assignedByAdmin: z.boolean(),
  role: z.string().nullable().optional(),
});
export type InvigilatorDto = z.infer<typeof InvigilatorDtoSchema>;

export const AttendanceDtoSchema = z.object({
  id: z.number(),
  student: StudentRecordSchema,
  method: CheckInMethodSchema,
  status: z.enum(['CHECKED_IN', 'REMOVED']),
  checkedInAt: z.string(),
  removedAt: z.string().nullable(),
});
export type AttendanceDto = z.infer<typeof AttendanceDtoSchema>;

export const SessionDetailDtoSchema = z.object({
  session: SessionDtoSchema,
  invigilators: z.array(InvigilatorDtoSchema),
  attendance: z.array(AttendanceDtoSchema),
});
export type SessionDetailDto = z.infer<typeof SessionDetailDtoSchema>;

export const SessionSummaryDtoSchema = z.object({
  checkedIn: z.number(),
  removed: z.number(),
  byMethod: z.record(z.string(), z.number()),
  recent: z.array(AttendanceDtoSchema),
});
export type SessionSummaryDto = z.infer<typeof SessionSummaryDtoSchema>;

export const FaceVerifyResponseSchema = z.object({
  indexNumber: z.string(),
  similarity: z.number(),
  match: z.boolean(),
  student: StudentRecordSchema,
});
export type FaceVerifyResponse = z.infer<typeof FaceVerifyResponseSchema>;

/** RFC 7807 ProblemDetail body — extension members land either top-level or in `properties`. */
const ProblemDetailSchema = z
  .object({
    title: z.string().optional(),
    detail: z.string().optional(),
    code: z.string().optional(),
    upgradeHint: z.string().optional(),
    properties: z
      .object({ code: z.string().optional(), upgradeHint: z.string().optional() })
      .loose()
      .optional(),
  })
  .loose();

/** Safely extract the ProblemDetail body from an axios error, or null. */
export function getProblemDetail(
  error: unknown,
): { title?: string; detail?: string; upgradeHint?: string } | null {
  if (!isAxiosError(error) || !error.response?.data) return null;
  const parsed = ProblemDetailSchema.safeParse(error.response.data);
  if (!parsed.success) return null;
  const { title, detail, upgradeHint, properties } = parsed.data;
  return { title, detail, upgradeHint: upgradeHint ?? properties?.upgradeHint };
}

/** True when the backend rejected with the 403 plan-limit ProblemDetail. */
export function isPlanLimitError(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 403) return false;
  const parsed = ProblemDetailSchema.safeParse(error.response.data);
  if (!parsed.success) return false;
  return (parsed.data.code ?? parsed.data.properties?.code) === 'plan-limit';
}
