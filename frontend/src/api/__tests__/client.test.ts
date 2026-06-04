import { api, CORRELATION_HEADER } from '@/api/client';

describe('api client', () => {
  it('is configured with the backend base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080');
  });

  it('exposes the correlation-id header name shared with the backend', () => {
    expect(CORRELATION_HEADER).toBe('X-Correlation-Id');
  });
});
