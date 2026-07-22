import { api } from '@/api/client';
import {
  assignInvigilator,
  getSessionReport,
  listAdminSessions,
  listInvigilators,
  unassignInvigilator,
} from '@/api/admin';
import { invigilatorDto, sessionDto, sessionSummaryDto, userDto } from './fixtures';

jest.mock('@/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const get = api.get as jest.Mock;
const post = api.post as jest.Mock;
const del = api.delete as jest.Mock;

describe('admin API', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    del.mockReset();
  });

  it('lists invigilators', async () => {
    get.mockResolvedValue({ data: [userDto] });

    await expect(listInvigilators()).resolves.toEqual([userDto]);
    expect(get).toHaveBeenCalledWith('/api/admin/invigilators');
  });

  it('lists admin sessions', async () => {
    get.mockResolvedValue({ data: [sessionDto] });

    await expect(listAdminSessions()).resolves.toEqual([sessionDto]);
    expect(get).toHaveBeenCalledWith('/api/admin/sessions');
  });

  it('fetches a session report by id', async () => {
    get.mockResolvedValue({ data: sessionSummaryDto });

    await expect(getSessionReport(7)).resolves.toEqual(sessionSummaryDto);
    expect(get).toHaveBeenCalledWith('/api/admin/sessions/7/report');
  });

  it('assigns an invigilator to a session', async () => {
    post.mockResolvedValue({ data: invigilatorDto });

    await expect(assignInvigilator(7, invigilatorDto.userId)).resolves.toEqual(invigilatorDto);
    expect(post).toHaveBeenCalledWith('/api/admin/sessions/7/invigilators', {
      userId: invigilatorDto.userId,
    });
  });

  it('unassigns an invigilator from a session', async () => {
    del.mockResolvedValue({ data: {} });

    await unassignInvigilator(7, invigilatorDto.userId);
    expect(del).toHaveBeenCalledWith(`/api/admin/sessions/7/invigilators/${invigilatorDto.userId}`);
  });

  it('rejects a malformed invigilator list', async () => {
    get.mockResolvedValue({ data: [{ email: 5 }] });

    await expect(listInvigilators()).rejects.toThrow();
  });
});
