import { api, CSRF_HEADER } from './client';
import type { Session } from './types';

export interface RegisterInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<Session>('/auth/login', { email, password });
  return data;
}

export async function loginWithGoogle(idToken: string) {
  const { data } = await api.post<Session>('/auth/google', { idToken });
  return data;
}

export async function register(input: RegisterInput) {
  const { data } = await api.post<Session>('/auth/register', input);
  return data;
}

export async function logout() {
  await api.post('/auth/logout', null, { headers: { [CSRF_HEADER]: '1' } });
}

export async function logoutAll() {
  await api.post('/auth/logout-all');
}

export async function verifyEmail(token: string) {
  await api.post('/auth/verify-email', { token });
}

export async function resendVerifyEmail() {
  await api.post('/auth/verify-email/resend');
}

export async function forgotPassword(email: string) {
  await api.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string) {
  await api.post('/auth/reset-password', { token, password });
}
