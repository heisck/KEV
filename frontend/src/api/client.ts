import { create, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as Crypto from 'expo-crypto';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { tokenStore } from '@/lib/secureStore';
import { toast } from '@/lib/toast';

export const CORRELATION_HEADER = 'X-Correlation-Id';

type ApiErrorShape = {
  config?: { url?: string };
  response?: { data?: unknown; status?: number };
};

/** Scanner conflicts & handled queries are quiet, so the global client stays clean. */
export function isHandledApiError(error: ApiErrorShape): boolean {
  const status = error.response?.status;
  const url = error.config?.url;
  if (url?.endsWith('/api/auth/me') || url?.endsWith('/api/auth/refresh')) return true;
  if (status === 401) return true;
  if (
    status === 404 &&
    (url?.includes('/api/directory/students/') ||
      url?.includes('/api/sessions/') ||
      url?.includes('/api/chat/'))
  )
    return true;
  if (status !== 409 || !url?.endsWith('/attendance')) return false;
  const data = error.response?.data;
  return (
    typeof data === 'object' &&
    data !== null &&
    'detail' in data &&
    data.detail === 'Student already checked in'
  );
}

/**
 * Called when the refresh path gives up (invalid/expired refresh token) so the
 * app can drop to the signed-out state. Registered by the auth layer to avoid a
 * circular import between the client and the auth store.
 */
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(handler: (() => void) | null): void {
  onAuthExpired = handler;
}

/** Shared axios instance. Types for responses come from @kev/api-types. */
const apiConfig = {
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
};

export const api = create(apiConfig);
const authApi = create(apiConfig);

// Attach the bearer token and a per-request correlation id (propagated to the backend).
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStore.getAccess();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  config.headers.set(CORRELATION_HEADER, Crypto.randomUUID());
  return config;
});

// Single-flight refresh: on a 401, refresh once and replay the original request.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await authApi.post('/api/auth/refresh', { refreshToken });
    const next = res.data?.accessToken as string | undefined;
    if (!next) return null;
    await tokenStore.setTokens(next, refreshToken);
    return next;
  } catch {
    return null;
  }
}

/** Human-readable toast copy for a failed request, keyed by what went wrong. */
function toastMessage(error: AxiosError): string {
  const status = error.response?.status;
  if (status === undefined) return 'Network error — check your connection';
  if (status === 401) return 'Please sign in to continue';
  if (status === 403) return "You don't have access to that";
  if (status >= 500) return 'Something went wrong on our end. Try again.';
  return 'Request failed. Please try again.';
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers.set('Authorization', `Bearer ${token}`);
        return api(original);
      }
      // Refresh failed — clear tokens and notify the app to sign out so the
      // route guards redirect to sign-in instead of looping on 401s.
      await tokenStore.clear();
      onAuthExpired?.();
    }

    if (!isHandledApiError(error)) {
      logger.error('API request failed', {
        url: error.config?.url,
        status: error.response?.status,
      });
      toast.error(toastMessage(error));
    }
    return Promise.reject(error);
  },
);
