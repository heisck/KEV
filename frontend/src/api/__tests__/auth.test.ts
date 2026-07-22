import { api } from '@/api/client';
import { login, loginWithApple, loginWithGoogle, me, updateCredentials } from '@/api/auth';
import { authResponse, userDto } from './fixtures';

jest.mock('@/api/client', () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const get = api.get as jest.Mock;
const post = api.post as jest.Mock;
const put = api.put as jest.Mock;

describe('auth API', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
  });

  it('exchanges a Google id token for an auth response', async () => {
    post.mockResolvedValue({ data: authResponse });

    await expect(loginWithGoogle('google-id-token')).resolves.toEqual(authResponse);
    expect(post).toHaveBeenCalledWith('/api/auth/google', { idToken: 'google-id-token' });
  });

  it('exchanges an Apple identity token, defaulting fullName to null', async () => {
    post.mockResolvedValue({ data: authResponse });

    await loginWithApple('apple-token');
    expect(post).toHaveBeenCalledWith('/api/auth/apple', {
      identityToken: 'apple-token',
      fullName: null,
    });
  });

  it('passes through an Apple fullName when supplied', async () => {
    post.mockResolvedValue({ data: authResponse });

    await loginWithApple('apple-token', 'Ama Mensah');
    expect(post).toHaveBeenCalledWith('/api/auth/apple', {
      identityToken: 'apple-token',
      fullName: 'Ama Mensah',
    });
  });

  it('logs in with email and password', async () => {
    post.mockResolvedValue({ data: authResponse });

    await expect(login('a@b.com', 'pw')).resolves.toEqual(authResponse);
    expect(post).toHaveBeenCalledWith('/api/auth/login', { email: 'a@b.com', password: 'pw' });
  });

  it('fetches the current user', async () => {
    get.mockResolvedValue({ data: userDto });

    await expect(me()).resolves.toEqual(userDto);
    expect(get).toHaveBeenCalledWith('/api/auth/me');
  });

  it('updates credentials via PUT', async () => {
    put.mockResolvedValue({ data: userDto });
    const input = { currentPassword: 'old', newPassword: 'new' };

    await expect(updateCredentials(input)).resolves.toEqual(userDto);
    expect(put).toHaveBeenCalledWith('/api/auth/credentials', input);
  });

  it('rejects a malformed auth response', async () => {
    post.mockResolvedValue({ data: { accessToken: 'x' } });

    await expect(login('a@b.com', 'pw')).rejects.toThrow();
  });
});
