import { api } from '@/api/client';
import {
  FaceIdentifyResponseSchema,
  FaceVerifyResponseSchema,
  type FaceIdentifyResponse,
  type FaceVerifyResponse,
} from '@/api/schemas';

export type ProbeImage = { uri: string; name: string; type: string };

/**
 * Identify a captured face against the session roster (1:N) — no index number needed.
 * The roster's reference embeddings are precomputed at session creation, so this is a
 * single model call regardless of how many students are in the hall.
 */
export async function identifyFace(
  sessionId: string,
  probe: ProbeImage,
): Promise<FaceIdentifyResponse> {
  const form = new FormData();
  form.append('probe', probe as unknown as Blob);
  form.append('sessionId', sessionId);
  const res = await api.post('/api/verify/face/identify', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return FaceIdentifyResponseSchema.parse(res.data);
}

/** Upload a probe image + index number for face verification (multipart). */
export async function verifyFace(
  indexNumber: string,
  probe: ProbeImage,
): Promise<FaceVerifyResponse> {
  const form = new FormData();
  // React Native FormData accepts {uri, name, type} file descriptors.
  form.append('probe', probe as unknown as Blob);
  form.append('indexNumber', indexNumber);
  const res = await api.post('/api/verify/face', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return FaceVerifyResponseSchema.parse(res.data);
}
