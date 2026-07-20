import { create } from 'zustand';
import * as authApi from '@/api/auth';
import type { AuthResponse } from '@/api/schemas';
import { tokenStore } from '@/lib/secureStore';

export type AuthRole = 'USER' | 'LECTURER' | 'ADMIN';
export type AuthPlan = 'FREE' | 'PREMIUM';

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  pictureUrl?: string | null;
  role: AuthRole;
  plan: AuthPlan;
};

/** Input to setSession — role/plan default to 'USER'/'FREE' when absent. */
type AuthUserInput = Omit<AuthUser, 'role' | 'plan'> & Partial<Pick<AuthUser, 'role' | 'plan'>>;

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  /** Persist tokens and mark the session authenticated (call after Google login). */
  setSession: (
    user: AuthUserInput,
    tokens: { accessToken: string; refreshToken: string },
  ) => Promise<void>;
  /** Local profile edit until a PATCH /me endpoint exists. */
  updateProfile: (patch: Partial<Pick<AuthUser, 'displayName' | 'email'>>) => void;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signInWithAppleIdToken: (identityToken: string, fullName?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  /** Drop to signed-out after the API client's refresh path fails (tokens already cleared). */
  sessionExpired: () => void;
  /** Restore auth status from secure storage on app start. */
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => {
  const applyAuth = ({ user, accessToken, refreshToken }: AuthResponse) =>
    get().setSession(user, { accessToken, refreshToken });

  return {
    user: null,
    status: 'idle',
    async setSession(user, tokens) {
      await tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
      set({
        user: { ...user, role: user.role ?? 'USER', plan: user.plan ?? 'FREE' },
        status: 'authenticated',
      });
    },
    updateProfile(patch) {
      const current = get().user;
      if (!current) return;
      set({
        user: {
          ...current,
          displayName: patch.displayName !== undefined ? patch.displayName : current.displayName,
          email: patch.email !== undefined ? patch.email : current.email,
        },
      });
    },
    async signInWithPassword(email, password) {
      await applyAuth(await authApi.login(email, password));
    },
    async signInWithGoogleIdToken(idToken) {
      await applyAuth(await authApi.loginWithGoogle(idToken));
    },
    async signInWithAppleIdToken(identityToken, fullName) {
      await applyAuth(await authApi.loginWithApple(identityToken, fullName));
    },
    async signOut() {
      await tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    },
    sessionExpired() {
      // Tokens are cleared by the client interceptor; just reflect the state so
      // the route guards redirect to sign-in. No-op if already signed out.
      if (get().status !== 'unauthenticated') {
        set({ user: null, status: 'unauthenticated' });
      }
    },
    async hydrate() {
      const access = await tokenStore.getAccess();
      if (!access) {
        set({ status: 'unauthenticated' });
        return;
      }
      set({ status: 'authenticated' });
      // Restore the profile (role/plan drive tab visibility). Best-effort:
      // offline keeps the token-based session; the 401-refresh path in the
      // api client handles expiry on the next request.
      try {
        const me = await authApi.me();
        set({
          user: {
            id: me.id,
            email: me.email,
            displayName: me.displayName,
            pictureUrl: me.pictureUrl,
            role: me.role,
            plan: me.plan,
          },
        });
      } catch {
        // keep session; profile loads on next successful request
      }
    },
  };
});
