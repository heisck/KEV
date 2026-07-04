import { api } from '@/api/client';
import { AuthResponseSchema, UserDtoSchema, type AuthResponse, type UserDto } from '@/api/schemas';

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await api.post('/api/auth/google', { idToken });
  return AuthResponseSchema.parse(res.data);
}

export async function loginWithApple(
  identityToken: string,
  fullName?: string | null,
): Promise<AuthResponse> {
  const res = await api.post('/api/auth/apple', { identityToken, fullName: fullName ?? null });
  return AuthResponseSchema.parse(res.data);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/api/auth/login', { email, password });
  return AuthResponseSchema.parse(res.data);
}

export async function me(): Promise<UserDto> {
  const res = await api.get('/api/auth/me');
  return UserDtoSchema.parse(res.data);
}
