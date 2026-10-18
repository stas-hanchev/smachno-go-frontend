import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';
import type { ApiErrorBody, Session } from './types';

export const CSRF_HEADER = 'x-sg-csrf';

export const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

let refreshing: Promise<Session | null> | null = null;

export function refreshSession(): Promise<Session | null> {
  refreshing ??= axios
    .post<Session>('/api/v1/auth/refresh', null, {
      withCredentials: true,
      headers: { [CSRF_HEADER]: '1' },
    })
    .then(({ data }) => {
      useAuthStore.getState().setSession(data);
      return data;
    })
    .catch(() => {
      useAuthStore.getState().clear();
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  const hadToken = Boolean(config?.headers?.Authorization);
  if (error.response?.status !== 401 || !config || config._retried || !hadToken) throw error;
  config._retried = true;
  const session = await refreshSession();
  if (!session) throw error;
  config.headers = { ...config.headers, Authorization: `Bearer ${session.accessToken}` };
  return api(config);
});

export function errorMessage(error: unknown, fallback = 'Щось пішло не так. Спробуйте ще раз.') {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) return body.error.message;
    if (!error.response) return 'Немає зʼєднання з сервером';
  }
  return fallback;
}
