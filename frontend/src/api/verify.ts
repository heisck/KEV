import { api } from '@/api/client';
import { FaceVerifyResponseSchema, type FaceVerifyResponse } from '@/api/schemas';

export type ProbeImage = { uri: string; name: string; type: string };

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
