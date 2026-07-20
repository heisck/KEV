import { api, CORRELATION_HEADER, setOnAuthExpired } from '@/api/client';

describe('api client', () => {
  it('is configured with the backend base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8080');
  });

  it('exposes the correlation-id header name shared with the backend', () => {
    expect(CORRELATION_HEADER).toBe('X-Correlation-Id');
  });

  it('accepts and clears an auth-expired handler without throwing', () => {
    const handler = jest.fn();
    expect(() => setOnAuthExpired(handler)).not.toThrow();
    expect(() => setOnAuthExpired(null)).not.toThrow();
  });
});
