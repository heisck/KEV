import { api } from '@/api/client';
import { lookupStudent } from '@/api/directory';
import { studentRecord } from './fixtures';

jest.mock('@/api/client', () => ({ api: { get: jest.fn() } }));

const get = api.get as jest.Mock;

describe('directory API', () => {
  beforeEach(() => get.mockReset());

  it('fetches a student by index number and parses the record', async () => {
    get.mockResolvedValue({ data: studentRecord });

    await expect(lookupStudent('6180724')).resolves.toEqual(studentRecord);
    expect(get).toHaveBeenCalledWith('/api/directory/students/6180724');
  });

  it('URL-encodes the index number', async () => {
    get.mockResolvedValue({ data: studentRecord });

    await lookupStudent('61 807/24');
    expect(get).toHaveBeenCalledWith('/api/directory/students/61%20807%2F24');
  });

  it('rejects a malformed student response', async () => {
    get.mockResolvedValue({ data: { id: 'not-a-number' } });

    await expect(lookupStudent('6180724')).rejects.toThrow();
  });
});
