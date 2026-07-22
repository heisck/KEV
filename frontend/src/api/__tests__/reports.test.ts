import { api } from '@/api/client';
import {
  createReport,
  listReports,
  markAllReportsRead,
  markReportRead,
  markReportsRead,
} from '@/api/reports';
import { studentReport } from './fixtures';

jest.mock('@/api/client', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

const get = api.get as jest.Mock;
const post = api.post as jest.Mock;

describe('reports API', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('lists reports as an array of parsed reports', async () => {
    get.mockResolvedValue({ data: [studentReport] });

    await expect(listReports()).resolves.toEqual([studentReport]);
    expect(get).toHaveBeenCalledWith('/api/reports');
  });

  it('creates a report from the given input', async () => {
    post.mockResolvedValue({ data: studentReport });
    const input = { sessionId: 7, studentId: 1, message: 'Flagged for review.' };

    await expect(createReport(input)).resolves.toEqual(studentReport);
    expect(post).toHaveBeenCalledWith('/api/reports', input);
  });

  it('marks a single report read', async () => {
    post.mockResolvedValue({ data: {} });

    await markReportRead(5);
    expect(post).toHaveBeenCalledWith('/api/reports/5/read');
  });

  it('marks all reports read', async () => {
    post.mockResolvedValue({ data: {} });

    await markAllReportsRead();
    expect(post).toHaveBeenCalledWith('/api/reports/read-all');
  });

  it('marks a batch of reports read, one request per id', async () => {
    post.mockResolvedValue({ data: {} });

    await markReportsRead([1, 2, 3]);
    expect(post).toHaveBeenCalledTimes(3);
    expect(post.mock.calls.map((c) => c[0])).toEqual([
      '/api/reports/1/read',
      '/api/reports/2/read',
      '/api/reports/3/read',
    ]);
  });

  it('rejects a malformed report list', async () => {
    get.mockResolvedValue({ data: [{ id: 5 }] });

    await expect(listReports()).rejects.toThrow();
  });
});
