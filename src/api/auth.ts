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

export async function register(input: RegisterInput) {
  const { data } = await api.post<Session>('/auth/register', input);
  return data;
}

export async function logout() {
  await api.post('/auth/logout', null, { headers: { [CSRF_HEADER]: '1' } });
}
