import { useAuthStore } from '@/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: 'idle' });
  });

  it('hydrate marks unauthenticated when no token is stored', async () => {
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('setSession stores the user and authenticates', async () => {
    await useAuthStore
      .getState()
      .setSession(
        { id: '1', email: 'rebecca@example.com', role: 'USER' },
        { accessToken: 'access', refreshToken: 'refresh' },
      );
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user?.email).toBe('rebecca@example.com');
  });

  it('signOut clears the session', async () => {
    await useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
  });
});
