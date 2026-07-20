import { api, CORRELATION_HEADER, isHandledApiError, setOnAuthExpired } from '@/api/client';

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

  it('treats duplicate attendance as a scanner outcome, not a global API error', () => {
    expect(
      isHandledApiError({
        config: { url: '/api/sessions/1/attendance' },
        response: { status: 409, data: { detail: 'Student already checked in' } },
      }),
    ).toBe(true);
  });

  it('lets the manual scanner render a missing student inline', () => {
    expect(
      isHandledApiError({
        config: { url: '/api/directory/students/6180724' },
        response: { status: 404, data: { detail: 'Student not found: 6180724' } },
      }),
    ).toBe(true);
  });
});
