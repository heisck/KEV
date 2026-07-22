import { api } from '@/api/client';
import { checkIn, removeAttendance, restoreAttendance } from '@/api/attendance';
import { attendanceDto } from './fixtures';

jest.mock('@/api/client', () => ({
  api: { post: jest.fn(), delete: jest.fn() },
}));

const post = api.post as jest.Mock;
const del = api.delete as jest.Mock;

describe('attendance API', () => {
  beforeEach(() => {
    post.mockReset();
    del.mockReset();
  });

  it('checks a student in with the chosen method', async () => {
    post.mockResolvedValue({ data: attendanceDto });

    await expect(checkIn(7, { indexNumber: '6180724', method: 'MANUAL' })).resolves.toEqual(
      attendanceDto,
    );
    expect(post).toHaveBeenCalledWith('/api/sessions/7/attendance', {
      indexNumber: '6180724',
      method: 'MANUAL',
    });
  });

  it('removes an attendance record', async () => {
    del.mockResolvedValue({ data: { ...attendanceDto, status: 'REMOVED' } });

    const result = await removeAttendance(7, 11);
    expect(result.status).toBe('REMOVED');
    expect(del).toHaveBeenCalledWith('/api/sessions/7/attendance/11');
  });

  it('restores a removed attendance record', async () => {
    post.mockResolvedValue({ data: attendanceDto });

    await expect(restoreAttendance(7, 11)).resolves.toEqual(attendanceDto);
    expect(post).toHaveBeenCalledWith('/api/sessions/7/attendance/11/restore');
  });

  it('rejects a malformed attendance response', async () => {
    post.mockResolvedValue({ data: { id: 11 } });

    await expect(checkIn(7, { indexNumber: '6180724', method: 'FACE' })).rejects.toThrow();
  });
});
