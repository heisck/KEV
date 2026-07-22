import { api } from '@/api/client';
import { verifyFace, type ProbeImage } from '@/api/verify';
import { faceVerifyResponse } from './fixtures';

jest.mock('@/api/client', () => ({ api: { post: jest.fn() } }));

const post = api.post as jest.Mock;

const probe: ProbeImage = { uri: 'file:///probe.jpg', name: 'probe.jpg', type: 'image/jpeg' };

describe('verify API', () => {
  beforeEach(() => post.mockReset());

  it('posts a multipart form with the probe image and index number', async () => {
    post.mockResolvedValue({ data: faceVerifyResponse });

    await expect(verifyFace('6180724', probe)).resolves.toEqual(faceVerifyResponse);

    const [url, form, config] = post.mock.calls[0];
    expect(url).toBe('/api/verify/face');
    expect(form).toBeInstanceOf(FormData);
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });

  it('rejects a malformed verify response', async () => {
    post.mockResolvedValue({ data: { ...faceVerifyResponse, similarity: 'high' } });

    await expect(verifyFace('6180724', probe)).rejects.toThrow();
  });
});
