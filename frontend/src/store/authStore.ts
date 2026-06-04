import { create } from 'zustand';
import { tokenStore } from '@/lib/secureStore';

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  pictureUrl?: string | null;
  role: string;
};

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  /** Persist tokens and mark the session authenticated (call after Google login). */
  setSession: (
    user: AuthUser,
    tokens: { accessToken: string; refreshToken: string },
  ) => Promise<void>;
  signOut: () => Promise<void>;
  /** Restore auth status from secure storage on app start. */
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  async setSession(user, tokens) {
    await tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, status: 'authenticated' });
  },
  async signOut() {
    await tokenStore.clear();
    set({ user: null, status: 'unauthenticated' });
  },
  async hydrate() {
    const access = await tokenStore.getAccess();
    set({ status: access ? 'authenticated' : 'unauthenticated' });
  },
}));
